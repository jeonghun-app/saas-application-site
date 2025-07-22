export interface Product {
  id: string; // tenantId#productName 형식
  name: string;
  description: string;
  currency: string;
  interestRate: number;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  currency: string;
  interestRate: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  currency?: string;
  interestRate?: number;
}

// DynamoDB 형식
export interface DynamoDBProduct {
  id: {
    S: string;
  };
  currency: {
    S: string;
  };
  description: {
    S: string;
  };
  interestRate: {
    N: string;
  };
  name: {
    S: string;
  };
  tenantId?: {
    S: string;
  };
  createdAt?: {
    S: string;
  };
  updatedAt?: {
    S: string;
  };
}

export interface ProductStats {
  totalProducts: number;
  totalRevenue: number;
  averagePrice: number;
  topSellingProducts: Product[];
} 