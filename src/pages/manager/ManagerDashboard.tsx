import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVendors, useAllOrders, useAllRiskPredictions, useAllPerformance } from '@/hooks/useData';
import { ScoreCard, PageHeader, LoadingSpinner } from '@/components/UI';
import { RiskBadge } from '@/components/Badges';
import { Store, ShieldCheck, ShieldAlert, Lightbulb, Scale, FileText, TrendingUp } from 'lucide-react';

export function ManagerDashboard() {
  const { vendors, loading: vLoading } = useVendors();
  const { orders } = useAllOrders();
  const { predictions, loading: pLoading } = useAllRiskPredictions();
  const { records: perfRecords, loading: perfLoading } = useAllPerformance();

  const loading = vLoading || pLoading || perfLoading;

  const stats = useMemo(() => {
    const riskMap = new Map<string, string>();
    predictions.forEach((p) => { if (!riskMap.has(p.vendor_id)) riskMap.set(p.vendor_id, p.risk_level); });
    const low = Array.from(riskMap.values()).filter((r) => r === 'low').length;
    const medium = Array.from(riskMap.values()).filter((r) => r === 'medium').length;
    const high = Array.from(riskMap.values()).filter((r) => r === 'high').length;

    const perfMap = new Map<string, number>();
    perfRecords.forEach((p) => { perfMap.set(p.vendor_id, p.overall_score); });

    const topVendors = vendors
      .map((v) => ({ ...v, score: perfMap.get(v.vendor_id) || 0, risk: riskMap.get(v.vendor_id) as string | undefined }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const highRiskVendors = vendors
      .filter((v) => riskMap.get(v.vendor_id) === 'high')
      .map((v) => ({ ...v, score: perfMap.get(v.vendor_id) || 0 }));

    return { low, medium, high, topVendors, highRiskVendors };
  }, [vendors, predictions, perfRecords]);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      <PageHeader title="Procurement Manager Dashboard" subtitle="Make informed vendor decisions" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ScoreCard label="Total Vendors" value={vendors.length} icon={<Store className="h-5 w-5" />} color="blue" />
        <ScoreCard label="Recommended (Low Risk)" value={stats.low} icon={<ShieldCheck className="h-5 w-5" />} color="emerald" />
        <ScoreCard label="Medium Risk" value={stats.medium} icon={<ShieldAlert className="h-5 w-5" />} color="amber" />
        <ScoreCard label="High Risk" value={stats.high} icon={<ShieldAlert className="h-5 w-5" />} color="red" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/manager/compare" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
          <Scale className="h-5 w-5 text-blue-600" /><div><p className="text-sm font-semibold text-gray-900">Compare Vendors</p><p className="text-xs text-gray-500">Side-by-side analysis</p></div>
        </Link>
        <Link to="/manager/risk" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
          <ShieldAlert className="h-5 w-5 text-amber-600" /><div><p className="text-sm font-semibold text-gray-900">Predict Risk</p><p className="text-xs text-gray-500">AI-powered analysis</p></div>
        </Link>
        <Link to="/manager/recommendations" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
          <Lightbulb className="h-5 w-5 text-indigo-600" /><div><p className="text-sm font-semibold text-gray-900">Recommendations</p><p className="text-xs text-gray-500">AI suggestions</p></div>
        </Link>
        <Link to="/manager/reports" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
          <FileText className="h-5 w-5 text-emerald-600" /><div><p className="text-sm font-semibold text-gray-900">View Reports</p><p className="text-xs text-gray-500">Generate & export</p></div>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Top 5 Vendors</h3>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4 space-y-3">
            {stats.topVendors.map((v, i) => (
              <Link key={v.vendor_id} to={`/manager/vendors/${v.vendor_id}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.vendor_name}</p>
                    <p className="text-xs text-gray-500">{v.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{Math.round(v.score)}%</span>
                  {v.risk && <RiskBadge level={v.risk as 'low' | 'medium' | 'high'} />}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">High-Risk Vendors</h3>
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
          <div className="mt-4 space-y-3">
            {stats.highRiskVendors.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No high-risk vendors</p>
            ) : (
              stats.highRiskVendors.map((v) => (
                <Link key={v.vendor_id} to={`/manager/vendors/${v.vendor_id}`} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3 hover:bg-red-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.vendor_name}</p>
                    <p className="text-xs text-gray-500">{v.vendor_id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-red-600">{Math.round(v.score)}%</span>
                    <RiskBadge level="high" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
