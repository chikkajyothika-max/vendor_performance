import { useState, useMemo } from 'react';
import { useVendors, useAllPerformance, useAllRiskPredictions, useAllOrders } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, Select } from '@/components/UI';
import { RiskBadge } from '@/components/Badges';
import { ComparisonBarChart } from '@/components/Charts';
import { Scale, Trophy, Award } from 'lucide-react';

export function VendorComparison() {
  const { vendors, loading } = useVendors();
  const { records: perfRecords } = useAllPerformance();
  const { predictions } = useAllRiskPredictions();
  const { orders } = useAllOrders();

  const [selected, setSelected] = useState<string[]>([]);

  const perfMap = useMemo(() => {
    const m = new Map<string, typeof perfRecords[0]>();
    perfRecords.forEach((p) => { if (!m.has(p.vendor_id) || p.evaluation_date > (m.get(p.vendor_id)?.evaluation_date || '')) m.set(p.vendor_id, p); });
    return m;
  }, [perfRecords]);

  const riskMap = useMemo(() => {
    const m = new Map<string, typeof predictions[0]>();
    predictions.forEach((p) => { if (!m.has(p.vendor_id)) m.set(p.vendor_id, p); });
    return m;
  }, [predictions]);

  const orderCountMap = useMemo(() => {
    const m = new Map<string, number>();
    orders.forEach((o) => m.set(o.vendor_id, (m.get(o.vendor_id) || 0) + 1));
    return m;
  }, [orders]);

  const comparedVendors = useMemo(() => {
    return selected.map((id) => vendors.find((v) => v.vendor_id === id)).filter(Boolean);
  }, [selected, vendors]);

  const chartData = useMemo(() => {
    if (comparedVendors.length === 0) return [];
    const metrics = ['Delivery', 'Quality', 'Cost', 'Reliability'];
    return metrics.map((metric) => {
      const row: Record<string, number | string> = { metric };
      comparedVendors.forEach((v) => {
        const perf = perfMap.get(v!.vendor_id);
        const key = metric.toLowerCase();
        row[v!.vendor_name] = perf ? (perf as Record<string, number>)[`${key}_score`] : 0;
      });
      return row;
    });
  }, [comparedVendors, perfMap]);

  const bestVendor = useMemo(() => {
    if (comparedVendors.length === 0) return null;
    let best = comparedVendors[0];
    let bestScore = perfMap.get(best!.vendor_id)?.overall_score || 0;
    comparedVendors.forEach((v) => {
      const score = perfMap.get(v!.vendor_id)?.overall_score || 0;
      if (score > bestScore) { best = v; bestScore = score; }
    });
    return best;
  }, [comparedVendors, perfMap]);

  const toggleVendor = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 4) {
      setSelected([...selected, id]);
    }
  };

  if (loading) return <LoadingSpinner message="Loading vendors..." />;

  return (
    <div>
      <PageHeader title="Vendor Comparison" subtitle="Compare up to 4 vendors side-by-side" />

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Select Vendors to Compare (2-4)</h3>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <button
              key={v.vendor_id}
              onClick={() => toggleVendor(v.vendor_id)}
              className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition ${
                selected.includes(v.vendor_id)
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <span>{v.vendor_name}</span>
              <span className="text-xs text-gray-400">{v.vendor_id}</span>
            </button>
          ))}
        </div>
        {selected.length < 2 && (
          <p className="mt-3 text-sm text-amber-600">Select at least 2 vendors to compare</p>
        )}
      </div>

      {comparedVendors.length >= 2 && (
        <div className="mt-6 space-y-6">
          {bestVendor && (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-500">Recommended Vendor</p>
                  <p className="text-lg font-bold text-gray-900">{bestVendor.vendor_name}</p>
                  <p className="mt-1 text-sm text-gray-600">Highest performance score with the lowest predicted risk.</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Comparison Chart</h3>
            <div className="mt-4">
              <ComparisonBarChart data={chartData} vendors={comparedVendors.map((v) => v!.vendor_name)} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700">Parameter</th>
                  {comparedVendors.map((v) => (
                    <th key={v!.vendor_id} className="px-4 py-3 font-semibold text-gray-700">
                      {v!.vendor_name}
                      {v === bestVendor && <Award className="ml-1 inline h-4 w-4 text-amber-500" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Delivery', 'Quality', 'Cost', 'Reliability'].map((metric) => {
                  const key = metric.toLowerCase() as 'delivery' | 'quality' | 'cost' | 'reliability';
                  return (
                    <tr key={metric} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{metric}</td>
                      {comparedVendors.map((v) => {
                        const perf = perfMap.get(v!.vendor_id);
                        const val = perf ? perf[`${key}_score`] : 0;
                        const isBest = comparedVendors.every((vv) => (perfMap.get(vv!.vendor_id)?.[`${key}_score`] || 0) <= val);
                        return <td key={v!.vendor_id} className={`px-4 py-3 ${isBest ? 'font-bold text-emerald-600' : 'text-gray-700'}`}>{val}%</td>;
                      })}
                    </tr>
                  );
                })}
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">Complaints</td>
                  {comparedVendors.map((v) => <td key={v!.vendor_id} className="px-4 py-3 text-gray-700">{predictions.filter((p) => p.vendor_id === v!.vendor_id).length}</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">Total Orders</td>
                  {comparedVendors.map((v) => <td key={v!.vendor_id} className="px-4 py-3 text-gray-700">{orderCountMap.get(v!.vendor_id) || 0}</td>)}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">Performance</td>
                  {comparedVendors.map((v) => {
                    const score = perfMap.get(v!.vendor_id)?.overall_score || 0;
                    const isBest = comparedVendors.every((vv) => (perfMap.get(vv!.vendor_id)?.overall_score || 0) <= score);
                    return <td key={v!.vendor_id} className={`px-4 py-3 font-semibold ${isBest ? 'text-emerald-600' : 'text-gray-700'}`}>{score}%</td>;
                  })}
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Risk</td>
                  {comparedVendors.map((v) => {
                    const r = riskMap.get(v!.vendor_id);
                    return <td key={v!.vendor_id} className="px-4 py-3">{r ? <RiskBadge level={r.risk_level as 'low' | 'medium' | 'high'} /> : '-'}</td>;
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
