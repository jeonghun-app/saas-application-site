'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/contexts/tenant-context';
import { serviceHelper } from '@/lib/services/service-helper';

export default function AppRootPage() {
  const router = useRouter();
  const { tenantId } = useTenant();

  useEffect(() => {
    // tenantId가 있으면 dashboard로 리다이렉트
    if (tenantId) {
      router.replace(`/${tenantId}/dashboard`);
    } else {
      // 해시에서 tenantId 추출 시도
      const hashTenantId = serviceHelper.getTenantId();
      if (hashTenantId) {
        router.replace(`/${hashTenantId}/dashboard`);
      } else {
        // tenantId가 없으면 tenant 선택 페이지로
        router.replace('/select-tenant');
      }
    }
  }, [tenantId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-spin">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">리다이렉트 중</h2>
        <p className="text-slate-600">대시보드로 이동하고 있습니다...</p>
      </div>
    </div>
  );
} 