import { ConfigParams, TenantConfig, TenantConfigResponse } from '../types/tenant-config';
import { authInterceptor } from './auth-interceptor';

export class TenantConfigService {
  private readonly configUrl: string;

  constructor() {
    // 개발 환경에서는 Next.js API 프록시 사용, 프로덕션에서는 직접 호출
    if (process.env.NODE_ENV === 'development') {
      this.configUrl = '/api/tenant-config';
    } else {
      const controlPlaneUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/';
      this.configUrl = `${controlPlaneUrl}tenant-config`;
    }
  }

  // 테스트용 샘플 ConfigParams - 개발 환경에서만 사용
  private getSampleConfigParams(tenantId: string): ConfigParams {
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 
      (typeof window !== 'undefined' ? window.location.host : 'localhost:3000');
    
    // 현재 환경의 프로토콜 감지
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 
      (isProduction ? 'https:' : 'http:');
    
    return {
      authServer: isProduction 
        ? `https://${tenantId}.auth.ap-northeast-2.amazoncognito.com`
        : `https://cognito-idp.us-west-2.amazonaws.com/${tenantId}`,
      appClientId: isProduction 
        ? `${tenantId}-client-id`
        : 'sample-client-id',
      redirectUrl: `${protocol}//${domain}/auth/callback`
    };
  }

  // DynamoDB 응답을 TenantConfig로 변환
  private mapDynamoResponseToConfig(response: TenantConfigResponse): TenantConfig {
    return {
      TENANT_ID: response.TENANT_ID.S,
      AUTH_CLEAR_HASH_AFTER_LOGIN: response.AUTH_CLEAR_HASH_AFTER_LOGIN.BOOL,
      AUTH_CLIENT_ID: response.AUTH_CLIENT_ID.S,
      AUTH_REDIRECT_URI: response.AUTH_REDIRECT_URI.S,
      AUTH_SERVER: response.AUTH_SERVER.S,
      AUTH_SESSION_CHECKS_ENABLED: response.AUTH_SESSION_CHECKS_ENABLED.BOOL,
      AUTH_SHOW_DEBUG_INFO: response.AUTH_SHOW_DEBUG_INFO.BOOL,
      AUTH_SR_REDIRECT_URI: response.AUTH_SR_REDIRECT_URI.S,
      AUTH_SR_TIMEOUT: parseInt(response.AUTH_SR_TIMEOUT.N),
      AUTH_TIMEOUT_FACTOR: parseFloat(response.AUTH_TIMEOUT_FACTOR.N),
      AUTH_USE_SR: response.AUTH_USE_SR.BOOL,
      COGNITO_DOMAIN: response.COGNITO_DOMAIN.S,
      COMPANY_NAME: response.COMPANY_NAME.S,
      PLAN: response.PLAN.S,
      TENANT_EMAIL: response.TENANT_EMAIL.S
    };
  }

  // AWS SaaS Factory 패턴: ConfigParams 조회 (앱 초기화용)
  async getConfigParams(tenantId: string): Promise<ConfigParams> {
    try {
      const url = `${this.configUrl}?tenantId=${tenantId}`;
      
      console.log('🌐 API Request URL:', url);
      console.log('🌐 Environment:', process.env.NODE_ENV);
      console.log('🌐 Control Plane URL:', this.configUrl);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🌐 API Response status:', response.status);
      console.log('🌐 API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🌐 API Error Response:', errorText);
        
        // 실제 오류를 던져서 사용자가 문제를 알 수 있도록 함
        throw new Error(`API 오류 (${response.status}): ${errorText || response.statusText}`);
      }

      const data: ConfigParams = await response.json();
      console.log('🌐 API Success - Config params response:', data);
      
      return data;
    } catch (error) {
      console.error('🌐 Network/API Error:', error);
      
      // 네트워크 오류의 경우 더 구체적인 오류 메시지
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`네트워크 연결 오류: Control Plane API(${this.configUrl})에 접근할 수 없습니다.`);
      }
      
      // 다른 오류는 그대로 재던짐
      throw error;
    }
  }

  // 전체 테넌트 설정 조회 (관리용)
  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    try {
      const url = `${this.configUrl}/${tenantId}`;
      
      console.log('Fetching tenant config from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: TenantConfigResponse = await response.json();
      console.log('Tenant config response:', data);
      
      return this.mapDynamoResponseToConfig(data);
    } catch (error) {
      console.error('Error fetching tenant config:', error);
      throw error;
    }
  }

  // 테넌트 설정 업데이트
  async updateTenantConfig(tenantId: string, config: Partial<TenantConfig>): Promise<TenantConfig> {
    try {
      const url = `${this.configUrl}/${tenantId}`;
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TenantConfigResponse = await response.json();
      return this.mapDynamoResponseToConfig(data);
    } catch (error) {
      console.error('Error updating tenant config:', error);
      throw error;
    }
  }

  // 테넌트 설정 삭제
  async deleteTenantConfig(tenantId: string): Promise<void> {
    try {
      const url = `${this.configUrl}/${tenantId}`;
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting tenant config:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const tenantConfigService = new TenantConfigService(); 