import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastContainer } from '@/components/Toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import type { UserRole } from '@/types';

// Public
import { Home } from '@/pages/public/Home';
import { About } from '@/pages/public/About';
import { Features } from '@/pages/public/Features';
import { Contact } from '@/pages/public/Contact';
import { Login, Register } from '@/pages/public/Login';

// Admin
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { VendorManagement } from '@/pages/admin/VendorManagement';
import { UserManagement } from '@/pages/admin/UserManagement';
import { OrderManagement } from '@/pages/admin/OrderManagement';
import { PerformanceAnalytics } from '@/pages/admin/PerformanceAnalytics';
import { Settings } from '@/pages/admin/Settings';

// Shared
import { VendorDetails } from '@/pages/shared/VendorDetails';
import { RiskPredictionPage } from '@/pages/shared/RiskPrediction';
import { Reports } from '@/pages/shared/Reports';

// Manager
import { ManagerDashboard } from '@/pages/manager/ManagerDashboard';
import { ManagerVendors } from '@/pages/manager/ManagerVendors';
import { VendorComparison } from '@/pages/manager/VendorComparison';
import { Recommendations } from '@/pages/manager/Recommendations';

// Vendor
import { VendorDashboard } from '@/pages/vendor/VendorDashboard';
import { VendorProfile, VendorOrders, VendorPerformance, VendorComplaints, VendorFeedback } from '@/pages/vendor/VendorPages';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" /></div>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'admin') return <Navigate to="/admin" replace />;
    if (profile.role === 'manager') return <Navigate to="/manager" replace />;
    if (profile.role === 'vendor') return <Navigate to="/vendor" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/vendors" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><VendorManagement /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/vendors/:vendorId" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><VendorDetails backLink="/admin/vendors" /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><UserManagement /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><OrderManagement /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/performance" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><PerformanceAnalytics /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/risk" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><RiskPredictionPage backLink="/admin" /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Reports /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin"><Settings /></DashboardLayout></ProtectedRoute>} />

      {/* Manager */}
      <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><DashboardLayout role="manager"><ManagerDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/manager/vendors" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><DashboardLayout role="manager"><ManagerVendors /></DashboardLayout></ProtectedRoute>} />
      <Route path="/manager/vendors/:vendorId" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><DashboardLayout role="manager"><VendorDetails backLink="/manager/vendors" /></DashboardLayout></ProtectedRoute>} />
      <Route path="/manager/compare" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><DashboardLayout role="manager"><VendorComparison /></DashboardLayout></ProtectedRoute>} />
      <Route path="/manager/performance" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><DashboardLayout role="manager"><PerformanceAnalytics /></DashboardLayout></ProtectedRoute>} />
      <Route path="/manager/risk" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><DashboardLayout role="manager"><RiskPredictionPage backLink="/manager" /></DashboardLayout></ProtectedRoute>} />
      <Route path="/manager/recommendations" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><DashboardLayout role="manager"><Recommendations /></DashboardLayout></ProtectedRoute>} />
      <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><DashboardLayout role="manager"><Reports /></DashboardLayout></ProtectedRoute>} />

      {/* Vendor */}
      <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><DashboardLayout role="vendor"><VendorDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/vendor/profile" element={<ProtectedRoute allowedRoles={['vendor']}><DashboardLayout role="vendor"><VendorProfile /></DashboardLayout></ProtectedRoute>} />
      <Route path="/vendor/orders" element={<ProtectedRoute allowedRoles={['vendor']}><DashboardLayout role="vendor"><VendorOrders /></DashboardLayout></ProtectedRoute>} />
      <Route path="/vendor/performance" element={<ProtectedRoute allowedRoles={['vendor']}><DashboardLayout role="vendor"><VendorPerformance /></DashboardLayout></ProtectedRoute>} />
      <Route path="/vendor/complaints" element={<ProtectedRoute allowedRoles={['vendor']}><DashboardLayout role="vendor"><VendorComplaints /></DashboardLayout></ProtectedRoute>} />
      <Route path="/vendor/feedback" element={<ProtectedRoute allowedRoles={['vendor']}><DashboardLayout role="vendor"><VendorFeedback /></DashboardLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}
