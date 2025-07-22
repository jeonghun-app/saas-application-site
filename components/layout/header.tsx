'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useTenant } from '@/lib/contexts/tenant-context';
import { authInterceptor } from '@/lib/services/auth-interceptor';
import { serviceHelper } from '@/lib/services/service-helper';
import { 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  Search,
  Settings,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const { tenantId, clearTenant } = useTenant();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  const handleLogout = async () => {
    try {
      console.log('🔐 Starting simple logout process from header...');
      
      // 1. 사용자 메뉴 닫기
      setUserMenuOpen(false);
      
      // 2. react-oidc-context 사용자 제거 (로컬 로그아웃)
      if (auth.isAuthenticated) {
        try {
          console.log('🔐 Removing user from OIDC context...');
          await auth.removeUser();
        } catch (oidcError) {
          console.warn('🔐 OIDC removeUser failed:', oidcError);
        }
      }
      
      // 3. 모든 로컬 데이터 클리어
      authInterceptor.clearToken();
      clearTenant();
      serviceHelper.clearTenantId();
      
      // 4. 브라우저 저장소 완전히 정리
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // 쿠키도 정리 (필요한 경우)
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
      
      console.log('🔐 All data cleared, redirecting to tenant selection...');
      
      // 5. 테넌트 선택 페이지로 즉시 리다이렉트
      setTimeout(() => {
        window.location.href = '/select-tenant';
      }, 100);
      
    } catch (error) {
      console.error('🔐 Logout error:', error);
      // 에러가 발생해도 강제로 테넌트 선택 페이지로 이동
      window.location.href = '/select-tenant';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-slate-900">Application</h2>
          {tenantId && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{tenantId}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {searchOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products, orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </form>
                
                {/* Quick search suggestions */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quick Search</p>
                  <div className="space-y-1">
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                      Recent Products
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                      Pending Orders
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Menu */}
          <div ref={userMenuRef} className="relative">
            {auth.isAuthenticated ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  userMenuOpen && "rotate-180"
                )} />
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">로그인</span>
              </button>
            )}

            {userMenuOpen && auth.isAuthenticated && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">
                    {auth.user?.profile?.name || auth.user?.profile?.email || 'Application User'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {auth.user?.profile?.email || `user@${tenantId || 'example'}.com`}
                  </p>
                  {auth.isAuthenticated && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Authenticated
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="py-2">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>
                </div>
                
                <div className="border-t border-slate-100 py-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 