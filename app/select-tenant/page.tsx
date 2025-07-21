'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/contexts/tenant-context';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

export default function SelectTenantPage() {
  const router = useRouter();
  const { setTenantId } = useTenant();
  const [inputTenantId, setInputTenantId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sample tenants for demo
  const sampleTenants = [
    { id: 'tenant1', name: 'Acme Corporation', description: 'E-commerce platform' },
    { id: 'tenant2', name: 'TechStart Inc', description: 'SaaS startup' },
    { id: 'tenant3', name: 'Global Solutions', description: 'Enterprise solutions' },
  ];

  const handleTenantSelect = async (tenantId: string) => {
    setIsLoading(true);
    setTenantId(tenantId);
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    router.push('/dashboard');
  };

  const handleCustomTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTenantId.trim()) {
      await handleTenantSelect(inputTenantId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to SaaS Application</h1>
          <p className="text-slate-600">Select your tenant to continue</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Sample Tenants */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Tenants</h3>
            <div className="grid gap-4">
              {sampleTenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleTenantSelect(tenant.id)}
                  disabled={isLoading}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-left">
                    <h4 className="font-medium text-slate-900">{tenant.name}</h4>
                    <p className="text-sm text-slate-500">{tenant.description}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {tenant.id}</p>
                  </div>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tenant Input */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Or Enter Tenant ID</h3>
            <form onSubmit={handleCustomTenant} className="space-y-4">
              <div>
                <label htmlFor="tenantId" className="block text-sm font-medium text-slate-700 mb-2">
                  Tenant ID
                </label>
                <input
                  type="text"
                  id="tenantId"
                  value={inputTenantId}
                  onChange={(e) => setInputTenantId(e.target.value)}
                  placeholder="Enter your tenant ID"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={!inputTenantId.trim() || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600">
              <strong>Need help?</strong> Contact your administrator for the correct tenant ID, 
              or use one of the sample tenants above for demo purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 