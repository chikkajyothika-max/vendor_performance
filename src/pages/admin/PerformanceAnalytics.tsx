import { useMemo } from 'react';
import { useVendors, useAllPerformance } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, Select, ProgressBar } from '@/components/UI';
import { MultiLineChart, PerformanceBarChart } from '@/components/Charts';
import { useState } from 'react';

export function PerformanceAnalytics() {
  const { vendors } = useVendors();
  const { records, loading } = useAllPerformance();
  const [selectedVendor, setSelectedVendor] = useState('');

  const vendorPerf = useMemo(() => {
    if (selectedVendor) return records.filter((r) => r.vendor_id === selectedVendor);
    return records;
  }, [records, selectedVendor]);

  const vendorMap = useMemo(() => {
    const m = new Map<string, string>();
    vendors.forEach((v) => m.set(v.vendor_id, v.vendor_name));
    return m;
  }, [vendors]);

  const avgScores = useMemo(() => {
    if (vendorPerf.length === 0) return { delivery: 0, quality: 0, cost: 0, reliability: 0, overall: 0 };
    const sum = vendorPerf.reduce((acc, r) => ({
      delivery: acc.delivery + r.delivery_score,
      quality: acc.quality + r.quality_score,
      cost: acc.cost + r.cost_score,
      reliability: acc.reliability + r.reliability_score,
      overall: acc.overall + r.overall_score,
    }), { delivery: 0, quality: 0, cost: 0, reliability: 0, overall: 0 });
    const n = vendorPerf.length;
    return {
      delivery: Math.round(sum.delivery / n),
      quality: Math.round(sum.quality / n),
      cost: Math.round(sum.cost / n),
      reliability: Math.round(sum.reliability / n),
      overall: Math.round(sum.overall / n),
    };
  }, [vendorPerf]);

  const trendData = useMemo(() => {
    const monthMap = new Map<string, { delivery: number[]; quality: number[]; reliability: number[]; count: number }>();
    vendorPerf.forEach((r) => {
      const existing = monthMap.get(r.month) || { delivery: [], quality: [], reliability: [], count: 0 };
      existing.delivery.push(r.delivery_score);
      existing.quality.push(r.quality_score);
      existing.reliability.push(r.reliability_score);
      existing.count++;
      monthMap.set(r.month, existing);
    });
    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, v]) => ({
        month,
        Delivery: Math.round(v.delivery.reduce((a, b) => a + b, 0) / v.delivery.length),
        Quality: Math.round(v.quality.reduce((a, b) => a + b, 0) / v.quality.length),
        Reliability: Math.round(v.reliability.reduce((a, b) => a + b, 0) / v.reliability.length),
      }));
  }, [vendorPerf]);

  const topVendors = useMemo(() => {
    const latestPerVendor = new Map<string, { name: string; score: number }>();
    records.forEach((r) => {
      const existing = latestPerVendor.get(r.vendor_id);
      if (!existing || r.evaluation_date > (records.find((x) => x.vendor_id === r.vendor_id && x === existing)?.evaluation_date || '')) {
        latestPerVendor.set(r.vendor_id, { name: vendorMap.get(r.vendor_id) || r.vendor_id, score: r.overall_score });
      }
    });
    return Array.from(latestPerVendor.values()).sort((a, b) => b.score - a.score).slice(0, 10);
  }, [records, vendorMap]);

  if (loading) return <LoadingSpinner message="Loading performance data..." />;

  return (
    <div>
      <PageHeader title="Performance Analytics" subtitle="Analyze vendor performance across all metrics" />

      <div className="mb-6 max-w-xs">
        <Select label="Filter by Vendor" value={selectedVendor} onChange={setSelectedVendor} placeholder="All Vendors" options={vendors.map((v) => ({ value: v.vendor_id, label: v.vendor_name }))} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: 'Avg Delivery', value: avgScores.delivery, color: 'bg-blue-500' },
          { label: 'Avg Quality', value: avgScores.quality, color: 'bg-emerald-500' },
          { label: 'Avg Cost', value: avgScores.cost, color: 'bg-amber-500' },
          { label: 'Avg Reliability', value: avgScores.reliability, color: 'bg-indigo-500' },
          { label: 'Overall Score', value: avgScores.overall, color: 'bg-blue-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}%</p>
            <div className="mt-2"><ProgressBar value={s.value} color={s.color} /></div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Performance Trends</h3>
          <div className="mt-4">
            {trendData.length > 0 ? (
              <MultiLineChart data={trendData} lines={[
                { key: 'Delivery', color: '#3b82f6', label: 'Delivery' },
                { key: 'Quality', color: '#10b981', label: 'Quality' },
                { key: 'Reliability', color: '#6366f1', label: 'Reliability' },
              ]} />
            ) : <p className="py-12 text-center text-sm text-gray-400">No data available</p>}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Top 10 Vendors by Performance</h3>
          <div className="mt-4">
            {topVendors.length > 0 ? <PerformanceBarChart data={topVendors} /> : <p className="py-12 text-center text-sm text-gray-400">No data available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
