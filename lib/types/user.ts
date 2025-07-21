export interface User {
  email: string;
  created?: string;
  modified?: string;
  enabled?: boolean;
  status?: string;
  verified?: boolean;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  userRole: string;
  enabled?: boolean;
  status?: string;
  verified?: boolean;
} 