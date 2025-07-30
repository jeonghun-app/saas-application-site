'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { productService } from '@/lib/services/product-service';
import { CreateProductRequest } from '@/lib/types/product';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';
import { serviceHelper } from '@/lib/services/service-helper';

interface CreateProductPageProps {
  params: Promise<{
    tenantId: string;
  }>;
}

export default function CreateProductPage({ params }: CreateProductPageProps) {
  const { tenantId: contextTenantId } = useTenant();
  const auth = useAuth();
  const { tenantId } = use(params); // Promise를 unwrap

  useEffect(() => {
    // URL의 tenantId를 컨텍스트에 설정
    if (tenantId && tenantId !== contextTenantId) {
      serviceHelper.setTenantId(tenantId);
    }
  }, [tenantId, contextTenantId]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    currency: 'KRW',
    interestRate: 0
  });

  const handleInputChange = (field: keyof CreateProductRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 메시지 클리어
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('상품명을 입력해주세요.');
      return false;
    }
    if (!formData.description.trim()) {
      setError('상품 설명을 입력해주세요.');
      return false;
    }
    if (!formData.currency) {
      setError('통화를 선택해주세요.');
      return false;
    }
    if (formData.interestRate < 0) {
      setError('금리는 0 이상이어야 합니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (!auth.isAuthenticated || !auth.user?.access_token || !tenantId) {
        throw new Error('인증 또는 테넌트 정보가 필요합니다.');
      }

      await productService.createProduct(formData, tenantId, auth.user.access_token);
      setSuccess(true);
      
      // 2초 후 목록 페이지로 이동
      setTimeout(() => {
        window.location.href = `/${tenantId}/products`;
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '상품 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">상품 등록 완료!</h2>
            <p className="text-slate-600">상품이 성공적으로 등록되었습니다.</p>
            <p className="text-sm text-slate-500 mt-2">잠시 후 목록 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => serviceHelper.navigateTo('/products')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">금융상품 등록</h1>
            <p className="text-slate-600 mt-2">새로운 금융상품을 등록합니다.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 상품명 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                상품명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="예: 자유입출금통장"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 상품 설명 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                상품 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="상품에 대한 자세한 설명을 입력하세요"
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 통화 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                통화 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="KRW">KRW (원화)</option>
                <option value="USD">USD (달러)</option>
                <option value="EUR">EUR (유로)</option>
                <option value="JPY">JPY (엔화)</option>
                <option value="CNY">CNY (위안화)</option>
              </select>
            </div>

            {/* 금리 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                금리 (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                placeholder="예: 3.5"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => window.location.href = `/${tenantId}/products`}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    상품 등록
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 