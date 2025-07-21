'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/contexts/tenant-context';
import { productService } from '@/lib/services/product-service';
import { orderService } from '@/lib/services/order-service';
import { 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  ArrowUpRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function DashboardPage() {
  const { tenantId } = useTenant();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!tenantId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 병렬로 데이터 가져오기 (인증 토큰 없이 임시)
        const [productStats, orderStats] = await Promise.all([
          productService.getProductStats(tenantId).catch(() => ({ totalProducts: 0, totalRevenue: 0, averagePrice: 0, topSellingProducts: [] })),
          orderService.getOrderStats(tenantId).catch(() => ({ totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, pendingOrders: 0, completedOrders: 0 }))
        ]);

        setStats({
          totalProducts: productStats.totalProducts,
          totalOrders: orderStats.totalOrders,
          totalRevenue: orderStats.totalRevenue,
          pendingOrders: orderStats.pendingOrders
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
        // 에러 시 샘플 데이터 표시
        setStats({
          totalProducts: 12,
          totalOrders: 45,
          totalRevenue: 12580,
          pendingOrders: 8
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [tenantId]);

  const statCards = [
    {
      title: 'Total Products',
      value: loading ? '...' : stats.totalProducts.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      href: '/products'
    },
    {
      title: 'Total Orders',
      value: loading ? '...' : stats.totalOrders.toString(),
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      href: '/orders'
    },
    {
      title: 'Revenue',
      value: loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`,
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      href: '/orders'
    },
    {
      title: 'Pending Orders',
      value: loading ? '...' : stats.pendingOrders.toString(),
      change: '-5%',
      changeType: 'negative',
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      href: '/orders?status=pending'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            <TrendingUp className="h-5 w-5 mr-2 inline" />
            View Analytics
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm rounded-2xl p-6 cursor-pointer"
            onClick={() => window.location.href = stat.href}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-500 mr-1 rotate-90" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-slate-500 ml-1">from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all duration-300 cursor-pointer rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Add Product</h3>
              <p className="text-blue-100 text-sm mt-1">Create a new product listing</p>
            </div>
            <Package className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="border-0 bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-all duration-300 cursor-pointer rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">New Order</h3>
              <p className="text-green-100 text-sm mt-1">Create a new customer order</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all duration-300 cursor-pointer rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">View Reports</h3>
              <p className="text-purple-100 text-sm mt-1">Analyze business metrics</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tenant Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600">Tenant ID</p>
            <p className="text-slate-900 font-mono bg-slate-100 px-3 py-1 rounded mt-1">
              {tenantId}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Environment</p>
            <p className="text-slate-900">Development</p>
          </div>
        </div>
      </div>
    </div>
  );
} 