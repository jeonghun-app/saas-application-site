export interface TenantData {
  tenantName: string;
  companyName: string;
  tier: string;
  email: string;
}

export interface TenantRegistrationData {
  registrationStatus: string;
}

export interface Tenant {
  tenantId: string;
  tenantData: TenantData;
  tenantRegistrationData: TenantRegistrationData;
}

export interface CreateTenantRequest {
  tenantName: string;
  companyName: string;
  tier: string;
  email: string;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  monthlyRevenue: string;
} 