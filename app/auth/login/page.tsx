'use client';

import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { Loader2, AlertCircle, Shield, LogOut, User } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const { tenantId, tenantConfig } = useTenant();
  const [error, setError] = useState<string | null>(null);

  // URL에서 에러 파라미터 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // URL에서 에러 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  console.log('🔐 LoginPage render:', { 
    authLoading: auth.isLoading,
    authError: auth.error,
    isAuthenticated: auth.isAuthenticated,
    tenantId,
    hasConfig: !!tenantConfig
  });

  // 인증 오류 처리
  useEffect(() => {
    if (auth.error) {
      console.error('🔐 Auth error:', auth.error);
      setError(`인증 오류: ${auth.error.message}`);
    }
  }, [auth.error]);

  // 인증 성공 시 대시보드로 리다이렉트
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      console.log('🔐 Authentication successful, redirecting to dashboard');
      console.log('🔐 User info:', {
        email: auth.user.profile?.email,
        name: auth.user.profile?.name,
        sub: auth.user.profile?.sub
      });
      
      // 대시보드로 리다이렉트 - 페이지 새로고침 없이 router 사용
      if (typeof window !== 'undefined') {
        const savedTenantId = localStorage.getItem('currentTenantId');
        if (savedTenantId) {
          window.location.href = `/${savedTenantId}/dashboard`;
        } else {
          window.location.href = '/select-tenant';
        }
      }
    }
  }, [auth.isAuthenticated, auth.user]);

  // 로딩 중
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            인증 처리 중...
          </h2>
          <p className="text-slate-600">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    );
  }

  // 인증 완료 - 사용자 정보 표시
  if (auth.isAuthenticated && auth.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
            <div className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                로그인 완료
              </h2>
              <p className="text-slate-600">
                {tenantConfig?.COMPANY_NAME || '테넌트'}에 성공적으로 로그인했습니다
              </p>
            </div>
            
            <div className="space-y-4">
              {/* 사용자 정보 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-700">
                  <p className="font-medium mb-2">사용자 정보</p>
                  <p><strong>이메일:</strong> {auth.user.profile?.email}</p>
                  <p><strong>이름:</strong> {auth.user.profile?.name || 'N/A'}</p>
                  <p><strong>사용자 ID:</strong> {auth.user.profile?.sub}</p>
                </div>
              </div>

              {/* 테넌트 정보 */}
              {tenantConfig && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-2">테넌트 정보</p>
                    <p><strong>테넌트 ID:</strong> {tenantConfig.TENANT_ID}</p>
                    <p><strong>회사명:</strong> {tenantConfig.COMPANY_NAME}</p>
                    <p><strong>플랜:</strong> {tenantConfig.PLAN}</p>
                  </div>
                </div>
              )}

              {/* 토큰 정보 (개발용) */}
              <details className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-slate-700">
                  토큰 정보 (개발용)
                </summary>
                <div className="mt-2 space-y-2 text-xs text-slate-600">
                  <div>
                    <p className="font-medium">ID Token:</p>
                    <p className="break-all bg-slate-100 p-2 rounded">{auth.user.id_token}</p>
                  </div>
                  <div>
                    <p className="font-medium">Access Token:</p>
                    <p className="break-all bg-slate-100 p-2 rounded">{auth.user.access_token}</p>
                  </div>
                  {auth.user.refresh_token && (
                    <div>
                      <p className="font-medium">Refresh Token:</p>
                      <p className="break-all bg-slate-100 p-2 rounded">{auth.user.refresh_token}</p>
                    </div>
                  )}
                </div>
              </details>

              {/* 액션 버튼들 */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                const savedTenantId = localStorage.getItem('currentTenantId');
                if (savedTenantId) {
                  window.location.href = `/${savedTenantId}/dashboard`;
                } else {
                  window.location.href = '/select-tenant';
                }
              }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  대시보드로 이동
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => auth.removeUser()}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/select-tenant'}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-xl transition-all duration-200"
                  >
                    테넌트 변경
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              AWS Cognito 로그인
            </h2>
            <p className="text-slate-600">
              {tenantConfig?.COMPANY_NAME || '테넌트'}에 로그인하세요
            </p>
          </div>
          <div className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {/* Tenant Info */}
            {tenantConfig && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-700">
                  <p className="font-medium">테넌트 정보</p>
                  <p>ID: {tenantConfig.TENANT_ID}</p>
                  <p>회사: {tenantConfig.COMPANY_NAME}</p>
                </div>
              </div>
            )}
            {/* Login Button */}
            <button
              onClick={async () => {
                try {
                  console.log('🔐 Starting signin redirect...');
                  await auth.signinRedirect();
                } catch (error) {
                  console.error('🔐 Signin redirect failed:', error);
                  setError('로그인 요청 중 오류가 발생했습니다.');
                }
              }}
              disabled={!tenantConfig || auth.isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {auth.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              <span>{auth.isLoading ? '로그인 중...' : 'Cognito로 로그인'}</span>
            </button>
            {/* Back Button */}
            <button
              onClick={() => window.location.href = '/select-tenant'}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              다른 테넌트 선택
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 