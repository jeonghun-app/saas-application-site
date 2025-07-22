'use client';

import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { Loader2, Building2, ArrowRight, Users, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  const auth = useAuth();
  const { tenantId } = useTenant();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  // 최초 진입 시 tenantId 체크 및 세팅 (쿼리 파라미터 & 해시 지원)
  useEffect(() => {
    console.log('🏠 Checking for tenantId in URL...', {
      search: window.location.search,
      hash: window.location.hash
    });

    // 1. 쿼리 파라미터에서 확인
    const urlParams = new URLSearchParams(window.location.search);
    let tenantIdFromUrl = urlParams.get('tenantId');
    
    // 2. 해시에서 확인 (AWS SaaS Factory 패턴: /#/tenantId)
    if (!tenantIdFromUrl && window.location.hash) {
      const hashParts = window.location.hash.split('/');
      if (hashParts.length >= 2 && hashParts[1]) {
        tenantIdFromUrl = hashParts[1];
        console.log('🏠 TenantId extracted from hash:', tenantIdFromUrl);
      }
    }
    
    const savedTenantId = localStorage.getItem('currentTenantId');
    
    if (tenantIdFromUrl) {
      localStorage.setItem('currentTenantId', tenantIdFromUrl);
      console.log('🏠 TenantId saved from URL:', tenantIdFromUrl);
      
      // 해시에서 테넌트 ID를 추출했으면 테넌트 선택 페이지로 리다이렉트
      console.log('🏠 Redirecting to tenant selection with pre-filled tenantId...');
      setTimeout(() => {
        window.location.href = '/select-tenant';
      }, 100);
      return;
    }
    
    // tenantId가 URL에도 없고 localStorage에도 없으면 웰컴 화면 표시
    if (!tenantIdFromUrl && !savedTenantId) {
      console.log('🏠 No tenantId found, showing welcome screen');
      setShowWelcome(true);
      return;
    }
  }, []);

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
          window.location.href = '/select-tenant';
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
  }, []);

  // 인증 완료 후 대시보드로 리다이렉트
  useEffect(() => {
    if (isProcessingCallback && auth.isAuthenticated && auth.user) {
      console.log('🔐 Authentication completed via callback, redirecting to dashboard');
      // URL 정리 후 대시보드로 이동
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  }, [isProcessingCallback, auth.isAuthenticated, auth.user]);

  // 해시 변경 감지 (런타임에서 /#/tenantId 변경 시)
  useEffect(() => {
    const handleHashChange = () => {
      console.log('🏠 Hash changed:', window.location.hash);
      
      if (window.location.hash) {
        const hashParts = window.location.hash.split('/');
        if (hashParts.length >= 2 && hashParts[1]) {
          const newTenantId = hashParts[1];
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
      window.location.replace('/dashboard');
      return;
    }
    if (!tenantId && !auth.isLoading && !showWelcome) {
      window.location.replace('/select-tenant');
      return;
    }
    if (tenantId && !auth.isAuthenticated && !auth.isLoading && !code) {
      window.location.replace('/auth/login');
      return;
    }
  }, [auth.isAuthenticated, auth.user, auth.isLoading, tenantId, showWelcome]);

  // 콜백 처리 중 로딩 화면
  if (isProcessingCallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            로그인 처리 중
          </h2>
          <p className="text-slate-600 mb-4">
            Cognito 인증을 완료하고 있습니다...
          </p>
          {auth.error && (
            <p className="text-red-600 text-sm">
              오류가 발생했습니다. 잠시 후 로그인 페이지로 이동합니다.
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
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              AWS SaaS Factory
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              멀티테넌트 SaaS 애플리케이션을 위한 최신 아키텍처 패턴과 베스트 프랙티스를 제공합니다.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">멀티테넌트</h3>
              <p className="text-slate-600">테넌트별 격리된 환경에서 안전하고 확장 가능한 SaaS 서비스를 제공합니다.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">보안 우선</h3>
              <p className="text-slate-600">AWS Cognito와 IAM을 활용한 엔터프라이즈급 보안 및 인증 시스템을 제공합니다.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">확장성</h3>
              <p className="text-slate-600">AWS의 관리형 서비스를 활용하여 자동 확장 가능한 아키텍처를 구현합니다.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => window.location.href = '/select-tenant'}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>시작하기</span>
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
                테스트: 테넌트 직접 설정
              </button>
              <button
                onClick={() => {
                  console.log('🧪 Current localStorage:', localStorage.getItem('currentTenantId'));
                  alert('localStorage: ' + localStorage.getItem('currentTenantId'));
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
              >
                저장된 테넌트 확인
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mt-4">
              테넌트 ID를 입력하여 애플리케이션에 접속하세요
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 pt-8 border-t border-slate-200">
            <p className="text-slate-500">
              Built with AWS SaaS Factory Reference Architecture
            </p>
          </div>
        </div>
      </div>
    );
  }

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
