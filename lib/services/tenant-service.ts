import { Tenant, CreateTenantRequest, TenantStats } from '../types/tenant';
import { TenantRegistration } from '../types/tenant-config';

export class TenantService {
  private readonly tenantRegistrationUrl: string;
  private readonly tenantsUrl: string;

  constructor() {
    const controlPlaneUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/';
    this.tenantRegistrationUrl = `${controlPlaneUrl}tenant-registrations`;
    this.tenantsUrl = `${controlPlaneUrl}tenants`;
  }

  // 인증 헤더 생성
  private getAuthHeaders(accessToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
  }

  // 테넌트 목록 조회
  async getTenants(accessToken?: string): Promise<Tenant[]> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(this.tenantsUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const tenantList = Array.isArray(data) ? data : (data.data || []);
      return tenantList.map((tenant: Record<string, unknown>) => this.mapToTenant(tenant));
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  }

  // 테넌트 생성
  async createTenant(tenantRequest: CreateTenantRequest, accessToken?: string): Promise<Tenant> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      
      const response = await fetch(this.tenantRegistrationUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(tenantRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapToTenant(data);
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  // 테넌트 상세 조회
  async getTenant(tenantId: string, accessToken?: string): Promise<Tenant> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.tenantsUrl}/${tenantId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapToTenant(data);
    } catch (error) {
      console.error('Error fetching tenant:', error);
      throw error;
    }
  }

  // 테넌트 업데이트
  async updateTenant(tenantId: string, tenantData: Partial<Tenant>, accessToken?: string): Promise<Tenant> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.tenantsUrl}/${tenantId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(tenantData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapToTenant(data);
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  // 테넌트 삭제
  async deleteTenant(tenantId: string, accessToken?: string): Promise<void> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.tenantsUrl}/${tenantId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  // 테넌트 통계 조회
  async getTenantStats(accessToken?: string): Promise<TenantStats> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(this.tenantsUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const tenantList = Array.isArray(data) ? data : (data.data || []);
      
      // 통계 계산
      const totalTenants = tenantList.length;
      const activeTenants = tenantList.filter((tenant: Record<string, unknown>) => 
        (tenant.tenantRegistrationData as Record<string, unknown>)?.registrationStatus === 'Active'
      ).length;
      
      return {
        totalTenants,
        activeTenants,
        totalUsers: totalTenants * 5, // 임시 계산
        monthlyRevenue: `$${totalTenants * 99}`, // 임시 계산
      };
    } catch (error) {
      console.error('Error fetching tenant stats:', error);
      // 기본 통계 반환
      return {
        totalTenants: 0,
        activeTenants: 0,
        totalUsers: 0,
        monthlyRevenue: '$0',
      };
    }
  }

  // 테넌트 등록 목록 조회
  async getTenantRegistrations(accessToken?: string): Promise<TenantRegistration[]> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(this.tenantRegistrationUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const registrationList = Array.isArray(data) ? data : (data.data || []);
      return registrationList.map((registration: Record<string, unknown>) => this.mapToTenantRegistration(registration));
    } catch (error) {
      console.error('Error fetching tenant registrations:', error);
      throw error;
    }
  }

  // 테넌트 등록 상세 조회
  async getTenantRegistration(registrationId: string, accessToken?: string): Promise<TenantRegistration> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.tenantRegistrationUrl}/${registrationId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapToTenantRegistration(data);
    } catch (error) {
      console.error('Error fetching tenant registration:', error);
      throw error;
    }
  }

  // 테넌트 등록 업데이트
  async updateTenantRegistration(registrationId: string, registrationData: Partial<TenantRegistration>, accessToken?: string): Promise<TenantRegistration> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.tenantRegistrationUrl}/${registrationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapToTenantRegistration(data);
    } catch (error) {
      console.error('Error updating tenant registration:', error);
      throw error;
    }
  }

  // 테넌트 등록 삭제
  async deleteTenantRegistration(registrationId: string, accessToken?: string): Promise<void> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.tenantRegistrationUrl}/${registrationId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting tenant registration:', error);
      throw error;
    }
  }

  // API 응답을 TenantRegistration 객체로 매핑
  private mapToTenantRegistration(apiRegistration: Record<string, unknown>): TenantRegistration {
    return {
      registrationId: apiRegistration.registrationId as string,
      tenantName: apiRegistration.tenantName as string,
      companyName: apiRegistration.companyName as string,
      tier: apiRegistration.tier as string,
      email: apiRegistration.email as string,
      registrationStatus: apiRegistration.registrationStatus as string,
      createdAt: apiRegistration.createdAt as string,
      updatedAt: apiRegistration.updatedAt as string,
    };
  }

  // 회사명으로 테넌트 URL 생성
  generateTenantUrl(companyName: string): string {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // API 응답을 Tenant 객체로 매핑
  private mapToTenant(apiTenant: Record<string, unknown>): Tenant {
    return {
      tenantId: apiTenant.tenantId as string,
      tenantData: {
        tenantName: apiTenant.tenantName as string,
        companyName: apiTenant.companyName as string,
        tier: apiTenant.tier as string,
        email: apiTenant.email as string,
      },
      tenantRegistrationData: {
        registrationStatus: apiTenant.registrationStatus as string,
      },
    };
  }
}

// 싱글톤 인스턴스 생성
export const tenantService = new TenantService(); 