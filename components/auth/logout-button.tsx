'use client';

import { useTenant } from '@/lib/contexts/tenant-context';
import { authInterceptor } from '@/lib/services/auth-interceptor';
import { serviceHelper } from '@/lib/services/service-helper';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export default function LogoutButton({ children = 'Logout', className }: LogoutButtonProps) {
  const { clearTenant } = useTenant();

  const handleLogout = () => {
    try {
      // 1. 인증 토큰 클리어
      authInterceptor.clearToken();
      
      // 2. 테넌트 정보 클리어
      clearTenant();
      
      // 3. 테넌트 ID 클리어
      serviceHelper.clearTenantId();
      
      // 4. AWS SaaS Factory 패턴: 테넌트 선택 페이지로 리다이렉트
      window.location.href = '/select-tenant';
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 강제로 테넌트 선택 페이지로 이동
      window.location.href = '/select-tenant';
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={cn(
        'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200',
        className
      )}
    >
      {children}
    </button>
  );
} 