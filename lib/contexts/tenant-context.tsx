'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TenantContextType {
  tenantId: string | null;
  setTenantId: (tenantId: string) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: React.ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTenantId = () => {
      // 1. 세션 스토리지에서 확인
      let storedTenantId = window.sessionStorage.getItem('tenantId');
      
      if (!storedTenantId) {
        // 2. 커스텀 도메인 사용 시 subdomain에서 추출
        const usingCustomDomain = process.env.NEXT_PUBLIC_USING_CUSTOM_DOMAIN === 'true';
        
        if (usingCustomDomain) {
          const hostname = window.location.hostname;
          const parts = hostname.split('.');
          storedTenantId = parts[0];
        } else {
          // 3. URL 경로에서 추출 (/#/tenant-id/...)
          const hash = window.location.hash;
          if (hash) {
            const parts = hash.split('/');
            if (parts.length > 1) {
              storedTenantId = parts[1];
            }
          }
          
          // 4. URL 쿼리 파라미터에서 추출
          if (!storedTenantId) {
            const query = new URLSearchParams(window.location.search);
            storedTenantId = query.get('tenantId');
          }
        }
        
        // 세션 스토리지에 저장
        if (storedTenantId) {
          window.sessionStorage.setItem('tenantId', storedTenantId);
        }
      }
      
      setTenantIdState(storedTenantId);
      setIsLoading(false);
    };

    initializeTenantId();
  }, []);

  const setTenantId = (newTenantId: string) => {
    setTenantIdState(newTenantId);
    window.sessionStorage.setItem('tenantId', newTenantId);
  };

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId, isLoading }}>
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