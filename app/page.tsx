'use client';

import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const auth = useAuth();
  const { tenantId } = useTenant();

  // 최초 진입 시 tenantId 체크 및 세팅
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantIdFromUrl = urlParams.get('tenantId');
    const savedTenantId = localStorage.getItem('currentTenantId');
    
    if (tenantIdFromUrl) {
      localStorage.setItem('currentTenantId', tenantIdFromUrl);
      return;
    }
    
    // tenantId가 URL에도 없고 localStorage에도 없으면 즉시 리다이렉트
    if (!tenantIdFromUrl && !savedTenantId) {
      console.log('No tenantId found, redirecting to select-tenant');
      window.location.replace('/select-tenant');
      return;
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) return;
    if (auth.isAuthenticated && auth.user && window.location.pathname === '/') {
      window.location.replace('/dashboard');
      return;
    }
    if (!tenantId && !auth.isLoading) {
      window.location.replace('/select-tenant');
      return;
    }
    if (tenantId && !auth.isAuthenticated && !auth.isLoading && !code) {
      window.location.replace('/auth/login');
      return;
    }
  }, [auth.isAuthenticated, auth.user, auth.isLoading, tenantId]);

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
