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

  // 테넌트 ID 설정 및 설정 정보 로드
  const setTenantId = async (id: string) => {
    if (tenantId === id && tenantConfig) {
      // 이미 같은 tenantId로 초기화된 경우 fetch 생략
      return;
    }
    console.log('setTenantId called with:', id);
    setLoading(true);
    setError(null);
    
    try {
      // AWS SaaS Factory 패턴: ConfigParams 조회 (앱 초기화용)
      const configParams = await tenantConfigService.getConfigParams(id);
      console.log('ConfigParams loaded:', configParams);
      
      // ConfigParams를 TenantConfig 형태로 변환
      const config: TenantConfig = {
        TENANT_ID: id,
        AUTH_CLEAR_HASH_AFTER_LOGIN: false,
        AUTH_CLIENT_ID: configParams.appClientId,
        AUTH_REDIRECT_URI: configParams.redirectUrl, // 원래 ConfigParams의 redirectUrl 사용 (Cognito에 등록된 URL)
        AUTH_SERVER: configParams.authServer,
        AUTH_SESSION_CHECKS_ENABLED: true,
        AUTH_SHOW_DEBUG_INFO: true,
        AUTH_SR_REDIRECT_URI: configParams.redirectUrl, // 원래 ConfigParams의 redirectUrl 사용
        AUTH_SR_TIMEOUT: 10000,
        AUTH_TIMEOUT_FACTOR: 0.75,
        AUTH_USE_SR: false,
        COGNITO_DOMAIN: configParams.authServer,
        COMPANY_NAME: 'AWS SaaS Factory Tenant',
        PLAN: 'Standard',
        TENANT_EMAIL: 'admin@example.com'
      };
      
      setTenantIdState(id);
      setTenantConfig(config);
      console.log('Tenant context updated:', { id, config });
      
      // localStorage에 테넌트 ID 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentTenantId', id);
      }
    } catch (err) {
      console.error('setTenantId error:', err);
      setError(err instanceof Error ? err.message : '테넌트 설정을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      console.log('setTenantId completed, loading set to false');
    }
  };

  // 테넌트 정보 초기화
  const clearTenant = () => {
    setTenantIdState(null);
    setTenantConfig(null);
    setError(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentTenantId');
    }
  };

  // 초기 로드 시 localStorage/sessionStorage에서 테넌트 ID 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTenantId = localStorage.getItem('currentTenantId') || sessionStorage.getItem('tenantId');
      console.log('TenantContext init:', { savedTenantId, currentTenantId: tenantId });
      if (savedTenantId && !tenantId && !loading) {
        console.log('Restoring tenant ID from storage:', savedTenantId);
        setTenantId(savedTenantId);
      }
    }
  }, []); // 빈 의존성 배열로 변경하여 초기 한번만 실행

  const value: TenantContextType = {
    tenantId,
    tenantConfig,
    setTenantId,
    clearTenant,
    loading,
    error
  };

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