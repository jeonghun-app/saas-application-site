import { Product, CreateProductRequest, ProductStats } from '../types/product';
import { serviceHelper } from './service-helper';
import { authInterceptor } from './auth-interceptor';

export class ProductService {
  // 제품 목록 조회
  async fetch(): Promise<Product[]> {
    try {
      const url = serviceHelper.getUrl('products');
      const response = await authInterceptor.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // 제품 상세 조회
  async get(productId: string): Promise<Product> {
    try {
      const url = `${serviceHelper.getUrl('products')}/${productId}`;
      const response = await authInterceptor.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // 제품 생성
  async post(product: CreateProductRequest): Promise<Product> {
    try {
      const url = serviceHelper.getUrl('products');
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // 제품 업데이트
  async put(product: Product): Promise<Product> {
    try {
      const url = `${serviceHelper.getUrl('products')}/${product.productId}`;
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // 제품 삭제
  async delete(product: Product): Promise<void> {
    try {
      const url = `${serviceHelper.getUrl('products')}/${product.productId}`;
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // 제품 통계 조회 (AWS SaaS Factory에는 없지만 유지)
  async getProductStats(): Promise<ProductStats> {
    try {
      const url = `${serviceHelper.getUrl('products')}/stats`;
      const response = await authInterceptor.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        totalProducts: data.totalProducts || 0,
        totalRevenue: data.totalRevenue || 0,
        averagePrice: data.averagePrice || 0,
        topSellingProducts: data.topSellingProducts || []
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      // 기본 통계 반환
      return {
        totalProducts: 0,
        totalRevenue: 0,
        averagePrice: 0,
        topSellingProducts: []
      };
    }
  }
}

// 싱글톤 인스턴스 생성
export const productService = new ProductService(); 