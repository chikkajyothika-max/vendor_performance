import { useProfiles } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/UI';
import { StatusBadge } from '@/components/Badges';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/Toast';
import { Users, Shield, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';

export function UserManagement() {
  const { profiles, loading, refetch } = useProfiles();

  const roleIcon: Record<string, React.ReactNode> = {
    admin: <Shield className="h-4 w-4 text-red-600" />,
    manager: <ShieldCheck className="h-4 w-4 text-blue-600" />,
    vendor: <User className="h-4 w-4 text-emerald-600" />,
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id);
    if (error) {
      showToast('error', 'Failed to update user status');
    } else {
      showToast('success', `User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      refetch();
    }
  };

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage system users and their roles" />

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-red-600" /><p className="text-sm font-medium text-gray-500">Admins</p></div>
          <p className="mt-1 text-2xl font-bold text-gray-900">{profiles.filter((p) => p.role === 'admin').length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" /><p className="text-sm font-medium text-gray-500">Managers</p></div>
          <p className="mt-1 text-2xl font-bold text-gray-900">{profiles.filter((p) => p.role === 'manager').length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2"><User className="h-5 w-5 text-emerald-600" /><p className="text-sm font-medium text-gray-500">Vendors</p></div>
          <p className="mt-1 text-2xl font-bold text-gray-900">{profiles.filter((p) => p.role === 'vendor').length}</p>
        </div>
      </div>

      {profiles.length === 0 ? (
        <EmptyState icon={<Users className="h-8 w-8" />} title="No users found" message="Users will appear here after they register." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Joined</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">{p.name.charAt(0).toUpperCase()}</div>
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 capitalize">
                      {roleIcon[p.role]} <span className="text-gray-700">{p.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleStatus(p.id, p.status)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${p.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {p.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
