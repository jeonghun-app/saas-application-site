import { TenantConfig } from './types/tenant-config';

export interface AuthConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  silent_redirect_uri: string;
  response_type: string;
  scope: string;
  loadUserInfo: boolean;
  automaticSilentRenew: boolean;
  silentRequestTimeout: number;
  monitorSession: boolean;
  clearHashAfterLogin: boolean;
  debug: boolean;
}

export function createAuthConfig(tenantConfig: TenantConfig): AuthConfig {
  return {
    authority: tenantConfig.AUTH_SERVER,
    client_id: tenantConfig.AUTH_CLIENT_ID,
    redirect_uri: tenantConfig.AUTH_REDIRECT_URI,
    silent_redirect_uri: tenantConfig.AUTH_SR_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    loadUserInfo: true,
    automaticSilentRenew: tenantConfig.AUTH_USE_SR,
    silentRequestTimeout: tenantConfig.AUTH_SR_TIMEOUT,
    monitorSession: tenantConfig.AUTH_SESSION_CHECKS_ENABLED,
    clearHashAfterLogin: tenantConfig.AUTH_CLEAR_HASH_AFTER_LOGIN,
    debug: tenantConfig.AUTH_SHOW_DEBUG_INFO
  };
}

export function getCognitoDomain(tenantConfig: TenantConfig): string {
  return tenantConfig.COGNITO_DOMAIN;
}

export function getCompanyName(tenantConfig: TenantConfig): string {
  return tenantConfig.COMPANY_NAME;
}

export function getTenantPlan(tenantConfig: TenantConfig): string {
  return tenantConfig.PLAN;
} 