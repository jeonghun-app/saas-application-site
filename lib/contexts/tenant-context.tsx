'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TenantConfig } from '../types/tenant-config';
import { tenantConfigService } from '../services/tenant-config-service';

interface TenantContextType {
  tenantId: string | null;
  tenantConfig: TenantConfig | null;
  setTenantId: (id: string) => void;
  clearTenant: () => void;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  console.log('🏠 Simple TenantProvider:', { tenantId, mounted, loading });

  // 마운트 확인
  useEffect(() => {
    console.log('🏠 MOUNTED!');
    setMounted(true);
    
    // localStorage에서 직접 읽기
    const saved = localStorage.getItem('currentTenantId');
    console.log('🏠 Direct localStorage read:', saved);
    
    if (saved) {
      console.log('🏠 Setting saved tenantId:', saved);
      setTenantIdState(saved);
    }
  }, []);

  // tenantId가 설정되면 자동으로 설정 로드
  useEffect(() => {
    console.log('🏠 TenantId effect triggered:', { tenantId, hasConfig: !!tenantConfig, loading, mounted });
    
    if (mounted && tenantId && !tenantConfig && !loading) {
      console.log('🏠 Auto-loading config for restored tenant:', tenantId);
      setTenantId(tenantId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, tenantConfig, loading, mounted]);

  // 테넌트 ID 설정 함수
  const setTenantId = async (id: string) => {
    console.log('🏠 setTenantId called:', id);
    
    // 이미 같은 tenantId로 설정된 경우 중복 실행 방지
    if (tenantId === id && tenantConfig) {
      console.log('🏠 Already configured for tenantId:', id);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // localStorage 저장
      localStorage.setItem('currentTenantId', id);
      console.log('🏠 Saved to localStorage:', id);
      
      // 상태 설정 (이미 같은 값이면 스킵)
      if (tenantId !== id) {
        setTenantIdState(id);
        console.log('🏠 State updated with tenantId:', id);
      }
      
      // 설정 로드 (간소화)
      console.log('🏠 About to fetch config params...');
      const configParams = await tenantConfigService.getConfigParams(id);
      console.log('🏠 Config loaded:', configParams);
      
      // 설정 검증
      if (!configParams || !configParams.authServer || !configParams.appClientId || !configParams.redirectUrl) {
        throw new Error('유효하지 않은 테넌트 설정입니다. 필수 필드가 누락되었습니다.');
      }
      
      const config: TenantConfig = {
        TENANT_ID: id,
        AUTH_CLEAR_HASH_AFTER_LOGIN: false,
        AUTH_CLIENT_ID: configParams.appClientId,
        AUTH_REDIRECT_URI: configParams.redirectUrl,
        AUTH_SERVER: configParams.authServer,
        AUTH_SESSION_CHECKS_ENABLED: true,
        AUTH_SHOW_DEBUG_INFO: true,
        AUTH_SR_REDIRECT_URI: configParams.redirectUrl,
        AUTH_SR_TIMEOUT: 10000,
        AUTH_TIMEOUT_FACTOR: 0.75,
        AUTH_USE_SR: false,
        COGNITO_DOMAIN: configParams.authServer,
        COMPANY_NAME: 'AWS SaaS Factory Tenant',
        PLAN: 'Standard',
        TENANT_EMAIL: 'admin@example.com'
      };
      
      setTenantConfig(config);
      console.log('🏠 Config set successfully:', config);
      
    } catch (err) {
      console.error('🏠 setTenantId error:', err);
      setError(err instanceof Error ? err.message : '설정 오류');
      // 오류 시 상태 초기화
      setTenantIdState(null);
      setTenantConfig(null);
      localStorage.removeItem('currentTenantId');
    } finally {
      setLoading(false);
      console.log('🏠 setTenantId completed, loading:', false);
    }
  };

  const clearTenant = () => {
    setTenantIdState(null);
    setTenantConfig(null);
    setError(null);
    localStorage.removeItem('currentTenantId');
  };

  const value: TenantContextType = {
    tenantId,
    tenantConfig,
    setTenantId,
    clearTenant,
    loading,
    error
  };

  // 마운트되지 않았으면 로딩 표시
  if (!mounted) {
    return (
      <TenantContext.Provider value={value}>
        <div>Loading...</div>
      </TenantContext.Provider>
    );
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
} 