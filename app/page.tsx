'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/contexts/tenant-context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { tenantId, isLoading } = useTenant();

  useEffect(() => {
    if (!isLoading) {
      if (tenantId) {
        // 테넌트 ID가 있으면 대시보드로 이동
        router.push('/dashboard');
      } else {
        // 테넌트 ID가 없으면 테넌트 선택 페이지로 이동
        router.push('/select-tenant');
      }
    }
  }, [tenantId, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return null;
}
