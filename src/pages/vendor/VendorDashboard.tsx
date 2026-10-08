import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useVendor, useVendorOrders, useVendorPerformance, useVendorRiskPredictions, useVendorComplaints, useVendorQuality } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, ScoreCard, CircularProgress } from '@/components/UI';
import { RiskBadge, StatusBadge } from '@/components/Badges';
import { MonthlyLineChart } from '@/components/Charts';
import { Package, AlertCircle, Star, TrendingUp, Lightbulb } from 'lucide-react';

export function VendorDashboard() {
  const { profile } = useAuth();
  const vendorId = profile?.vendor_id || 'V001';
  const { vendor, loading: vLoading } = useVendor(vendorId);
  const { orders } = useVendorOrders(vendorId);
  const { records: perfRecords } = useVendorPerformance(vendorId);
  const { predictions } = useVendorRiskPredictions(vendorId);
  const { complaints } = useVendorComplaints(vendorId);
  const { records: qualityRecords } = useVendorQuality(vendorId);

  const latestPerf = perfRecords[perfRecords.length - 1];
  const latestRisk = predictions[0];

  const monthlyData = useMemo(() => perfRecords.map((p) => ({ month: p.month, score: p.overall_score })), [perfRecords]);

  const improvementSuggestions = useMemo(() => {
    const suggestions: string[] = [];
    if (latestPerf) {
      if (latestPerf.delivery_score < 85) suggestions.push(`Improve delivery performance (currently ${latestPerf.delivery_score}%) to boost your overall score.`);
      if (latestPerf.quality_score < 85) suggestions.push(`Focus on product quality (currently ${latestPerf.quality_score}%) to reduce defect rates.`);
      if (latestPerf.reliability_score < 80) suggestions.push(`Enhance reliability by maintaining consistent order fulfillment.`);
      if (complaints.filter((c) => c.status === 'open').length > 0) suggestions.push(`Resolve ${complaints.filter((c) => c.status === 'open').length} open complaint(s) to improve your standing.`);
      if (orders.filter((o) => o.order_status === 'delayed').length > 0) suggestions.push(`Reduce delayed orders by improving delivery time estimation.`);
    }
    if (suggestions.length === 0) suggestions.push('Great work! Your performance is excellent. Keep maintaining your current standards.');
    return suggestions;
  }, [latestPerf, complaints, orders]);

  if (vLoading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      <PageHeader title={`Welcome, ${vendor?.vendor_name || profile?.name}`} subtitle="Your performance dashboard" />

      {latestPerf && latestRisk && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            <div className="flex items-center gap-6">
              <CircularProgress value={latestPerf.overall_score} size={120} label="Performance" />
              <div>
                <p className="text-sm text-gray-500">Performance Score</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(latestPerf.overall_score)}%</p>
                <p className="mt-1 text-sm text-gray-500">Risk Level</p>
                <div className="mt-1"><RiskBadge level={latestRisk.risk_level as 'low' | 'medium' | 'high'} score={latestRisk.risk_score} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ScoreCard label="Delivery" value={`${latestPerf.delivery_score}%`} icon={<TrendingUp className="h-5 w-5" />} color="blue" />
              <ScoreCard label="Quality" value={`${latestPerf.quality_score}%`} icon={<Star className="h-5 w-5" />} color="emerald" />
              <ScoreCard label="Orders" value={orders.length} icon={<Package className="h-5 w-5" />} color="indigo" />
              <ScoreCard label="Complaints" value={complaints.length} icon={<AlertCircle className="h-5 w-5" />} color="amber" />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Performance Trend</h3>
          <div className="mt-4">{monthlyData.length > 0 ? <MonthlyLineChart data={monthlyData} /> : <p className="py-12 text-center text-sm text-gray-400">No trend data</p>}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <div className="mt-4 space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o.order_id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div><p className="text-sm font-medium text-gray-900">{o.product || o.order_id}</p><p className="text-xs text-gray-500">{o.order_date}</p></div>
                <StatusBadge status={o.order_status} />
              </div>
            ))}
            {orders.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No orders yet</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Your Performance Details</h3>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery Score</span><span className="font-semibold text-gray-900">{latestPerf?.delivery_score || '-'}%</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Quality Score</span><span className="font-semibold text-gray-900">{latestPerf?.quality_score || '-'}%</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Cost Score</span><span className="font-semibold text-gray-900">{latestPerf?.cost_score || '-'}%</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Reliability Score</span><span className="font-semibold text-gray-900">{latestPerf?.reliability_score || '-'}%</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Avg Quality Rating</span><span className="font-semibold text-gray-900">{qualityRecords.length > 0 ? `${(qualityRecords.reduce((s, q) => s + q.quality_rating, 0) / qualityRecords.length).toFixed(1)}/5` : '-'}</span></div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Improvement Suggestions</h3>
          </div>
          <div className="mt-4 space-y-3">
            {improvementSuggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-white p-3 text-sm text-gray-700">
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" /> {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
