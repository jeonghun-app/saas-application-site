export interface OrderProduct {
  productId: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  name: string;
  orderProduct: OrderProduct[];
}

export interface CreateOrderRequest {
  name: string;
  orderProduct: OrderProduct[];
}

export interface UpdateOrderRequest {
  name?: string;
  orderProduct?: OrderProduct[];
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
} 