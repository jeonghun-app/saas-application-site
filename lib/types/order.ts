export interface OrderProduct {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  name: string;
  orderProducts: OrderProduct[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  name: string;
  orderProducts: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderRequest {
  name?: string;
  status?: string;
  orderProducts?: {
    productId: string;
    quantity: number;
  }[];
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
} 