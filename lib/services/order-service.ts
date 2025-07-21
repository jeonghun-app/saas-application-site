import { Order, CreateOrderRequest, UpdateOrderRequest, OrderStats } from '../types/order';

export class OrderService {
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

  // 주문 목록 조회
  async getOrders(tenantId: string, accessToken?: string): Promise<Order[]> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(this.getUrl(tenantId, 'orders'), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const orderList = Array.isArray(data) ? data : (data.data || []);
      return orderList.map((order: Record<string, unknown>) => this.mapToOrder(order));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // 주문 상세 조회
  async getOrder(tenantId: string, orderId: string, accessToken?: string): Promise<Order> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.getUrl(tenantId, 'orders')}/${orderId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapToOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // 주문 생성
  async createOrder(tenantId: string, orderRequest: CreateOrderRequest, accessToken?: string): Promise<Order> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(this.getUrl(tenantId, 'orders'), {
        method: 'POST',
        headers,
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return this.mapToOrder(data);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // 주문 업데이트
  async updateOrder(tenantId: string, orderId: string, orderData: UpdateOrderRequest, accessToken?: string): Promise<Order> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.getUrl(tenantId, 'orders')}/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.mapToOrder(data);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // 주문 삭제
  async deleteOrder(tenantId: string, orderId: string, accessToken?: string): Promise<void> {
    try {
      const headers = this.getAuthHeaders(accessToken);
      const response = await fetch(`${this.getUrl(tenantId, 'orders')}/${orderId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // 주문 통계 조회
  async getOrderStats(tenantId: string, accessToken?: string): Promise<OrderStats> {
    try {
      const orders = await this.getOrders(tenantId, accessToken);
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const pendingOrders = orders.filter(order => order.status.toLowerCase() === 'pending').length;
      const completedOrders = orders.filter(order => order.status.toLowerCase() === 'completed').length;
      
      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        pendingOrders,
        completedOrders
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }

  // API 응답을 Order 객체로 매핑
  private mapToOrder(apiOrder: Record<string, unknown>): Order {
    const orderProducts = Array.isArray(apiOrder.orderProducts) 
      ? apiOrder.orderProducts 
      : Array.isArray(apiOrder.orderProduct) 
        ? apiOrder.orderProduct 
        : [];

    return {
      orderId: apiOrder.id as string || apiOrder.orderId as string,
      name: apiOrder.name as string,
      orderProducts: orderProducts.map((product: any) => ({
        productId: product.productId as string,
        productName: product.productName as string || product.name as string,
        price: product.price as number,
        quantity: product.quantity as number,
      })),
      totalAmount: apiOrder.totalAmount as number || 0,
      status: apiOrder.status as string || 'pending',
      createdAt: apiOrder.createdAt as string,
      updatedAt: apiOrder.updatedAt as string,
    };
  }
}

// 싱글톤 인스턴스 생성
export const orderService = new OrderService(); 