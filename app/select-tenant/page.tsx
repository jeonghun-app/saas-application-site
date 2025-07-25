'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/contexts/tenant-context';
import { serviceHelper } from '@/lib/services/service-helper';
import { tenantConfigService } from '@/lib/services/tenant-config-service';
import { AlertCircle, Building2, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function SelectTenantPage() {
  const { setTenantId } = useTenant();
  const [customTenantId, setCustomTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    companyName?: string;
    plan?: string;
  } | null>(null);
  const [autoValidate, setAutoValidate] = useState<string | null>(null);

  // 페이지 로드 시 URL 해시나 localStorage에서 테넌트 ID 자동 입력
  useEffect(() => {
    const extractTenantId = () => {
      console.log('🏠 SelectTenant: Starting tenantId extraction...', {
        hash: window.location.hash,
        search: window.location.search,
        localStorage: localStorage.getItem('currentTenantId'),
        sessionStorage: sessionStorage.getItem('tenantId'),
        href: window.location.href,
        pathname: window.location.pathname
      });

      let tenantIdFromUrl = '';

      // 1. 쿼리 파라미터에서 테넌트 ID 추출 (?tenantId=...) - 우선순위 높음
      const urlParams = new URLSearchParams(window.location.search);
      tenantIdFromUrl = urlParams.get('tenantId') || '';
      if (tenantIdFromUrl) {
        console.log('🏠 TenantId found in query params:', tenantIdFromUrl);
        return tenantIdFromUrl;
      }

      // 2. URL 해시에서 테넌트 ID 추출 (/#/tenantId 또는 /#/tenantId/)
      if (window.location.hash) {
        console.log('🏠 Raw hash:', window.location.hash);
        
        // #/a5da4160-5f17-4478-a9cd-535458a68cf3/ 형태에서 테넌트 ID 추출
        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
          // '#/' 이후 부분 추출하고 마지막 '/' 제거
          const pathPart = hash.substring(2); // '#/' 제거
          tenantIdFromUrl = pathPart.endsWith('/') ? pathPart.slice(0, -1) : pathPart;
          console.log('🏠 TenantId extracted from hash:', tenantIdFromUrl);
          if (tenantIdFromUrl) return tenantIdFromUrl;
        }
      }

      // 3. localStorage에서 테넌트 ID 추출
      tenantIdFromUrl = localStorage.getItem('currentTenantId') || '';
      if (tenantIdFromUrl) {
        console.log('🏠 TenantId found in localStorage:', tenantIdFromUrl);
        return tenantIdFromUrl;
      }

      // 4. sessionStorage에서도 확인
      tenantIdFromUrl = sessionStorage.getItem('tenantId') || '';
      if (tenantIdFromUrl) {
        console.log('🏠 TenantId found in sessionStorage:', tenantIdFromUrl);
        return tenantIdFromUrl;
      }

      return '';
    };

    const foundTenantId = extractTenantId();
    
    if (foundTenantId && foundTenantId.trim()) {
      console.log('🏠 Auto-filling tenantId:', foundTenantId);
      
      // localStorage에 저장
      localStorage.setItem('currentTenantId', foundTenantId);
      sessionStorage.setItem('tenantId', foundTenantId);
      console.log('🏠 Saved tenantId to storage:', foundTenantId);
      
      // 상태 업데이트를 다음 tick에서 실행
      setTimeout(() => {
        setCustomTenantId(foundTenantId);
        console.log('🏠 State updated with tenantId:', foundTenantId);
        
        // 자동 검증 트리거
        setAutoValidate(foundTenantId);
      }, 100);
    } else {
      console.log('🏠 No tenantId found from any source');
    }
  }, []);

  // 자동 검증 처리
  useEffect(() => {
    if (autoValidate) {
      console.log('🏠 Auto-validating tenantId:', autoValidate);
      setTimeout(() => {
        validateTenant(autoValidate);
      }, 500);
      setAutoValidate(null); // 한 번만 실행되도록
    }
  }, [autoValidate]);

  // 추가 체크: 컴포넌트 마운트 후 입력창이 비어있으면 다시 시도
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!customTenantId) {
        console.log('🏠 Input still empty, trying localStorage again...');
        const storedTenantId = localStorage.getItem('currentTenantId');
        if (storedTenantId) {
          console.log('🏠 Found stored tenantId, filling input:', storedTenantId);
          setCustomTenantId(storedTenantId);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [customTenantId]);

  const validateTenant = async (tenantId: string) => {
    if (!tenantId.trim()) {
      setError('테넌트 ID를 입력해주세요.');
      return false;
    }

    setValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      console.log('Validating tenant ID:', tenantId);
      
      // AWS SaaS Factory 패턴: ConfigParams 조회로 유효성 검증
      const configParams = await tenantConfigService.getConfigParams(tenantId);
      
      console.log('Config params received:', configParams);
      
      setValidationResult({
        valid: true,
        companyName: 'AWS SaaS Factory Tenant', // ConfigParams에는 회사명이 없음
        plan: 'Standard' // ConfigParams에는 플랜 정보가 없음
      });
      
      return true;
    } catch (err) {
      console.error('Tenant validation error:', err);
      
      let errorMessage = '유효하지 않은 테넌트 ID입니다. 다시 확인해주세요.';
      
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          errorMessage = '테넌트 ID를 찾을 수 없습니다. 올바른 테넌트 ID를 입력해주세요.';
        } else if (err.message.includes('401')) {
          errorMessage = '인증이 필요합니다. 관리자에게 문의하세요.';
        } else if (err.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage = `오류: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      setValidationResult({ valid: false });
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleTenantSelect = async (tenantId: string) => {
    console.log('🚀 handleTenantSelect called with:', tenantId);
    
    if (!tenantId.trim()) {
      setError('테넌트 ID를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting tenant selection process...');
      
      // localStorage에 즉시 저장
      localStorage.setItem('currentTenantId', tenantId);
      sessionStorage.setItem('tenantId', tenantId);
      console.log('🚀 Stored tenant ID:', tenantId);

      // 서비스 헬퍼에 설정
      serviceHelper.setTenantId(tenantId);
      console.log('🚀 Set in service helper');
      
      // 테넌트 컨텍스트에 설정
      console.log('🚀 About to call context setTenantId...');
      await setTenantId(tenantId);
      console.log('🚀 Context setTenantId completed');
      
      console.log('🚀 Redirecting to auth/login...');
      
      // 설정 완료 후 리다이렉트
      window.location.href = '/auth/login';
      
    } catch (err) {
      console.error('🚀 Error in handleTenantSelect:', err);
      setError('테넌트 선택 중 오류가 발생했습니다: ' + (err instanceof Error ? err.message : '알 수 없는 오류'));
      setLoading(false);
    }
  };

  const handleCustomTenantSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!customTenantId.trim()) {
      setError('테넌트 ID를 입력해주세요.');
      return;
    }

    // 먼저 검증 수행
    const isValid = await validateTenant(customTenantId);
    if (isValid) {
      // 검증 성공 시 테넌트 선택
      await handleTenantSelect(customTenantId);
    }
  };

  const handleValidateClick = async () => {
    if (customTenantId.trim()) {
      await validateTenant(customTenantId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              테넌트 선택
            </h2>
            <p className="text-slate-600">
              사용할 테넌트 ID를 입력하세요
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Validation Result */}
            {validationResult && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                validationResult.valid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {validationResult.valid ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="text-sm text-green-700">
                      <p className="font-medium">유효한 테넌트입니다</p>
                      <p>회사: {validationResult.companyName}</p>
                      <p>플랜: {validationResult.plan}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-700">유효하지 않은 테넌트입니다</p>
                  </>
                )}
              </div>
            )}

            {/* Custom Tenant ID Input */}
            <form onSubmit={handleCustomTenantSubmit} className="space-y-4">
              <div>
                <label htmlFor="tenantId" className="block text-sm font-medium text-slate-700 mb-2">
                  테넌트 ID
                </label>
                <div className="flex space-x-2">
                  <input
                    id="tenantId"
                    type="text"
                    placeholder="예: a5da4160-5f17-4478-a9cd-535458a68cf3"
                    value={customTenantId}
                    onChange={(e) => setCustomTenantId(e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || validating}
                  />
                  <button
                    type="button"
                    onClick={handleValidateClick}
                    disabled={!customTenantId.trim() || validating}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {validating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '검증'
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={loading || !customTenantId.trim() || !validationResult?.valid}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>처리 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>테넌트 선택</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </button>
            </form>

            {/* Demo Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">AWS SaaS Factory 패턴</p>
                  <p>테넌트 ID를 입력하면 해시 기반 라우팅으로 애플리케이션이 초기화됩니다.</p>
                </div>
              </div>
              
              {/* 디버그 버튼 */}
              <div className="mt-3 space-x-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const stored = localStorage.getItem('currentTenantId');
                    console.log('🧪 Debug - localStorage:', stored);
                    if (stored) {
                      setCustomTenantId(stored);
                      console.log('🧪 Debug - Filled input with:', stored);
                    }
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                >
                  디버그: localStorage 확인
                </button>
                <button
                  onClick={() => {
                    console.log('🧪 Debug - Current URL:', window.location.href);
                    console.log('🧪 Debug - Hash:', window.location.hash);
                    console.log('🧪 Debug - Search:', window.location.search);
                  }}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                >
                  디버그: URL 정보
                </button>
                <button
                  onClick={() => {
                    const testTenantId = 'a5da4160-5f17-4478-a9cd-535458a68cf3';
                    setCustomTenantId(testTenantId);
                    localStorage.setItem('currentTenantId', testTenantId);
                    console.log('🧪 Debug - Set test tenant ID:', testTenantId);
                  }}
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
                >
                  테스트: 테넌트 ID 설정
                </button>
                <button
                  onClick={() => {
                    // 원본 해시 URL로 직접 이동
                    window.location.href = 'http://localhost:3001/#/a5da4160-5f17-4478-a9cd-535458a68cf3/';
                  }}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                >
                  테스트: 해시 URL로 이동
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 