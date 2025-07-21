import { User, CreateUserRequest } from '../types/user';
import { serviceHelper } from './service-helper';
import { authInterceptor } from './auth-interceptor';

export class UserService {
  // 사용자 목록 조회
  async fetch(): Promise<User[]> {
    try {
      const url = serviceHelper.getUrl('users');
      const response = await authInterceptor.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // 사용자 상세 조회 (이메일로)
  async get(email: string): Promise<User | undefined> {
    try {
      const users = await this.fetch();
      return users.find(user => user.email === email);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // 사용자 생성
  async create(user: CreateUserRequest): Promise<User> {
    try {
      const url = serviceHelper.getUrl('users');
      
      // API 요구사항에 맞게 데이터 변환
      const apiUserData = {
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        userRole: user.userRole,
        enabled: user.enabled,
        status: user.status,
        verified: user.verified
      };
      
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(apiUserData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // 사용자 업데이트 (AWS SaaS Factory에는 구현되지 않았지만 유지)
  async update(email: string, userData: Partial<User>): Promise<User> {
    try {
      const url = `${serviceHelper.getUrl('users')}/${email}`;
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // 사용자 삭제 (AWS SaaS Factory에는 없지만 유지)
  async delete(email: string): Promise<void> {
    try {
      const url = `${serviceHelper.getUrl('users')}/${email}`;
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const userService = new UserService(); 