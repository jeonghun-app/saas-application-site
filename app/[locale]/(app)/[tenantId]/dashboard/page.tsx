'use client';

import { useState, useEffect, use } from 'react';

import { useTenant } from '@/lib/contexts/tenant-context';
import { useAuth } from 'react-oidc-context';
import { serviceHelper } from '@/lib/services/service-helper';
import { authInterceptor } from '@/lib/services/auth-interceptor';
import { orderService } from '@/lib/services/order-service';
import { useTranslations } from 'next-intl';
import { Order, OrderProduct } from '@/lib/types/order';
import { getCompanyName, getTenantPlan } from '@/lib/auth-config';
import LogoutButton from '@/components/auth/logout-button';
import LanguageSwitcher from '@/components/language-switcher';
import { 
  Package as PackageIcon, 
  ShoppingCart as ShoppingCartIcon, 
  DollarSign as DollarSignIcon,
  TrendingUp as TrendingUpIcon,
  Activity,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Building2,
  Shield,
  Mail
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface DashboardPageProps {
  params: Promise<{
    tenantId: string;
  }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const { tenantId: contextTenantId, tenantConfig, loading: tenantLoading, error: tenantError } = useTenant();
  const auth = useAuth();
  const { tenantId } = use(params); // Promise를 unwrap
  
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL의 tenantId를 컨텍스트에 설정
    if (tenantId && tenantId !== contextTenantId) {
      serviceHelper.setTenantId(tenantId);
    }
  }, [tenantId, contextTenantId]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!tenantId || !tenantConfig) return;
      try {
        setLoading(true);
        setError(null);
        serviceHelper.setTenantId(tenantId);
        const isAuthenticated = authInterceptor.isAuthenticated();
        if (isAuthenticated) {
          try {
            const ordersData = await orderService.fetch();
            setOrders(ordersData);
            const totalRevenue = ordersData.reduce((sum: number, order: Order) => {
              return sum + order.orderProduct.reduce((orderSum: number, item: OrderProduct) => {
                return orderSum + (item.price * item.quantity);
              }, 0);
            }, 0);
            setStats({
              totalProducts: 0, // 상품 수는 미사용
              totalOrders: ordersData.length,
              totalRevenue,
              pendingOrders: 0
            });
          } catch {
            setOrders([]);
            setStats({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
          }
        } else {
          setOrders([]);
          setStats({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.dashboardDataError'));
        setOrders([]);
        setStats({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [tenantId, tenantConfig, t]);

  const statCards = [
    {
      title: t('stats.totalOrders'),
      value: loading ? '...' : stats.totalOrders.toString(),
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingCartIcon,
      color: 'from-green-500 to-green-600',
      href: '/orders'
    },
    {
      title: t('stats.revenue'),
      value: loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`,
      change: '+15%',
      changeType: 'positive',
      icon: DollarSignIcon,
      color: 'from-purple-500 to-purple-600',
      href: '/orders'
    },
    {
      title: t('stats.pendingOrders'),
      value: loading ? '...' : stats.pendingOrders.toString(),
      change: '-5%',
      changeType: 'negative',
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      href: '/orders?status=pending'
    },
  ];

  if (tenantLoading) {
    return (
      <div className="space-y-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (tenantError) {
    return (
      <div className="space-y-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('errors.tenantConfigError')}</h2>
            <p className="text-slate-600 mb-6">{tenantError}</p>
            <button 
              onClick={() => serviceHelper.navigateTo('/select-tenant')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
            >
              {t('errors.selectTenantAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      {/* 로그인 유저 정보 */}
      {auth.isAuthenticated && auth.user && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
          <p className="text-sm text-green-700">
            <strong>{t('auth.loggedInAs')}</strong> {auth.user.profile?.email} {auth.user.profile?.name && `(${auth.user.profile?.name})`}
          </p>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {tenantConfig ? `${getCompanyName(tenantConfig)} ${t('title')}` : t('title')}
          </h1>
          <p className="text-slate-600 mt-2">
            {t('welcomeMessage')}
          </p>
          {/* 플랜별 한도 표시 */}
          {tenantConfig && (
            <p className="text-xs text-slate-500 mt-1">
              <strong>{tCommon('plan')}:</strong> {getTenantPlan(tenantConfig)} | <strong>{t('tenantInfo.productLimit')}</strong> 100 | <strong>{t('tenantInfo.orderLimit')}</strong> 1000
            </p>
          )}
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {authInterceptor.isAuthenticated() ? (
            <LogoutButton className="px-6 py-3">
              {tNav('logout')}
            </LogoutButton>
          ) : null}
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            <TrendingUpIcon className="h-5 w-5 mr-2 inline" />
            {t('actions.viewAnalytics')}
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
      {/* Demo Notice */}
      {!authInterceptor.isAuthenticated() && (
        <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          <p className="text-sm text-blue-700">
            <strong>{t('auth.demoMode')}</strong> {t('auth.demoModeDesc')}
          </p>
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm rounded-2xl p-6 cursor-pointer"
            onClick={() => serviceHelper.navigateTo(stat.href)}
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
                  <span className="text-sm text-slate-500 ml-1">{t('stats.fromLastMonth')}</span>
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
        <div 
          className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all duration-300 cursor-pointer rounded-2xl p-6"
                      onClick={() => window.location.href = `/${tenantId}/products/create`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t('actions.addProduct')}</h3>
              <p className="text-blue-100 text-sm mt-1">{t('actions.addProductDesc')}</p>
            </div>
            <PackageIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div 
          className="border-0 bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-all duration-300 cursor-pointer rounded-2xl p-6"
          onClick={() => serviceHelper.navigateTo('/orders/create')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t('actions.newOrder')}</h3>
              <p className="text-green-100 text-sm mt-1">{t('actions.newOrderDesc')}</p>
            </div>
            <ShoppingCartIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div 
          className="border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all duration-300 cursor-pointer rounded-2xl p-6"
          onClick={() => serviceHelper.navigateTo('/analytics')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t('actions.viewReports')}</h3>
              <p className="text-purple-100 text-sm mt-1">{t('actions.viewReportsDesc')}</p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>
      {/* 최근 주문 미리보기 */}
      {orders.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">{t('recentOrders')}</h3>
          <ul className="divide-y divide-slate-200 bg-white/60 rounded-xl">
            {orders.slice(0, 3).map(order => (
              <li key={order.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="font-mono text-slate-700">#{order.id}</span>
                <span className="text-slate-600">{t('customerOrder')}</span>
                <span className="text-slate-900 font-bold">${order.orderProduct?.reduce((sum: number, item: OrderProduct) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Tenant Info */}
      {tenantConfig && (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('tenantInfo.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('tenantInfo.tenantId')}</p>
              <p className="text-slate-900 font-mono bg-slate-100 px-3 py-1 rounded mt-1">
                {tenantId}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">{t('tenantInfo.company')}</p>
              <p className="text-slate-900">{getCompanyName(tenantConfig)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">{t('tenantInfo.plan')}</p>
              <p className="text-slate-900">{getTenantPlan(tenantConfig)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">{t('tenantInfo.authentication')}</p>
              <p className="text-slate-900">
                {authInterceptor.isAuthenticated() ? t('tenantInfo.authenticated') : t('tenantInfo.notAuthenticated')}
              </p>
            </div>
          </div>
          
          {/* Auth Configuration */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-md font-semibold text-slate-900 mb-3">{t('tenantInfo.authConfig')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">{t('tenantInfo.cognitoDomain')}</span>
                <span className="text-sm text-slate-900 font-mono">{tenantConfig.COGNITO_DOMAIN}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">{t('tenantInfo.clientId')}</span>
                <span className="text-sm text-slate-900 font-mono">{tenantConfig.AUTH_CLIENT_ID}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">{t('tenantInfo.tenantEmail')}</span>
                <span className="text-sm text-slate-900">{tenantConfig.TENANT_EMAIL}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 