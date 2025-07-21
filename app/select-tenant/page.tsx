'use client';

import { useState } from 'react';
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
      // 테넌트 유효성 검증
      const isValid = await validateTenant(tenantId);
      if (!isValid) {
        return;
      }

      // 테넌트 ID 설정 (이미 검증된 설정이 로드됨)
      serviceHelper.setTenantId(tenantId);
      await setTenantId(tenantId);
      
      console.log('🚀 About to navigate to /auth/login');
      
      // 테넌트 ID 저장
      window.localStorage.setItem('currentTenantId', tenantId);
      window.sessionStorage.setItem('tenantId', tenantId);
      
      console.log('🚀 Stored tenant ID, now navigating...');
      
      window.location.href = '/auth/login';
      
    } catch (err) {
      setError('테넌트 선택 중 오류가 발생했습니다.');
      console.error('Error selecting tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomTenantSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleTenantSelect(customTenantId);
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 