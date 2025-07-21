export interface Product {
  productId: string;
  name: string;
  price: number;
  pictureUrl?: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  pictureUrl?: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  pictureUrl?: string;
}

export interface ProductStats {
  totalProducts: number;
  totalRevenue: number;
  averagePrice: number;
  topSellingProducts: Product[];
} 