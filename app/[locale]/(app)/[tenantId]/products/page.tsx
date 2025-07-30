'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { useTranslations } from 'next-intl';
import { productService } from '@/lib/services/product-service';
import { Product } from '@/lib/types/product';
// UI 컴포넌트 대신 HTML 요소 사용
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  DollarSign,
  Percent,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { serviceHelper } from '@/lib/services/service-helper';
import { useLocaleNavigation } from '@/lib/utils/navigation';

interface ProductPageProps {
  params: Promise<{
    tenantId: string;
  }>;
}

export default function ProductsPage({ params }: ProductPageProps) {
  const { tenantId: contextTenantId } = useTenant();
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const auth = useAuth();
  const { tenantId } = use(params); // Promise를 unwrap
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const { locale } = useLocaleNavigation();

  useEffect(() => {
    // URL의 tenantId를 컨텍스트에 설정
    if (tenantId && tenantId !== contextTenantId) {
      serviceHelper.setTenantId(tenantId);
    }
  }, [tenantId, contextTenantId]);

  // 상품 목록 로드
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!auth.isAuthenticated || !auth.user?.access_token || !tenantId) {
          throw new Error('인증 또는 테넌트 정보가 필요합니다.');
        }

        const productsData = await productService.getProducts(tenantId, auth.user.access_token);
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '상품 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated && tenantId) {
      loadProducts();
    }
  }, [auth.isAuthenticated, auth.user?.access_token, tenantId]);

  // 상품 삭제
  const handleDelete = async (productId: string) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      if (!auth.user?.access_token) {
        throw new Error(tCommon('error'));
      }

              await productService.deleteProduct(productId, tenantId, auth.user.access_token);
      
      // 목록에서 제거
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert(err instanceof Error ? err.message : t('deleteError'));
    }
  };

  // 필터링된 상품 목록
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCurrency = selectedCurrency === 'all' || product.currency === selectedCurrency;
    
    return matchesSearch && matchesCurrency;
  });

  // 통화 목록 (중복 제거)
  const currencies = [...new Set(products.map(p => p.currency))];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-600 mt-2">{t('description')}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => serviceHelper.navigateTo('/products/create')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('createProduct')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-0 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{tCommon('total')} {tCommon('products')}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-0 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('averageRate')}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {products.length > 0 
                    ? `${(products.reduce((sum, p) => sum + p.interestRate, 0) / products.length).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                <Percent className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-0 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('supportedCurrency')}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{currencies.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-0 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{t('filterAll')} {t('supportedCurrency')}</option>
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="border-0 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="p-12">
                          <div className="text-center">
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">{t('noProducts')}</h3>
                <p className="text-slate-600 mb-6">{t('description')}</p>
                <button 
                  onClick={() => serviceHelper.navigateTo('/products/create')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createProduct')}
                </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="p-6 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => serviceHelper.navigateTo(`/products/${product.id}/edit`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 mt-2">
                  {product.description}
                </p>
              </div>
              <div className="px-6 pb-6">
                                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">{t('interestRate')}</span>
                      <span className="text-lg font-bold text-green-600">{product.interestRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">{t('currency')}</span>
                      <span className="text-sm font-medium text-slate-900">{product.currency}</span>
                    </div>
                    {product.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">{t('registrationDate')}</span>
                        <span className="text-sm text-slate-500">
                          {new Date(product.createdAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                        </span>
                      </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 