import { useState, useMemo } from 'react';
import { useAllOrders, useVendors } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, EmptyState, Select } from '@/components/UI';
import { StatusBadge } from '@/components/Badges';
import { Package, Search } from 'lucide-react';

export function OrderManagement() {
  const { orders, loading } = useAllOrders();
  const { vendors } = useVendors();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const vendorMap = useMemo(() => {
    const m = new Map<string, string>();
    vendors.forEach((v) => m.set(v.vendor_id, v.vendor_name));
    return m;
  }, [vendors]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search && !o.order_id.toLowerCase().includes(search.toLowerCase()) && !(o.product || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && o.order_status !== statusFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter]);

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div>
      <PageHeader title="Order Management" subtitle="View and track all vendor orders" />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or product..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <div className="w-40">
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All Status" options={[
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'delayed', label: 'Delayed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title="No orders found" message="Try adjusting your filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-700">Order ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Vendor</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Product</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Qty</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Order Date</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Expected</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Actual</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.order_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{o.order_id}</td>
                  <td className="px-4 py-3 text-gray-700">{vendorMap.get(o.vendor_id) || o.vendor_id}</td>
                  <td className="px-4 py-3 text-gray-600">{o.product || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{o.quantity}</td>
                  <td className="px-4 py-3 text-gray-500">{o.order_date}</td>
                  <td className="px-4 py-3 text-gray-500">{o.expected_delivery || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{o.actual_delivery || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">${o.order_amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.order_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
