'use client';

import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { authInterceptor } from '@/lib/services/auth-interceptor';
import { serviceHelper } from '@/lib/services/service-helper';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export default function LogoutButton({ children = 'Logout', className }: LogoutButtonProps) {
  const auth = useAuth();
  const { clearTenant } = useTenant();

  const handleLogout = async () => {
    try {
      console.log('🔐 Starting simple logout process...');
      
      // 1. react-oidc-context 사용자 제거 (로컬 로그아웃)
      if (auth.isAuthenticated) {
        try {
          console.log('🔐 Removing user from OIDC context...');
          await auth.removeUser();
        } catch (oidcError) {
          console.warn('🔐 OIDC removeUser failed:', oidcError);
        }
      }
      
      // 2. 모든 로컬 데이터 클리어
      authInterceptor.clearToken();
      clearTenant();
      serviceHelper.clearTenantId();
      
      // 3. 브라우저 저장소 완전히 정리
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // 쿠키도 정리 (필요한 경우)
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
      
      console.log('🔐 All data cleared, redirecting to tenant selection...');
      
      // 4. 테넌트 선택 페이지로 즉시 리다이렉트
      setTimeout(() => {
        window.location.href = '/select-tenant';
      }, 100);
      
    } catch (error) {
      console.error('🔐 Logout error:', error);
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