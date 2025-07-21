'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/contexts/tenant-context';
import { serviceHelper } from '@/lib/services/service-helper';
import { authInterceptor } from '@/lib/services/auth-interceptor';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const { tenantId, tenantConfig } = useTenant();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setLoading(true);
      setError(null);

      // URL 파라미터에서 인증 코드 추출
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      console.log('Auth callback received:', { code, state, error });

      if (error) {
        throw new Error(`Cognito error: ${error}`);
      }

      if (!code) {
        throw new Error('인증 코드가 없습니다.');
      }

      if (!tenantId || !tenantConfig) {
        throw new Error('테넌트 정보가 없습니다.');
      }

      // state에서 테넌트 ID와 리턴 URL 추출
      let returnUrl = '/dashboard';
      if (state) {
        try {
          const stateData = JSON.parse(atob(state));
          if (stateData.tenantId && stateData.tenantId === tenantId) {
            returnUrl = stateData.returnUrl || '/dashboard';
          }
        } catch (e) {
          console.warn('Failed to parse state:', e);
        }
      }

      // TODO: 실제 토큰 교환 로직 구현
      // 현재는 시뮬레이션
      console.log('Exchanging code for tokens...');
      
      // 시뮬레이션: 토큰 저장
      const mockTokens = {
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        refresh_token: 'mock-refresh-token'
      };
      
      authInterceptor.setToken(mockTokens.access_token);
      
      setSuccess(true);
      
      // 잠시 후 대시보드로 이동
      setTimeout(() => {
        // 해시 기반 라우팅으로 대시보드 이동
        window.location.hash = `/${tenantId}${returnUrl}`;
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error('Auth callback error:', err);
      setError(err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    window.location.href = '/auth/login';
  };

  const handleBackToTenantSelection = () => {
    serviceHelper.clearTenantId();
    window.location.href = '/select-tenant';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">인증 처리 중</h2>
          <p className="text-slate-600">Cognito에서 인증을 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">인증 오류</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  다시 로그인
                </button>
                
                <button
                  onClick={handleBackToTenantSelection}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  다른 테넌트 선택
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">로그인 성공!</h2>
              <p className="text-slate-600 mb-6">
                테넌트: {tenantConfig?.COMPANY_NAME}<br />
                잠시 후 대시보드로 이동합니다...
              </p>
              
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

  return null;
} 