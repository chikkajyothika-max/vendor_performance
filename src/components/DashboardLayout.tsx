import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/Toast';
import {
  LayoutDashboard, Users, Package, BarChart3, ShieldAlert, FileText,
  Settings, LogOut, Store, Scale, Lightbulb, Star,
  MessageSquare, X
} from 'lucide-react';
import { useState } from 'react';

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const adminItems: SidebarItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/admin/vendors', label: 'Vendors', icon: <Store className="h-5 w-5" /> },
  { to: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  { to: '/admin/orders', label: 'Orders', icon: <Package className="h-5 w-5" /> },
  { to: '/admin/performance', label: 'Performance', icon: <BarChart3 className="h-5 w-5" /> },
  { to: '/admin/risk', label: 'Risk Prediction', icon: <ShieldAlert className="h-5 w-5" /> },
  { to: '/admin/reports', label: 'Reports', icon: <FileText className="h-5 w-5" /> },
  { to: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

const managerItems: SidebarItem[] = [
  { to: '/manager', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/manager/vendors', label: 'Vendors', icon: <Store className="h-5 w-5" /> },
  { to: '/manager/compare', label: 'Vendor Comparison', icon: <Scale className="h-5 w-5" /> },
  { to: '/manager/performance', label: 'Performance Analysis', icon: <BarChart3 className="h-5 w-5" /> },
  { to: '/manager/risk', label: 'Risk Prediction', icon: <ShieldAlert className="h-5 w-5" /> },
  { to: '/manager/recommendations', label: 'Recommendations', icon: <Lightbulb className="h-5 w-5" /> },
  { to: '/manager/reports', label: 'Reports', icon: <FileText className="h-5 w-5" /> },
];

const vendorItems: SidebarItem[] = [
  { to: '/vendor', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/vendor/profile', label: 'Profile', icon: <Store className="h-5 w-5" /> },
  { to: '/vendor/orders', label: 'Orders', icon: <Package className="h-5 w-5" /> },
  { to: '/vendor/performance', label: 'Performance', icon: <BarChart3 className="h-5 w-5" /> },
  { to: '/vendor/complaints', label: 'Complaints', icon: <MessageSquare className="h-5 w-5" /> },
  { to: '/vendor/feedback', label: 'Feedback', icon: <Star className="h-5 w-5" /> },
];

export function DashboardLayout({ children, role }: { children: React.ReactNode; role: 'admin' | 'manager' | 'vendor' }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = role === 'admin' ? adminItems : role === 'manager' ? managerItems : vendorItems;
  const roleLabel = role === 'admin' ? 'Admin Panel' : role === 'manager' ? 'Procurement Manager' : 'Vendor Portal';

  const handleLogout = async () => {
    await signOut();
    showToast('info', 'You have been logged out');
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
          AI
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">VendorAI</p>
          <p className="text-xs text-gray-500">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/${role}`}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition mb-0.5 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
            {profile?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{profile?.name}</p>
            <p className="truncate text-xs text-gray-500">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white animate-slide-in-right">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 text-gray-400">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold text-gray-900">VendorAI</span>
          <div className="w-6" />
        </div>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
