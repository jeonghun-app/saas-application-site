export class ServiceHelper {
  private static instance: ServiceHelper;
  private tenantId: string | null = null;

  private constructor() {}

  static getInstance(): ServiceHelper {
    if (!ServiceHelper.instance) {
      ServiceHelper.instance = new ServiceHelper();
    }
    return ServiceHelper.instance;
  }

  getUrl(entity: string): string {
    const tenantId = this.getTenantId();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://023johxt48.execute-api.ap-northeast-2.amazonaws.com/prod/';
    return `${apiUrl}${tenantId}/${entity}`;
  }

  getTenantId(): string {
    if (this.tenantId) {
      return this.tenantId;
    }

    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      // sessionStorage에서 먼저 확인
      let tenantId = window.sessionStorage.getItem('tenantId');
      
      if (!tenantId) {
        const usingCustomDomain = process.env.NEXT_PUBLIC_USING_CUSTOM_DOMAIN === 'true';
        
        if (usingCustomDomain) {
          // 커스텀 도메인 사용 시: subdomain에서 추출
          const hostname = window.location.hostname;
          const parts = hostname.split('.');
          tenantId = parts[0];
        } else {
          // 기본 방식: URL 해시에서 추출 (AWS SaaS Factory 패턴)
          const hash = window.location.hash;
          if (hash) {
            const parts = hash.split('/');
            tenantId = parts[1];
          }
          
          // 해시에서 추출되지 않으면 쿼리 파라미터에서 확인
          if (!tenantId) {
            const query = new URLSearchParams(window.location.search);
            tenantId = query.get('tenantId') || '';
          }
        }
        
        if (tenantId) {
          window.sessionStorage.setItem('tenantId', tenantId);
        }
      }
      
      this.tenantId = tenantId || '';
      return this.tenantId;
    }
    
    return '';
  }

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('tenantId', tenantId);
    }
  }

  clearTenantId(): void {
    this.tenantId = null;
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('tenantId');
    }
  }

  // AWS SaaS Factory 패턴: 해시 기반 네비게이션
  navigateTo(path: string): void {
    if (typeof window !== 'undefined') {
      const tenantId = this.getTenantId();
      if (tenantId) {
        window.location.hash = `/${tenantId}${path}`;
      } else {
        window.location.hash = path;
      }
    }
  }

  // 현재 경로 가져오기
  getCurrentPath(): string {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const parts = hash.split('/');
      // 테넌트 ID를 제외한 경로 반환
      return parts.slice(2).join('/') || 'dashboard';
    }
    return 'dashboard';
  }
}

// 싱글톤 인스턴스
export const serviceHelper = ServiceHelper.getInstance(); 