'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { useAppInitializer } from '@/lib/hooks/use-app-initializer';
import { serviceHelper } from '@/lib/services/service-helper';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Loader2, AlertCircle, Shield } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const { tenantId, tenantConfig } = useTenant();
  const { isInitialized, isLoading, error } = useAppInitializer();

  // 인증 가드 - 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      console.log('🔐 User not authenticated, redirecting to login');
      window.location.href = '/auth/login';
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  // 해시 변경 감지 및 라우팅 처리
  useEffect(() => {
    const handleHashChange = () => {
      const currentPath = serviceHelper.getCurrentPath();
      const currentTenantId = serviceHelper.getTenantId();
      
      // 테넌트 ID가 변경된 경우 처리
      if (currentTenantId && currentTenantId !== tenantId) {
        // 새로운 테넌트로 이동
        window.location.href = `/#/${currentTenantId}/${currentPath}`;
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [tenantId]);

  // 인증 또는 초기화 중 로딩 화면
  if (auth.isLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {auth.isLoading ? '인증 확인 중' : '애플리케이션 초기화 중'}
          </h2>
          <p className="text-slate-600">
            {auth.isLoading ? '로그인 상태를 확인하고 있습니다...' : '테넌트 설정을 로드하고 있습니다...'}
          </p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 안내
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">로그인 필요</h2>
          <p className="text-slate-600 mb-4">이 페이지에 접근하려면 로그인이 필요합니다.</p>
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">로그인 페이지로 이동 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 초기화 에러 화면
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Initialization Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => {
              serviceHelper.clearTenantId();
              window.location.href = '/select-tenant';
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Select Different Tenant
          </button>
        </div>
      </div>
    );
  }

  // 테넌트 ID가 없으면 테넌트 선택 페이지로 리다이렉트
  if (isInitialized && !tenantId) {
    router.push('/select-tenant');
    return null;
  }

  // 테넌트 설정이 로드되지 않았으면 로딩
  if (isInitialized && tenantId && !tenantConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading Tenant Configuration</h2>
          <p className="text-slate-600">Please wait while we load your tenant settings...</p>
        </div>
      </div>
    );
  }

  // 메인 레이아웃 렌더링
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 