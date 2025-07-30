'use client';

import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { useLocaleNavigation } from '@/lib/utils/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const auth = useAuth();
  const { tenantConfig } = useTenant();
  const { redirectTo, locale } = useLocaleNavigation();

  console.log('🔐 AuthCallback render:', { 
    authLoading: auth.isLoading,
    authError: auth.error,
    isAuthenticated: auth.isAuthenticated,
    user: !!auth.user,
    locale
  });

  // 인증 성공 시 대시보드로 리다이렉트
  useEffect(() => {
    if (auth.isAuthenticated && auth.user && typeof window !== 'undefined') {
      console.log('🔐 Authentication successful, redirecting to dashboard');
      setTimeout(() => {
        const savedTenantId = localStorage.getItem('currentTenantId');
        if (savedTenantId) {
          // locale을 유지하면서 dashboard로 리다이렉트
          redirectTo(`/${savedTenantId}/dashboard`);
        } else {
          redirectTo('/select-tenant');
        }
      }, 1000);
    }
  }, [auth.isAuthenticated, auth.user, redirectTo, locale]);

  // 인증 오류 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (auth.error && !auth.isLoading && typeof window !== 'undefined') {
      console.error('🔐 Auth error, redirecting to login:', auth.error);
      setTimeout(() => {
        redirectTo('/auth/login?error=' + encodeURIComponent(auth.error?.message || 'Unknown error'));
      }, 3000);
    }
  }, [auth.error, auth.isLoading, redirectTo]);

  // 로딩 중인 경우
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            인증 처리 중
          </h2>
          <p className="text-slate-600">
            Cognito 인증을 처리하고 있습니다...
          </p>
          {tenantConfig && (
            <p className="text-sm text-slate-500 mt-2">
              테넌트: {tenantConfig.COMPANY_NAME}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 인증 오류가 있는 경우
  if (auth.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">인증 오류</h2>
              <p className="text-slate-600 mb-6">{auth.error?.message || 'Unknown error occurred'}</p>
              
              <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">로그인 페이지로 이동 중...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인증 성공한 경우
  if (auth.isAuthenticated && auth.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">로그인 성공!</h2>
              <p className="text-slate-600 mb-2">
                환영합니다, {auth.user.profile?.email}!
              </p>
              {tenantConfig && (
                <p className="text-slate-600 mb-6">
                  테넌트: {tenantConfig.COMPANY_NAME}
                </p>
              )}
              
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">대시보드로 이동 중...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 기본 로딩 상태
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          인증 확인 중
        </h2>
        <p className="text-slate-600">
          잠시만 기다려주세요...
        </p>
      </div>
    </div>
  );
} 