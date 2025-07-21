'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/lib/contexts/tenant-context';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const quickActions = [
  { name: 'Add Product', href: '/products/create', icon: Package },
  { name: 'New Order', href: '/orders/create', icon: ShoppingCart },
];

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { tenantId } = useTenant();

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setCollapsed(savedCollapsed);
  }, []);

  // Save collapsed state to localStorage and notify other components
  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: newCollapsed }));
  };

  const NavItem = ({ item, isQuickAction = false }: { item: any, isQuickAction?: boolean }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-slate-600 hover:bg-white/50 hover:text-slate-900',
          collapsed && 'justify-center px-2',
          isQuickAction && 'text-xs'
        )}
      >
        <Icon className={cn(
          'flex-shrink-0 transition-all duration-200',
          collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3',
          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
        )} />
        {!collapsed && (
          <span className="truncate">{item.name}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        type="button"
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden",
          "inline-flex items-center justify-center p-2 rounded-xl",
          "text-slate-600 hover:text-slate-900 hover:bg-white/50",
          "focus:outline-none focus:ring-2 focus:ring-blue-500"
        )}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col',
        'bg-white/80 backdrop-blur-xl border-r border-slate-200/50',
        'transition-all duration-300 shadow-xl',
        collapsed ? 'w-20' : 'w-80',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Application</h1>
                {tenantId && (
                  <p className="text-xs text-slate-500 truncate max-w-40">
                    Tenant: {tenantId}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="mx-auto">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
          )}

          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {/* Quick Actions */}
          {!collapsed && (
            <div className="pt-6">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="mt-3 space-y-1">
                {quickActions.map((item) => (
                  <NavItem key={item.name} item={item} isQuickAction />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/50">
          {!collapsed && (
            <div className="text-center">
              <p className="text-xs text-slate-500">
                SaaS Application v1.0
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
} 