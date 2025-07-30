'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/contexts/tenant-context';
import { serviceHelper } from '@/lib/services/service-helper';
import { tenantConfigService } from '@/lib/services/tenant-config-service';
import { useTranslations } from 'next-intl';
import { AlertCircle, Building2, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import { useLocaleNavigation } from '@/lib/utils/navigation';

export default function SelectTenantPage() {
  const t = useTranslations('tenant');
  const tCommon = useTranslations('common');
  const { setTenantId } = useTenant();
  const { redirectTo } = useLocaleNavigation();
  
  const [customTenantId, setCustomTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message?: string;
    companyName?: string;
    plan?: string;
  } | null>(null);
  const [autoValidate, setAutoValidate] = useState<string | null>(null);

  // 페이지 로드 시 URL 해시나 localStorage에서 테넌트 ID 자동 입력
  useEffect(() => {
    const extractTenantId = () => {
      let tenantIdFromUrl = '';

      // 1. 쿼리 파라미터에서 테넌트 ID 추출 (?tenantId=...) - 우선순위 높음
      const urlParams = new URLSearchParams(window.location.search);
      tenantIdFromUrl = urlParams.get('tenantId') || '';
      if (tenantIdFromUrl) {
        return tenantIdFromUrl;
      }

      // 2. URL 해시에서 테넌트 ID 추출 (/#/tenantId 또는 /#/tenantId/)
      if (window.location.hash) {
        
        // #/a5da4160-5f17-4478-a9cd-535458a68cf3/ 형태에서 테넌트 ID 추출
        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
          // '#/' 이후 부분 추출하고 마지막 '/' 제거
          const pathPart = hash.substring(2); // '#/' 제거
          tenantIdFromUrl = pathPart.endsWith('/') ? pathPart.slice(0, -1) : pathPart;
          if (tenantIdFromUrl) return tenantIdFromUrl;
        }
      }

      // 3. localStorage에서 테넌트 ID 추출
      tenantIdFromUrl = localStorage.getItem('currentTenantId') || '';
      if (tenantIdFromUrl) {
        return tenantIdFromUrl;
      }

      // 4. sessionStorage에서도 확인
      tenantIdFromUrl = sessionStorage.getItem('tenantId') || '';
      if (tenantIdFromUrl) {
        return tenantIdFromUrl;
      }

      return '';
    };

    const foundTenantId = extractTenantId();
    
    if (foundTenantId && foundTenantId.trim()) {
      
      // localStorage에 저장
      localStorage.setItem('currentTenantId', foundTenantId);
      sessionStorage.setItem('tenantId', foundTenantId);
      
      // 상태 업데이트를 다음 tick에서 실행
      setTimeout(() => {
        setCustomTenantId(foundTenantId);
        
        // 자동 검증 트리거
        setAutoValidate(foundTenantId);
      }, 100);
    }
  }, []);

  // 자동 검증 처리
  useEffect(() => {
    if (autoValidate) {
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
        const storedTenantId = localStorage.getItem('currentTenantId');
        if (storedTenantId) {
          setCustomTenantId(storedTenantId);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [customTenantId]);

  const validateTenant = async (tenantId: string) => {
    if (!tenantId.trim()) {
      setError(t('validation.enterTenantId'));
      return false;
    }

    setValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      
      // AWS SaaS Factory 패턴: ConfigParams 조회로 유효성 검증
      await tenantConfigService.getConfigParams(tenantId);
      
      setValidationResult({
        valid: true,
        companyName: 'AWS SaaS Factory Tenant', // ConfigParams에는 회사명이 없음
        plan: 'Standard' // ConfigParams에는 플랜 정보가 없음
      });
      
      return true;
    } catch (err) {
      console.error('Tenant validation error:', err);
      
      let errorMessage = t('validation.invalidTenant');
      
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          errorMessage = t('validation.tenantNotFound');
        } else if (err.message.includes('401')) {
          errorMessage = t('validation.authRequired');
        } else if (err.message.includes('500')) {
          errorMessage = t('validation.serverError');
        } else {
          errorMessage = `${tCommon('error')}: ${err.message}`;
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
    
    if (!tenantId.trim()) {
      setError(t('validation.enterTenantId'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      
      // localStorage에 즉시 저장
      localStorage.setItem('currentTenantId', tenantId);
      sessionStorage.setItem('tenantId', tenantId);
      
      // 서비스 헬퍼에 설정
      serviceHelper.setTenantId(tenantId);
      
      // 테넌트 컨텍스트에 설정
      await setTenantId(tenantId);
      
      // 설정 완료 후 리다이렉트
      redirectTo('/auth/login');
      
    } catch (err) {
      console.error('🚀 Error in handleTenantSelect:', err);
      setError(t('errors.selectionError') + (err instanceof Error ? err.message : t('errors.unknownError')));
      setLoading(false);
    }
  };

  const handleCustomTenantSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!customTenantId.trim()) {
      setError(t('validation.enterTenantId'));
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
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t('select')}
            </h2>
            <p className="text-slate-600">
              {t('enterTenantId')}
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
                      <p className="font-medium">{t('validation.validTenant')}</p>
                      <p>{tCommon('company')}: {validationResult.companyName}</p>
                      <p>{tCommon('plan')}: {validationResult.plan}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-700">{t('validation.invalidTenantShort')}</p>
                  </>
                )}
              </div>
            )}

            {/* Custom Tenant ID Input */}
            <form onSubmit={handleCustomTenantSubmit} className="space-y-4">
              <div>
                <label htmlFor="tenantId" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('tenantId')}
                </label>
                <div className="flex space-x-2">
                  <input
                    id="tenantId"
                    type="text"
                    placeholder={t('idPlaceholder')}
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
                      tCommon('validate')
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
                    <span>{tCommon('processing')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{t('selectButton')}</span>
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
                  <p className="font-medium mb-1">{t('demo.title')}</p>
                  <p>{t('demo.description')}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 