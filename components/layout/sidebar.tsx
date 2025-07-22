'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { serviceHelper } from '@/lib/services/service-helper';
import { useTenant } from '@/lib/contexts/tenant-context';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { tenantId } = useTenant();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: '금융상품 관리', href: '/products', icon: Package },
  ];

  const quickActions = [
    { name: '상품 등록', href: '/products/create', icon: Package },
  ];

  if (!tenantId) {
    return null;
  }

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const fullPath = `/${tenantId}${item.href}`;
    const isActive = pathname === fullPath;

    return (
      <Link
        href={fullPath}
        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
        {item.name}
        {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
      </Link>
    );
  };

  const QuickActionItem = ({ item }: { item: typeof quickActions[0] }) => {
    const fullPath = `/${tenantId}${item.href}`;

    return (
      <Link
        href={fullPath}
        className="group flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
      >
        <item.icon className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-600" />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
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
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        // 'fixed inset-y-0 left-0 z-50 flex flex-col', // 기존
        'h-screen flex flex-col', // static, flex row의 첫 번째 자식
        'bg-white/80 backdrop-blur-xl border-r border-slate-200/50',
        'transition-all duration-300 shadow-xl',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              {/* Building2 icon removed as per new_code */}
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

          {/* Collapse button removed as per new_code */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-6">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="mt-3 space-y-1">
              {quickActions.map((item) => (
                <QuickActionItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/50">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              AWS SaaS Factory Pattern
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Hash-based Routing
            </p>
          </div>
        </div>
      </aside>
    </>
  );
} 