import { Order, CreateOrderRequest, UpdateOrderRequest, OrderStats } from '../types/order';
import { serviceHelper } from './service-helper';
import { authInterceptor } from './auth-interceptor';

export class OrderService {
  orders: Order[] = [];

  // 주문 목록 조회
  async fetch(): Promise<Order[]> {
    try {
      const url = serviceHelper.getUrl('orders');
      const response = await authInterceptor.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.orders = Array.isArray(data) ? data : [];
      return this.orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // 주문 상세 조회
  async get(orderId: string): Promise<Order> {
    try {
      const url = `${serviceHelper.getUrl('orders')}/${orderId}`;
      const response = await authInterceptor.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // 주문 생성
  async create(order: CreateOrderRequest): Promise<Order> {
    try {
      const url = serviceHelper.getUrl('orders');
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // 주문 업데이트 (AWS SaaS Factory에는 없지만 유지)
  async update(orderId: string, orderData: UpdateOrderRequest): Promise<Order> {
    try {
      const url = `${serviceHelper.getUrl('orders')}/${orderId}`;
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // 주문 삭제 (AWS SaaS Factory에는 없지만 유지)
  async delete(orderId: string): Promise<void> {
    try {
      const url = `${serviceHelper.getUrl('orders')}/${orderId}`;
      const response = await authInterceptor.fetchWithAuth(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // 주문 통계 조회 (AWS SaaS Factory에는 없지만 유지)
  async getOrderStats(): Promise<OrderStats> {
    try {
      const url = `${serviceHelper.getUrl('orders')}/stats`;
      const response = await authInterceptor.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        averageOrderValue: data.averageOrderValue || 0,
        pendingOrders: data.pendingOrders || 0,
        completedOrders: data.completedOrders || 0
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      // 기본 통계 반환
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        completedOrders: 0
      };
    }
  }
}

// 싱글톤 인스턴스 생성
export const orderService = new OrderService(); 