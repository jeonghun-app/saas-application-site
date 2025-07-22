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

  // DynamoDB 형식을 일반 객체로 변환
  private mapFromDynamoDB(dynamoItem: DynamoDBProduct): Product {
    return {
      id: dynamoItem.id.S,
      name: dynamoItem.name.S,
      description: dynamoItem.description.S,
      currency: dynamoItem.currency.S,
      interestRate: parseFloat(dynamoItem.interestRate.N),
      tenantId: dynamoItem.tenantId?.S || '',
      createdAt: dynamoItem.createdAt?.S,
      updatedAt: dynamoItem.updatedAt?.S,
    };
  }

  // 일반 객체를 DynamoDB 형식으로 변환
  private mapToDynamoDB(product: CreateProductRequest, tenantId: string): DynamoDBProduct {
    const id = `${tenantId}#${product.name}`;
    return {
      id: { S: id },
      name: { S: product.name },
      description: { S: product.description },
      currency: { S: product.currency },
      interestRate: { N: product.interestRate.toString() },
      tenantId: { S: tenantId },
      createdAt: { S: new Date().toISOString() },
      updatedAt: { S: new Date().toISOString() },
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
      
      return products.map((item: DynamoDBProduct) => this.mapFromDynamoDB(item));
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
      return this.mapFromDynamoDB(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // 상품 생성
  async createProduct(product: CreateProductRequest, tenantId: string, accessToken?: string): Promise<Product> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const dynamoProduct = this.mapToDynamoDB(product, tenantId);
      
      const response = await fetch(`/api/products?tenantId=${encodeURIComponent(tenantId)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dynamoProduct),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapFromDynamoDB(data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // 상품 수정
  async updateProduct(productId: string, tenantId: string, updates: UpdateProductRequest, accessToken?: string): Promise<Product> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      
      // DynamoDB 형식으로 변환
      const dynamoUpdates: Record<string, { S: string } | { N: string }> = {
        updatedAt: { S: new Date().toISOString() }
      };
      
      if (updates.name) dynamoUpdates.name = { S: updates.name };
      if (updates.description) dynamoUpdates.description = { S: updates.description };
      if (updates.currency) dynamoUpdates.currency = { S: updates.currency };
      if (updates.interestRate !== undefined) dynamoUpdates.interestRate = { N: updates.interestRate.toString() };

      const response = await fetch(`/api/products/${encodeURIComponent(productId)}?tenantId=${encodeURIComponent(tenantId)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dynamoUpdates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapFromDynamoDB(data);
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