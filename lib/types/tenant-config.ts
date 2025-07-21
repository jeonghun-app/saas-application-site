// AWS SaaS Factory ConfigParams 패턴
export interface ConfigParams {
  authServer: string;
  appClientId: string;
  redirectUrl: string;
}

// DynamoDB 응답 형식 (실제 API 응답)
export interface TenantConfigResponse {
  TENANT_ID: { S: string };
  AUTH_CLEAR_HASH_AFTER_LOGIN: { BOOL: boolean };
  AUTH_CLIENT_ID: { S: string };
  AUTH_REDIRECT_URI: { S: string };
  AUTH_SERVER: { S: string };
  AUTH_SESSION_CHECKS_ENABLED: { BOOL: boolean };
  AUTH_SHOW_DEBUG_INFO: { BOOL: boolean };
  AUTH_SR_REDIRECT_URI: { S: string };
  AUTH_SR_TIMEOUT: { N: string };
  AUTH_TIMEOUT_FACTOR: { N: string };
  AUTH_USE_SR: { BOOL: boolean };
  COGNITO_DOMAIN: { S: string };
  COMPANY_NAME: { S: string };
  PLAN: { S: string };
  TENANT_EMAIL: { S: string };
}

// 내부 사용용 TenantConfig (DynamoDB 응답을 변환한 형태)
export interface TenantConfig {
  TENANT_ID: string;
  AUTH_CLEAR_HASH_AFTER_LOGIN: boolean;
  AUTH_CLIENT_ID: string;
  AUTH_REDIRECT_URI: string;
  AUTH_SERVER: string;
  AUTH_SESSION_CHECKS_ENABLED: boolean;
  AUTH_SHOW_DEBUG_INFO: boolean;
  AUTH_SR_REDIRECT_URI: string;
  AUTH_SR_TIMEOUT: number;
  AUTH_TIMEOUT_FACTOR: number;
  AUTH_USE_SR: boolean;
  COGNITO_DOMAIN: string;
  COMPANY_NAME: string;
  PLAN: string;
  TENANT_EMAIL: string;
}

export interface TenantRegistration {
  registrationId: string;
  tenantName: string;
  companyName: string;
  tier: string;
  email: string;
  registrationStatus: string;
  createdAt: string;
  updatedAt: string;
} 