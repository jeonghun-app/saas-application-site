'use client';

import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { useTranslations } from 'next-intl';
import { Loader2, Building2, ArrowRight, Users, Shield, Zap } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import { useLocaleNavigation } from '@/lib/utils/navigation';

export default function HomePage() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const auth = useAuth();
  const { tenantId } = useTenant();
  const { redirectTo, replaceTo } = useLocaleNavigation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  // 최초 진입 시 tenantId 체크 및 세팅 (쿼리 파라미터 & 해시 지원)
  useEffect(() => {
    const extractTenantIdFromUrl = () => {
      console.log('🏠 Starting tenantId extraction from URL...', {
        href: window.location.href,
        search: window.location.search,
        hash: window.location.hash,
        pathname: window.location.pathname
      });

      let tenantIdFromUrl = '';

      // 1. 쿼리 파라미터에서 확인
      const urlParams = new URLSearchParams(window.location.search);
      tenantIdFromUrl = urlParams.get('tenantId') || '';
      if (tenantIdFromUrl) {
        console.log('🏠 TenantId found in query params:', tenantIdFromUrl);
        return tenantIdFromUrl;
      }
      
      // 2. 해시에서 확인 (AWS SaaS Factory 패턴: /#/tenantId)
      if (window.location.hash) {
        console.log('🏠 Raw hash in main page:', window.location.hash);
        
        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
          // '#/' 이후 부분 추출하고 마지막 '/' 제거
          const pathPart = hash.substring(2); // '#/' 제거
          tenantIdFromUrl = pathPart.endsWith('/') ? pathPart.slice(0, -1) : pathPart;
          console.log('🏠 TenantId extracted from hash in main page:', tenantIdFromUrl);
          
          if (tenantIdFromUrl && tenantIdFromUrl.trim()) {
            return tenantIdFromUrl;
          }
        }
      }

      // 3. URL 경로에서 확인 (혹시 Next.js 라우팅으로 처리된 경우)
      const pathname = window.location.pathname;
      if (pathname.startsWith('/') && pathname.length > 1) {
        const pathParts = pathname.split('/').filter(part => part.length > 0);
        if (pathParts.length > 0) {
          const possibleTenantId = pathParts[0];
          // UUID 형태인지 간단 체크
          if (possibleTenantId.includes('-') && possibleTenantId.length > 30) {
            console.log('🏠 Possible tenantId found in pathname:', possibleTenantId);
            return possibleTenantId;
          }
        }
      }

      return '';
    };

    const tenantIdFromUrl = extractTenantIdFromUrl();
    
    if (tenantIdFromUrl && tenantIdFromUrl.trim()) {
      // 즉시 localStorage에 저장
      localStorage.setItem('currentTenantId', tenantIdFromUrl);
      sessionStorage.setItem('tenantId', tenantIdFromUrl);
      console.log('🏠 TenantId extracted and saved:', tenantIdFromUrl);
    }
    
    const savedTenantId = localStorage.getItem('currentTenantId');
    
    if (tenantIdFromUrl) {
      console.log('🏠 TenantId found in URL:', tenantIdFromUrl);
      
      // OAuth 콜백 처리 중인지 확인 (code, error 파라미터 존재)
      const urlParams = new URLSearchParams(window.location.search);
      const isOAuthCallback = urlParams.get('code') || urlParams.get('error') || urlParams.get('path');
      
      if (isOAuthCallback) {
        console.log('🔐 OAuth callback detected, not redirecting to tenant selection');
        return; // OAuth 콜백 처리를 위해 현재 페이지에 머물기
      }
      
      // 새로운 방문자만 테넌트 선택 페이지로 리다이렉트
      // (인증된 사용자는 나중에 대시보드로 리다이렉트됨)
      if (!auth.isAuthenticated && !auth.isLoading) {
        console.log('🏠 New visitor with tenantId, redirecting to tenant selection...', tenantIdFromUrl);
        setTimeout(() => {
          redirectTo(`/select-tenant?tenantId=${encodeURIComponent(tenantIdFromUrl)}`);
        }, 100);
      }
      return;
    }
    
    // tenantId가 URL에도 없고 localStorage에도 없으면 웰컴 화면 표시
    if (!tenantIdFromUrl && !savedTenantId) {
      console.log('🏠 No tenantId found, showing welcome screen');
      setShowWelcome(true);
      return;
    }
  }, [auth.isAuthenticated, auth.isLoading, redirectTo]);

  // 콜백 처리 감지 및 상태 설정 (OAuth 및 logout 처리)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const path = urlParams.get('path');
    
    // 로그아웃 처리
    if (path === 'logoff') {
      console.log('🔐 Logout path detected, cleaning up and redirecting...');
      
      // 모든 인증 정보 정리
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        // URL에서 파라미터 제거하고 테넌트 선택 페이지로 이동
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          redirectTo('/select-tenant');
        }, 500);
      }
      return;
    }
    
    if (code || error) {
      console.log('🔐 OAuth callback detected:', { code: !!code, error });
      setIsProcessingCallback(true);
      
      if (error) {
        console.error('🔐 OAuth error received:', error);
        setTimeout(() => {
          window.location.href = '/auth/login?error=' + encodeURIComponent(error);
        }, 2000);
        return;
      }
    }
  }, [redirectTo]);

  // 인증 완료 후 대시보드로 리다이렉트
  useEffect(() => {
    if (isProcessingCallback && auth.isAuthenticated && auth.user) {
      console.log('🔐 Authentication completed via callback, redirecting to dashboard');
      // URL 정리 후 대시보드로 이동
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        const savedTenantId = localStorage.getItem('currentTenantId');
        if (savedTenantId) {
          window.location.href = `/${savedTenantId}/dashboard`;
        } else {
          redirectTo('/select-tenant');
        }
      }, 1000);
    }
  }, [isProcessingCallback, auth.isAuthenticated, auth.user, redirectTo]);

  // 해시 변경 감지 (런타임에서 /#/tenantId 변경 시)
  useEffect(() => {
    const handleHashChange = () => {
      console.log('🏠 Hash changed:', window.location.hash);
      
      if (window.location.hash) {
        // #/a5da4160-5f17-4478-a9cd-535458a68cf3/ 형태에서 테넌트 ID 추출
        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
          // '#/' 이후 부분 추출하고 마지막 '/' 제거
          const pathPart = hash.substring(2); // '#/' 제거
          const newTenantId = pathPart.endsWith('/') ? pathPart.slice(0, -1) : pathPart;
          const currentTenantId = localStorage.getItem('currentTenantId');
          
          if (newTenantId !== currentTenantId) {
            console.log('🏠 TenantId changed in hash, updating...', {
              old: currentTenantId,
              new: newTenantId
            });
            localStorage.setItem('currentTenantId', newTenantId);
            // 페이지 새로고침으로 새 테넌트 적용
            window.location.reload();
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 인증 오류 처리
  useEffect(() => {
    if (isProcessingCallback && auth.error) {
      console.error('🔐 Authentication error during callback:', auth.error);
      setTimeout(() => {
        window.location.href = '/auth/login?error=' + encodeURIComponent(auth.error?.message || 'Authentication failed');
      }, 2000);
    }
  }, [isProcessingCallback, auth.error]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) return;
    if (auth.isAuthenticated && auth.user && window.location.pathname === '/') {
      const savedTenantId = localStorage.getItem('currentTenantId');
      if (savedTenantId) {
        window.location.replace(`/${savedTenantId}/dashboard`);
      } else {
        replaceTo('/select-tenant');
      }
      return;
    }
    if (!tenantId && !auth.isLoading && !showWelcome) {
      replaceTo('/select-tenant');
      return;
    }
    if (tenantId && !auth.isAuthenticated && !auth.isLoading && !code) {
      replaceTo('/auth/login');
      return;
    }
  }, [auth.isAuthenticated, auth.user, auth.isLoading, tenantId, showWelcome, replaceTo]);

  // 콜백 처리 중 로딩 화면
  if (isProcessingCallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {t('processingLogin')}
          </h2>
          <p className="text-slate-600 mb-4">
            {t('cognitoAuthMessage')}
          </p>
          {auth.error && (
            <p className="text-red-600 text-sm">
              {t('authErrorMessage')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 웰컴 화면 표시
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('features.multitenant.title')}</h3>
              <p className="text-slate-600">{t('features.multitenant.description')}</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('features.security.title')}</h3>
              <p className="text-slate-600">{t('features.security.description')}</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('features.scalability.title')}</h3>
              <p className="text-slate-600">{t('features.scalability.description')}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => redirectTo('/select-tenant')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            {/* 테스트용 버튼 추가 */}
            <div className="mt-4 space-x-2">
              <button
                onClick={() => {
                  console.log('🧪 Test: Setting tenant-demo-001');
                  localStorage.setItem('currentTenantId', 'tenant-demo-001');
                  window.location.reload();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
              >
                {t('test.setTenant')}
              </button>
              <button
                onClick={() => {
                  console.log('🧪 Current localStorage:', localStorage.getItem('currentTenantId'));
                  alert('localStorage: ' + localStorage.getItem('currentTenantId'));
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
              >
                {t('test.checkTenant')}
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mt-4">
              {t('footer.description')}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 pt-8 border-t border-slate-200">
            <p className="text-slate-500">
              {t('footer.builtWith')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (auth.isLoading || new URLSearchParams(window.location.search).get('code')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {new URLSearchParams(window.location.search).get('code') ? t('authProcessingMessage') : t('startingApp')}
          </h2>
          <p className="text-slate-600">
            {tCommon('waitMessage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          {t('title')}
        </h2>
        <p className="text-slate-600">
          {t('startingMultitenant')}
        </p>
      </div>
    </div>
  );
}
