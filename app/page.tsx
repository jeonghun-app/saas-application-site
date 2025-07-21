'use client';

import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const auth = useAuth();
  const { tenantId } = useTenant();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      // 인증 성공 후 쿼리스트링 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // 콜백 처리 중이면 아무것도 하지 않음
    if (code) return;

    // 인증 완료 후 대시보드로 이동 (한 번만)
    if (auth.isAuthenticated && auth.user && window.location.pathname === '/') {
      window.location.replace('/dashboard');
      return;
    }

    // 테넌트가 없으면 테넌트 선택으로
    if (!tenantId && !auth.isLoading) {
      window.location.replace('/select-tenant');
      return;
    }

    // 테넌트는 있지만 인증되지 않았으면 로그인으로
    if (tenantId && !auth.isAuthenticated && !auth.isLoading && !code) {
      window.location.replace('/auth/login');
      return;
    }
  }, [auth.isAuthenticated, auth.user, auth.isLoading, tenantId]);

  // 로딩 중이거나 콜백 처리 중
  if (auth.isLoading || new URLSearchParams(window.location.search).get('code')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {new URLSearchParams(window.location.search).get('code') ? '인증 처리 중...' : '앱을 시작하는 중...'}
          </h2>
          <p className="text-slate-600">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    );
  }

  // 기본 로딩 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          AWS SaaS Factory
        </h2>
        <p className="text-slate-600">
          멀티테넌트 애플리케이션을 시작합니다...
        </p>
      </div>
    </div>
  );
}
