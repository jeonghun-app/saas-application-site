export interface Product {
  productId: string;
  name: string;
  price: number;
  pictureUrl?: string;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  pictureUrl?: string;
  description?: string;
  category?: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  pictureUrl?: string;
  description?: string;
  category?: string;
}

export interface ProductStats {
  totalProducts: number;
  totalRevenue: number;
  averagePrice: number;
  topSellingProducts: Product[];
} 