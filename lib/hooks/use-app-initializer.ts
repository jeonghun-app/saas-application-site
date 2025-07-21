'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '../contexts/tenant-context';
import { serviceHelper } from '../services/service-helper';
import { tenantConfigService } from '../services/tenant-config-service';

interface AppInitializerState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  authConfig: Record<string, unknown> | null;
}

export function useAppInitializer() {
  const { setTenantId, clearTenant } = useTenant();
  const [state, setState] = useState<AppInitializerState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    authConfig: null
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // 1. 테넌트 ID 추출
        const tenantId = serviceHelper.getTenantId();
        
        if (!tenantId) {
          // 테넌트 ID가 없으면 초기화 완료 (테넌트 선택 페이지로 이동)
          setState({
            isInitialized: true,
            isLoading: false,
            error: null,
            authConfig: null
          });
          return;
        }

        // 2. AWS SaaS Factory 패턴: ConfigParams 로드 (앱 초기화용)
        const configParams = await tenantConfigService.getConfigParams(tenantId);
        
        // 3. 인증 설정 생성
        const authConfig = {
          clientId: configParams.appClientId,
          issuer: configParams.authServer,
          redirectUri: configParams.redirectUrl,
          responseType: 'code',
          scope: 'openid profile email',
          showDebugInformation: true,
          strictDiscoveryDocumentValidation: false,
        };
        
        // 4. 테넌트 컨텍스트 설정
        await setTenantId(tenantId);
        
        // 5. 초기화 완료
        setState({
          isInitialized: true,
          isLoading: false,
          error: null,
          authConfig
        });

        // 6. 자동 로그인 시도 (선택적)
        // TODO: OAuth 라이브러리 통합 후 구현

      } catch (error) {
        console.error('App initialization error:', error);
        setState({
          isInitialized: false,
          isLoading: false,
          error: error instanceof Error ? error.message : '앱 초기화 중 오류가 발생했습니다.',
          authConfig: null
        });
        
        // 에러 시 테넌트 정보 클리어
        clearTenant();
      }
    };

    initializeApp();
  }, [clearTenant, setTenantId]);

  return state;
} 