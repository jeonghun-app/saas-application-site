'use client';

import React from 'react';
import { AuthProvider } from 'react-oidc-context';
import { useTenant } from './tenant-context';
import { ConfigParams } from '../types/tenant-config';

interface MultiTenantAuthProviderProps {
  children: React.ReactNode;
}

function createCognitoAuthConfig(configParams: ConfigParams, tenantId: string) {
  // authServer에서 올바른 Cognito 도메인 추출
  // authServer 형식: https://cognito-idp.region.amazonaws.com/poolId 또는 https://domain.auth.region.amazoncognito.com
  let cognitoDomain = configParams.authServer;
  
  // Cognito Identity Pool URL인 경우 User Pool 도메인으로 변환
  if (configParams.authServer.includes('cognito-idp')) {
    // https://cognito-idp.region.amazonaws.com/poolId 형식에서 도메인 추출
    const matches = configParams.authServer.match(/https:\/\/cognito-idp\.([^.]+)\.amazonaws\.com\/(.+)/);
    if (matches) {
      const region = matches[1];
      // 기본 Cognito 도메인 형식으로 변환 (실제 환경에서는 사용자 풀 도메인을 사용해야 함)
      cognitoDomain = `https://${configParams.appClientId}.auth.${region}.amazoncognito.com`;
    }
  }
  
  // authServer가 이미 올바른 도메인 형식인 경우 그대로 사용
  if (!cognitoDomain.includes('.auth.') && !cognitoDomain.includes('cognito-idp')) {
    // 사용자 정의 도메인인 경우 그대로 사용
    cognitoDomain = configParams.authServer;
  }
  
  const config = {
    authority: cognitoDomain,
    client_id: configParams.appClientId,
    redirect_uri: configParams.redirectUrl,
    response_type: "code",
    scope: "email openid phone profile",
    // OIDC 추가 설정
    loadUserInfo: true,
    automaticSilentRenew: false,
    includeIdTokenInSilentRenew: true,
    // PKCE 설정 (Cognito가 요구할 수 있음)
    extraQueryParams: {},
    // 멀티테넌트를 위한 메타데이터
    metadata: {
      tenantId: tenantId,
      issuer: cognitoDomain,
      authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
      token_endpoint: `${cognitoDomain}/oauth2/token`,
      userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
      jwks_uri: `${cognitoDomain}/.well-known/jwks.json`,
      end_session_endpoint: `${cognitoDomain}/logout`
    }
  };
  
  console.log('🔐 Cognito Auth Config Details:', {
    originalAuthServer: configParams.authServer,
    generatedCognitoDomain: cognitoDomain,
    clientId: configParams.appClientId,
    redirectUri: configParams.redirectUrl,
    fullConfig: config
  });
  
  return config;
}

export function MultiTenantAuthProvider({ children }: MultiTenantAuthProviderProps) {
  const { tenantId, tenantConfig, loading, error } = useTenant();

  console.log('🔐 Simple AuthProvider:', { tenantId, hasConfig: !!tenantConfig, loading, error });

  // /select-tenant 페이지에서는 인증 검사를 우회
  if (typeof window !== 'undefined' && window.location.pathname === '/select-tenant') {
    console.log('🔐 On select-tenant page, bypassing auth checks');
    return <>{children}</>;
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">테넌트 설정을 로드하는 중...</p>
        </div>
      </div>
    );
  }

  // 오류 발생
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">설정 오류</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/select-tenant'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            테넌트 다시 선택
          </button>
        </div>
      </div>
    );
  }

  // 테넌트 ID가 없으면 선택 페이지로
  if (!tenantId) {
    console.log('🔐 No tenantId, redirecting to select-tenant');
    if (typeof window !== 'undefined') {
      window.location.href = '/select-tenant';
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">테넌트 선택 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  // 설정이 없으면 로딩
  if (!tenantConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">인증 설정을 준비하는 중...</p>
          <p className="text-sm text-slate-500 mt-2">테넌트 ID: {tenantId}</p>
        </div>
      </div>
    );
  }

  // OIDC 설정 생성 - Cognito 설정에 맞춰 tenantId 포함
  const configParams: ConfigParams = {
    authServer: tenantConfig.AUTH_SERVER,
    appClientId: tenantConfig.AUTH_CLIENT_ID,
    redirectUrl: `${window.location.origin}/?tenantId=${tenantId}`
  };

  const cognitoAuthConfig = createCognitoAuthConfig(configParams, tenantId);
  console.log('🔐 Creating AuthProvider with config (using simple logout):', cognitoAuthConfig);

  return (
    <AuthProvider {...cognitoAuthConfig}>
      {children}
    </AuthProvider>
  );
}

// 인증 상태를 확인하는 헬퍼 컴포넌트
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { tenantId } = useTenant();
  
  if (!tenantId) {
    // 테넌트가 선택되지 않았으면 테넌트 선택 페이지로
    if (typeof window !== 'undefined') {
      window.location.href = '/select-tenant';
    }
    return null;
  }

  return <>{children}</>;
} 