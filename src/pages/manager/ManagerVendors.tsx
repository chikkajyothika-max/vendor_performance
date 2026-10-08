import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVendors, useAllRiskPredictions, useAllPerformance } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, EmptyState, Select } from '@/components/UI';
import { RiskBadge, StatusBadge } from '@/components/Badges';
import { Search, Store, Eye } from 'lucide-react';

export function ManagerVendors() {
  const { vendors, loading } = useVendors();
  const { predictions } = useAllRiskPredictions();
  const { records: perfRecords } = useAllPerformance();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const categories = useMemo(() => Array.from(new Set(vendors.map((v) => v.category).filter(Boolean))) as string[], [vendors]);

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
      if (search && !v.vendor_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && v.category !== categoryFilter) return false;
      if (riskFilter && riskMap.get(v.vendor_id) !== riskFilter) return false;
      return true;
    });
  }, [vendors, search, categoryFilter, riskFilter, riskMap]);

  if (loading) return <LoadingSpinner message="Loading vendors..." />;

  return (
    <div>
      <PageHeader title="Vendors" subtitle="Browse and evaluate all vendors" />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
        </div>
        <div className="w-40"><Select value={categoryFilter} onChange={setCategoryFilter} placeholder="All Categories" options={categories.map((c) => ({ value: c, label: c }))} /></div>
        <div className="w-36"><Select value={riskFilter} onChange={setRiskFilter} placeholder="All Risk" options={[{ value: 'low', label: 'Low Risk' }, { value: 'medium', label: 'Medium Risk' }, { value: 'high', label: 'High Risk' }]} /></div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Store className="h-8 w-8" />} title="No vendors found" message="Try adjusting your filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => {
            const risk = riskMap.get(v.vendor_id) as 'low' | 'medium' | 'high' | undefined;
            const perf = perfMap.get(v.vendor_id);
            return (
              <Link key={v.vendor_id} to={`/manager/vendors/${v.vendor_id}`} className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-lg hover:border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{v.vendor_name}</h3>
                    <p className="text-xs text-gray-500">{v.vendor_id} • {v.category}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Performance</p>
                    <p className={`text-lg font-bold ${perf && perf >= 80 ? 'text-emerald-600' : perf && perf >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{perf ? `${Math.round(perf)}%` : '-'}</p>
                  </div>
                  {risk && <RiskBadge level={risk} />}
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm text-blue-600 opacity-0 transition group-hover:opacity-100">
                  <Eye className="h-4 w-4" /> View Details
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
