import { Product, CreateProductRequest, UpdateProductRequest, DynamoDBProduct } from '@/lib/types/product';

export class ProductService {
  constructor() {
    // API calls now go through Next.js API routes
  }

  private getAuthHeaders(accessToken?: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    };
  }



  // 상품 목록 조회
  async getProducts(tenantId: string, accessToken?: string): Promise<Product[]> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`/api/products?tenantId=${encodeURIComponent(tenantId)}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const products = Array.isArray(data) ? data : (data.data || []);
      
      return products; // API에서 이미 일반 객체 형태로 반환
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // 상품 조회
  async getProduct(productId: string, tenantId: string, accessToken?: string): Promise<Product | null> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}?tenantId=${encodeURIComponent(tenantId)}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data; // API에서 이미 일반 객체 형태로 반환
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // 상품 생성
  async createProduct(product: CreateProductRequest, tenantId: string, accessToken?: string): Promise<Product> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      
      // 일반 객체를 API로 전송 (API에서 DynamoDB 변환 처리)
      const response = await fetch(`/api/products?tenantId=${encodeURIComponent(tenantId)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data; // API에서 이미 일반 객체 형태로 반환
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // 상품 수정
  async updateProduct(productId: string, tenantId: string, updates: UpdateProductRequest, accessToken?: string): Promise<Product> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      
      // 일반 객체를 API로 전송 (API에서 DynamoDB 변환 처리)
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}?tenantId=${encodeURIComponent(tenantId)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data; // API에서 이미 일반 객체 형태로 반환
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // 상품 삭제
  async deleteProduct(productId: string, tenantId: string, accessToken?: string): Promise<void> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}?tenantId=${encodeURIComponent(tenantId)}`, {
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
}

export const productService = new ProductService(); 