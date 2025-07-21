export class AuthInterceptor {
  private static instance: AuthInterceptor;
  private authStorage: Storage | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.authStorage = window.localStorage;
    }
  }

  static getInstance(): AuthInterceptor {
    if (!AuthInterceptor.instance) {
      AuthInterceptor.instance = new AuthInterceptor();
    }
    return AuthInterceptor.instance;
  }

  getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  getToken(): string | null {
    if (!this.authStorage) return null;
    
    // AWS SaaS Factory 패턴: id_token 사용
    let token = this.authStorage.getItem('id_token');
    
    // fallback: access_token도 확인
    if (!token) {
      token = this.authStorage.getItem('access_token');
    }
    
    return token;
  }

  setToken(token: string): void {
    if (this.authStorage) {
      this.authStorage.setItem('id_token', token);
    }
  }

  clearToken(): void {
    if (this.authStorage) {
      this.authStorage.removeItem('id_token');
      this.authStorage.removeItem('access_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // fetch 요청에 인증 헤더 추가
  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const authHeaders = this.getAuthHeaders();
    const headers = { ...authHeaders, ...options.headers };
    
    return fetch(url, {
      ...options,
      headers,
    });
  }
}

// 싱글톤 인스턴스
export const authInterceptor = AuthInterceptor.getInstance(); 