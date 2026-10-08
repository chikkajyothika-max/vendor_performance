import { useState, useMemo } from 'react';
import { useVendors, useAllRiskPredictions, useAllPerformance } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, EmptyState, Input, Select } from '@/components/UI';
import { RiskBadge, StatusBadge } from '@/components/Badges';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { showToast } from '@/components/Toast';
import { addVendor, updateVendor, deleteVendor } from '@/lib/api';
import { Search, Plus, Store, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Vendor } from '@/types';

export function VendorManagement() {
  const { vendors, loading, refetch } = useVendors();
  const { predictions } = useAllRiskPredictions();
  const { records: perfRecords } = useAllPerformance();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(vendors.map((v) => v.category).filter(Boolean))) as string[];
  }, [vendors]);

  const riskMap = useMemo(() => {
    const m = new Map<string, string>();
    predictions.forEach((p) => { if (!m.has(p.vendor_id)) m.set(p.vendor_id, p.risk_level); });
    return m;
  }, [predictions]);

  const perfMap = useMemo(() => {
    const m = new Map<string, number>();
    perfRecords.forEach((p) => { m.set(p.vendor_id, p.overall_score); });
    return m;
  }, [perfRecords]);

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (search && !v.vendor_name.toLowerCase().includes(search.toLowerCase()) && !v.vendor_id.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && v.category !== categoryFilter) return false;
      if (riskFilter && riskMap.get(v.vendor_id) !== riskFilter) return false;
      return true;
    });
  }, [vendors, search, categoryFilter, riskFilter, riskMap]);

  if (loading) return <LoadingSpinner message="Loading vendors..." />;

  return (
    <div>
      <PageHeader
        title="Vendor Management"
        subtitle="Manage all vendors in the system"
        action={
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" /> Add Vendor
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <div className="w-40">
          <Select value={categoryFilter} onChange={setCategoryFilter} placeholder="All Categories" options={categories.map((c) => ({ value: c, label: c }))} />
        </div>
        <div className="w-36">
          <Select value={riskFilter} onChange={setRiskFilter} placeholder="All Risk Levels" options={[
            { value: 'low', label: 'Low Risk' },
            { value: 'medium', label: 'Medium Risk' },
            { value: 'high', label: 'High Risk' },
          ]} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Store className="h-8 w-8" />} title="No vendors found" message="Try adjusting your filters or add a new vendor." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-700">Vendor ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Vendor Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Performance</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Risk</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const risk = riskMap.get(v.vendor_id) as 'low' | 'medium' | 'high' | undefined;
                const perf = perfMap.get(v.vendor_id);
                return (
                  <tr key={v.vendor_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.vendor_id}</td>
                    <td className="px-4 py-3 text-gray-700">{v.vendor_name}</td>
                    <td className="px-4 py-3 text-gray-600">{v.category || '-'}</td>
                    <td className="px-4 py-3">
                      {perf !== undefined ? (
                        <span className={`font-semibold ${perf >= 80 ? 'text-emerald-600' : perf >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{Math.round(perf)}%</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">{risk ? <RiskBadge level={risk} /> : <span className="text-gray-400">-</span>}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/vendors/${v.vendor_id}`} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="View">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button onClick={() => setEditingVendor(v)} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(v)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(showAddModal || editingVendor) && (
        <VendorFormModal
          vendor={editingVendor}
          onClose={() => { setShowAddModal(false); setEditingVendor(null); }}
          onSaved={() => { refetch(); setShowAddModal(false); setEditingVendor(null); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Vendor"
        message={`Are you sure you want to delete ${deleteTarget?.vendor_name}? This will also delete all related orders, complaints, and performance records.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const { error } = await deleteVendor(deleteTarget.vendor_id);
          if (error) {
            showToast('error', 'Failed to delete vendor');
          } else {
            showToast('success', 'Vendor deleted successfully');
            refetch();
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function VendorFormModal({ vendor, onClose, onSaved }: { vendor: Vendor | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    vendor_name: vendor?.vendor_name || '',
    company_name: vendor?.company_name || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
    category: vendor?.category || '',
    products_services: vendor?.products_services || '',
    contract_value: vendor?.contract_value?.toString() || '',
    payment_terms: vendor?.payment_terms || '',
    contract_start_date: vendor?.contract_start_date || '',
    contract_end_date: vendor?.contract_end_date || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.vendor_name || !form.email) {
      showToast('error', 'Vendor name and email are required');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      contract_value: form.contract_value ? parseFloat(form.contract_value) : 0,
    };
    if (vendor) {
      const { error } = await updateVendor(vendor.vendor_id, payload);
      if (error) showToast('error', 'Failed to update vendor');
      else showToast('success', 'Vendor updated successfully');
    } else {
      const { error } = await addVendor(payload);
      if (error) showToast('error', 'Failed to add vendor');
      else showToast('success', 'Vendor added successfully');
    }
    setSaving(false);
    if (!vendor || !(await updateVendor(vendor.vendor_id, payload)).error) {
      onSaved();
    }
  };

  return (
    <Modal open={true} onClose={onClose} title={vendor ? 'Edit Vendor' : 'Add Vendor'} size="lg">
      <div className="space-y-5">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Vendor Information</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Vendor Name" value={form.vendor_name} onChange={(v) => setForm({ ...form, vendor_name: v })} required />
            <Input label="Company Name" value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} />
            <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" required />
            <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Select category" options={[
              'Electronics', 'Stationery', 'Equipment', 'Raw Materials', 'Manufacturing', 'Logistics', 'Chemicals', 'Packaging'
            ].map((c) => ({ value: c, label: c }))} />
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Business Information</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Products / Services" value={form.products_services} onChange={(v) => setForm({ ...form, products_services: v })} />
            <Input label="Contract Value" value={form.contract_value} onChange={(v) => setForm({ ...form, contract_value: v })} type="number" />
            <Input label="Payment Terms" value={form.payment_terms} onChange={(v) => setForm({ ...form, payment_terms: v })} placeholder="Net 30" />
            <div />
            <Input label="Contract Start Date" value={form.contract_start_date} onChange={(v) => setForm({ ...form, contract_start_date: v })} type="date" />
            <Input label="Contract End Date" value={form.contract_end_date} onChange={(v) => setForm({ ...form, contract_end_date: v })} type="date" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Vendor'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
