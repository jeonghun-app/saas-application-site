'use client';

import { useTenant } from '@/lib/contexts/tenant-context';
import { createAuthConfig } from '@/lib/auth-config';
import { cn } from '@/lib/utils';

interface LoginButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export default function LoginButton({ children = 'Login', className }: LoginButtonProps) {
  const { tenantConfig } = useTenant();

  const handleLogin = () => {
    if (!tenantConfig) {
      console.error('Tenant configuration not loaded');
      return;
    }

    try {
      // AWS SaaS Factory 패턴: 테넌트 설정에서 인증 URL 생성
      const authConfig = createAuthConfig(tenantConfig);
      
      // Cognito 로그인 URL 생성
      const loginUrl = new URL('/oauth2/authorize', authConfig.authority);
      loginUrl.searchParams.set('response_type', 'code');
      loginUrl.searchParams.set('client_id', authConfig.client_id);
      loginUrl.searchParams.set('redirect_uri', authConfig.redirect_uri);
      loginUrl.searchParams.set('scope', authConfig.scope);
      loginUrl.searchParams.set('state', btoa(JSON.stringify({
        tenantId: tenantConfig.TENANT_ID,
        returnUrl: window.location.hash || `/${tenantConfig.TENANT_ID}/dashboard`
      })));

      // 로그인 페이지로 리다이렉트
      window.location.href = loginUrl.toString();
    } catch (error) {
      console.error('Error creating login URL:', error);
      alert('로그인 URL 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={!tenantConfig}
      className={cn(
        'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
} 