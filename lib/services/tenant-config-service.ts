import { ConfigParams, TenantConfig, TenantConfigResponse } from '../types/tenant-config';
import { authInterceptor } from './auth-interceptor';

export class TenantConfigService {
  private readonly configUrl: string;

  constructor() {
    // 올바른 control plane URL 사용
    const controlPlaneUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/';
    this.configUrl = `${controlPlaneUrl}tenant-config`;
  }

  // 테스트용 샘플 ConfigParams
  private getSampleConfigParams(tenantId: string): ConfigParams {
    return {
      authServer: `https://cognito-idp.us-west-2.amazonaws.com/${tenantId}`,
      appClientId: 'sample-client-id',
      redirectUrl: 'http://localhost:3000/auth/callback'
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
      
      console.log('Fetching config params from:', url);
      
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
        
        // API 오류 시 테스트용 샘플 데이터 반환
        console.log('Using sample config params for testing');
        return this.getSampleConfigParams(tenantId);
      }

      const data: ConfigParams = await response.json();
      console.log('Config params response:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching config params:', error);
      
      // 네트워크 오류 시 테스트용 샘플 데이터 반환
      console.log('Using sample config params due to network error');
      return this.getSampleConfigParams(tenantId);
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