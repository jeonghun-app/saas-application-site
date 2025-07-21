import { Product, CreateProductRequest, UpdateProductRequest, ProductStats } from '../types/product';

export class ProductService {
  private readonly baseUrl: string;

  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/';
    this.baseUrl = apiUrl;
  }

  // 테넌트 ID 기반 URL 생성
  private getUrl(tenantId: string, entity: string): string {
    return `${this.baseUrl}${tenantId}/${entity}`;
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

  // 제품 목록 조회
  async getProducts(tenantId: string, accessToken?: string): Promise<Product[]> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(this.getUrl(tenantId, 'products'), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const productList = Array.isArray(data) ? data : (data.data || []);
      return productList.map((product: Record<string, unknown>) => this.mapToProduct(product));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // 제품 상세 조회
  async getProduct(tenantId: string, productId: string, accessToken?: string): Promise<Product> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.getUrl(tenantId, 'products')}/${productId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapToProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // 제품 생성
  async createProduct(tenantId: string, productRequest: CreateProductRequest, accessToken?: string): Promise<Product> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(this.getUrl(tenantId, 'products'), {
        method: 'POST',
        headers,
        body: JSON.stringify(productRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return this.mapToProduct(data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // 제품 업데이트
  async updateProduct(tenantId: string, productId: string, productData: UpdateProductRequest, accessToken?: string): Promise<Product> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.getUrl(tenantId, 'products')}/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapToProduct(data);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // 제품 삭제
  async deleteProduct(tenantId: string, productId: string, accessToken?: string): Promise<void> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.getUrl(tenantId, 'products')}/${productId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // 제품 통계 조회
  async getProductStats(tenantId: string, accessToken?: string): Promise<ProductStats> {
    try {
      const products = await this.getProducts(tenantId, accessToken);
      
      const totalProducts = products.length;
      const totalRevenue = products.reduce((sum, product) => sum + product.price, 0);
      const averagePrice = totalProducts > 0 ? totalRevenue / totalProducts : 0;
      const topSellingProducts = products.slice(0, 5); // 임시로 처음 5개
      
      return {
        totalProducts,
        totalRevenue,
        averagePrice,
        topSellingProducts
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  }

  // API 응답을 Product 객체로 매핑
  private mapToProduct(apiProduct: Record<string, unknown>): Product {
    return {
      productId: apiProduct.productId as string,
      name: apiProduct.name as string,
      price: apiProduct.price as number,
      pictureUrl: apiProduct.pictureUrl as string,
      description: apiProduct.description as string,
      category: apiProduct.category as string,
      createdAt: apiProduct.createdAt as string,
      updatedAt: apiProduct.updatedAt as string,
    };
  }
}

// 싱글톤 인스턴스 생성
export const productService = new ProductService(); 