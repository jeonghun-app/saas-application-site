'use client';

import React from 'react';
import { AuthProvider } from 'react-oidc-context';
import { useTenant } from './tenant-context';
import { ConfigParams } from '../types/tenant-config';

interface MultiTenantAuthProviderProps {
  children: React.ReactNode;
}

function createCognitoAuthConfig(configParams: ConfigParams, tenantId: string) {
  // Cognito App Client 도메인 생성 (올바른 형식)
  const cognitoDomain = `https://${configParams.appClientId}.auth.ap-northeast-2.amazoncognito.com`;
  
  const config = {
    authority: cognitoDomain, // Cognito App Client 도메인 사용
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
  const { tenantId, tenantConfig, loading } = useTenant();

  console.log('🔐 MultiTenantAuthProvider render:', { tenantId, hasConfig: !!tenantConfig, loading });

  // 테넌트 설정이 로드되지 않았으면 로딩 표시
  if (loading || !tenantId || !tenantConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">인증 설정을 준비하는 중...</p>
        </div>
      </div>
    );
  }

  // ConfigParams로부터 OIDC 설정 생성
  const configParams: ConfigParams = {
    authServer: tenantConfig.AUTH_SERVER,
    appClientId: tenantConfig.AUTH_CLIENT_ID,
    redirectUrl: tenantConfig.AUTH_REDIRECT_URI
  };

  const cognitoAuthConfig = createCognitoAuthConfig(configParams, tenantId);

  console.log('🔐 OIDC Auth Config:', cognitoAuthConfig);

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