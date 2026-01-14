'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Phone,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  DollarSign,
  Building,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workers', href: '/dashboard/workers', icon: Users },
  { name: 'MyPhoner Stats', href: '/dashboard/myphoner', icon: Phone },
  { name: 'Income', href: '/dashboard/income', icon: DollarSign },
  { name: 'Clients', href: '/dashboard/clients', icon: Building },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-dark-950/80 backdrop-blur-xl border-r border-dark-800 transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-asoldi-500 flex items-center justify-center shadow-lg shadow-asoldi-500/25">
            <span className="text-lg font-bold text-white font-display">A</span>
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-white text-lg">
              Asoldi
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-asoldi-500/20 text-asoldi-400 border border-asoldi-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-asoldi-400' : 'text-dark-500 group-hover:text-white'
                }`}
              />
              {!collapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}


