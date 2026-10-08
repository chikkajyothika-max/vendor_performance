import { useVendors, useAllOrders, useAllRiskPredictions, useAllPerformance } from '@/hooks/useData';
import { ScoreCard, PageHeader, LoadingSpinner } from '@/components/UI';
import { RiskDonutChart, PerformanceBarChart, MonthlyLineChart } from '@/components/Charts';
import { Store, ShieldCheck, ShieldAlert, Package, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { vendors, loading: vLoading } = useVendors();
  const { orders, loading: oLoading } = useAllOrders();
  const { predictions, loading: pLoading } = useAllRiskPredictions();
  const { records: perfRecords, loading: perfLoading } = useAllPerformance();

  const loading = vLoading || oLoading || pLoading || perfLoading;

  const stats = useMemo(() => {
    const riskMap = new Map<string, string>();
    predictions.forEach((p) => {
      if (!riskMap.has(p.vendor_id)) riskMap.set(p.vendor_id, p.risk_level);
    });

    const low = Array.from(riskMap.values()).filter((r) => r === 'low').length;
    const medium = Array.from(riskMap.values()).filter((r) => r === 'medium').length;
    const high = Array.from(riskMap.values()).filter((r) => r === 'high').length;

    const topVendors = vendors.map((v) => {
      const perf = perfRecords.filter((p) => p.vendor_id === v.vendor_id);
      const latest = perf[perf.length - 1];
      return { name: v.vendor_name, score: latest?.overall_score || 0 };
    }).sort((a, b) => b.score - a.score).slice(0, 8);

    const monthlyMap = new Map<string, { total: number; count: number }>();
    perfRecords.forEach((p) => {
      const existing = monthlyMap.get(p.month) || { total: 0, count: 0 };
      existing.total += p.overall_score;
      existing.count += 1;
      monthlyMap.set(p.month, existing);
    });
    const monthlyData = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, { total, count }]) => ({ month, score: Math.round(total / count) }));

    return { low, medium, high, topVendors, monthlyData };
  }, [vendors, predictions, perfRecords]);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="System overview and vendor analytics" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <ScoreCard label="Total Vendors" value={vendors.length} icon={<Store className="h-5 w-5" />} color="blue" />
        <ScoreCard label="Low Risk" value={stats.low} icon={<ShieldCheck className="h-5 w-5" />} color="emerald" />
        <ScoreCard label="Medium Risk" value={stats.medium} icon={<ShieldAlert className="h-5 w-5" />} color="amber" />
        <ScoreCard label="High Risk" value={stats.high} icon={<ShieldAlert className="h-5 w-5" />} color="red" />
        <ScoreCard label="Total Orders" value={orders.length} icon={<Package className="h-5 w-5" />} color="indigo" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Vendor Risk Distribution</h3>
          <div className="mt-4">
            <RiskDonutChart low={stats.low} medium={stats.medium} high={stats.high} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Vendor Performance (Top 8)</h3>
          <div className="mt-4">
            <PerformanceBarChart data={stats.topVendors} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Monthly Vendor Performance Trend</h3>
        <div className="mt-4">
          <MonthlyLineChart data={stats.monthlyData} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/vendors" className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
          <Store className="h-5 w-5 text-blue-600" />
          <p className="mt-2 text-sm font-semibold text-gray-900">Manage Vendors</p>
          <p className="text-xs text-gray-500">Add, edit, or remove vendors</p>
        </Link>
        <Link to="/admin/orders" className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
          <Package className="h-5 w-5 text-indigo-600" />
          <p className="mt-2 text-sm font-semibold text-gray-900">View Orders</p>
          <p className="text-xs text-gray-500">Track all vendor orders</p>
        </Link>
        <Link to="/admin/risk" className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <p className="mt-2 text-sm font-semibold text-gray-900">Risk Predictions</p>
          <p className="text-xs text-gray-500">AI-powered risk analysis</p>
        </Link>
        <Link to="/admin/reports" className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <p className="mt-2 text-sm font-semibold text-gray-900">Reports</p>
          <p className="text-xs text-gray-500">Generate and export reports</p>
        </Link>
      </div>
    </div>
  );
}
