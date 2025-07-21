'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/contexts/tenant-context';
import { useAppInitializer } from '@/lib/hooks/use-app-initializer';
import { serviceHelper } from '@/lib/services/service-helper';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { tenantId, tenantConfig } = useTenant();
  const { isInitialized, isLoading, error } = useAppInitializer();

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

  // 초기화 중 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Initializing Application</h2>
          <p className="text-slate-600">Loading tenant configuration...</p>
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