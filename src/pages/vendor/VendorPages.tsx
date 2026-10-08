import { useAuth } from '@/context/AuthContext';
import { useVendor, useVendorOrders, useVendorPerformance, useVendorComplaints, useVendorQuality, useVendorRiskPredictions } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, ScoreCard, CircularProgress, ProgressBar } from '@/components/UI';
import { RiskBadge, StatusBadge } from '@/components/Badges';
import { MonthlyLineChart, RadarChartComponent, MultiLineChart } from '@/components/Charts';
import { Mail, Phone, MapPin, Calendar, Package, AlertCircle, Star, TrendingUp, MessageSquare } from 'lucide-react';
import { useMemo } from 'react';

export function VendorProfile() {
  const { profile } = useAuth();
  const vendorId = profile?.vendor_id || 'V001';
  const { vendor, loading } = useVendor(vendorId);

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  if (!vendor) return <div><PageHeader title="Profile" /><p className="text-gray-500">No vendor profile linked to your account.</p></div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your vendor information" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{vendor.vendor_name}</h2>
            <p className="mt-1 text-sm text-gray-500">Vendor ID: {vendor.vendor_id}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{vendor.category}</span>
              <StatusBadge status={vendor.status} />
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-gray-400" /><div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900">{vendor.email}</p></div></div>
          <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-gray-400" /><div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium text-gray-900">{vendor.phone || '-'}</p></div></div>
          <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gray-400" /><div><p className="text-xs text-gray-500">Address</p><p className="text-sm font-medium text-gray-900">{vendor.address || '-'}</p></div></div>
          <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-gray-400" /><div><p className="text-xs text-gray-500">Registered</p><p className="text-sm font-medium text-gray-900">{vendor.registration_date || '-'}</p></div></div>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-700">Business Information</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs text-gray-500">Products / Services</p><p className="text-sm font-medium text-gray-900">{vendor.products_services || '-'}</p></div>
            <div><p className="text-xs text-gray-500">Contract Value</p><p className="text-sm font-medium text-gray-900">${vendor.contract_value?.toLocaleString() || '-'}</p></div>
            <div><p className="text-xs text-gray-500">Payment Terms</p><p className="text-sm font-medium text-gray-900">{vendor.payment_terms || '-'}</p></div>
            <div><p className="text-xs text-gray-500">Contract Period</p><p className="text-sm font-medium text-gray-900">{vendor.contract_start_date || '-'} to {vendor.contract_end_date || '-'}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VendorOrders() {
  const { profile } = useAuth();
  const vendorId = profile?.vendor_id || 'V001';
  const { orders, loading } = useVendorOrders(vendorId);

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div>
      <PageHeader title="My Orders" subtitle="View your order history" />
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-4 py-3 font-semibold text-gray-700">Order ID</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Product</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Qty</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Order Date</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Expected</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Actual</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Amount</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
          </tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{o.order_id}</td>
                <td className="px-4 py-3 text-gray-600">{o.product || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{o.quantity}</td>
                <td className="px-4 py-3 text-gray-500">{o.order_date}</td>
                <td className="px-4 py-3 text-gray-500">{o.expected_delivery || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{o.actual_delivery || '-'}</td>
                <td className="px-4 py-3 text-gray-700">${o.order_amount.toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={o.order_status} /></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-gray-400">No orders found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VendorPerformance() {
  const { profile } = useAuth();
  const vendorId = profile?.vendor_id || 'V001';
  const { records, loading } = useVendorPerformance(vendorId);
  const { records: qualityRecords } = useVendorQuality(vendorId);
  const latest = records[records.length - 1];

  const radarData = useMemo(() => latest ? [
    { metric: 'Delivery', value: latest.delivery_score },
    { metric: 'Quality', value: latest.quality_score },
    { metric: 'Cost', value: latest.cost_score },
    { metric: 'Reliability', value: latest.reliability_score },
  ] : [], [latest]);

  const trendData = useMemo(() => records.map((r) => ({
    month: r.month,
    Delivery: r.delivery_score,
    Quality: r.quality_score,
    Reliability: r.reliability_score,
  })), [records]);

  if (loading) return <LoadingSpinner message="Loading performance..." />;

  return (
    <div>
      <PageHeader title="My Performance" subtitle="Detailed performance analysis" />
      {latest && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ScoreCard label="Delivery Score" value={`${latest.delivery_score}%`} icon={<TrendingUp className="h-5 w-5" />} color="blue" />
          <ScoreCard label="Quality Score" value={`${latest.quality_score}%`} icon={<Star className="h-5 w-5" />} color="emerald" />
          <ScoreCard label="Cost Score" value={`${latest.cost_score}%`} icon={<TrendingUp className="h-5 w-5" />} color="amber" />
          <ScoreCard label="Reliability" value={`${latest.reliability_score}%`} icon={<TrendingUp className="h-5 w-5" />} color="indigo" />
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Performance Radar</h3>
          <div className="mt-4">{radarData.length > 0 ? <RadarChartComponent data={radarData} /> : <p className="py-12 text-center text-sm text-gray-400">No data</p>}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Performance Trends</h3>
          <div className="mt-4">{trendData.length > 0 ? <MultiLineChart data={trendData} lines={[{ key: 'Delivery', color: '#3b82f6', label: 'Delivery' }, { key: 'Quality', color: '#10b981', label: 'Quality' }, { key: 'Reliability', color: '#6366f1', label: 'Reliability' }]} /> : <p className="py-12 text-center text-sm text-gray-400">No data</p>}</div>
        </div>
      </div>
      {latest && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Overall Performance Score</h3>
          <div className="mt-4 flex items-center gap-6">
            <CircularProgress value={latest.overall_score} size={100} label="Overall" />
            <div className="flex-1 space-y-2">
              <div><div className="flex justify-between text-sm"><span className="text-gray-500">On-Time Delivery (30%)</span><span className="font-semibold">{latest.delivery_score}%</span></div><div className="mt-1"><ProgressBar value={latest.delivery_score} /></div></div>
              <div><div className="flex justify-between text-sm"><span className="text-gray-500">Quality (25%)</span><span className="font-semibold">{latest.quality_score}%</span></div><div className="mt-1"><ProgressBar value={latest.quality_score} /></div></div>
              <div><div className="flex justify-between text-sm"><span className="text-gray-500">Reliability (15%)</span><span className="font-semibold">{latest.reliability_score}%</span></div><div className="mt-1"><ProgressBar value={latest.reliability_score} /></div></div>
              <div><div className="flex justify-between text-sm"><span className="text-gray-500">Cost Efficiency (10%)</span><span className="font-semibold">{latest.cost_score}%</span></div><div className="mt-1"><ProgressBar value={latest.cost_score} /></div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function VendorComplaints() {
  const { profile } = useAuth();
  const vendorId = profile?.vendor_id || 'V001';
  const { complaints, loading } = useVendorComplaints(vendorId);

  if (loading) return <LoadingSpinner message="Loading complaints..." />;

  return (
    <div>
      <PageHeader title="Complaints" subtitle="View complaints filed against you" />
      <div className="mb-4 grid grid-cols-3 gap-4">
        <ScoreCard label="Total Complaints" value={complaints.length} icon={<MessageSquare className="h-5 w-5" />} color="amber" />
        <ScoreCard label="Open" value={complaints.filter((c) => c.status === 'open').length} icon={<AlertCircle className="h-5 w-5" />} color="red" />
        <ScoreCard label="Resolved" value={complaints.filter((c) => c.status === 'resolved').length} icon={<MessageSquare className="h-5 w-5" />} color="emerald" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-4 py-3 font-semibold text-gray-700">ID</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Type</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Resolution Date</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
          </tr></thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.complaint_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.complaint_id}</td>
                <td className="px-4 py-3 text-gray-600">{c.complaint_type || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{c.complaint_date}</td>
                <td className="px-4 py-3 text-gray-500">{c.resolution_date || '-'}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
            {complaints.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-400">No complaints</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VendorFeedback() {
  const { profile } = useAuth();
  const vendorId = profile?.vendor_id || 'V001';
  const { records: qualityRecords } = useVendorQuality(vendorId);
  const { predictions } = useVendorRiskPredictions(vendorId);
  const { records: perfRecords } = useVendorPerformance(vendorId);
  const latestRisk = predictions[0];
  const latestPerf = perfRecords[perfRecords.length - 1];
  const avgRating = qualityRecords.length > 0 ? (qualityRecords.reduce((s, q) => s + q.quality_rating, 0) / qualityRecords.length).toFixed(1) : '-';

  return (
    <div>
      <PageHeader title="Feedback" subtitle="Ratings and feedback summary" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ScoreCard label="Avg Quality Rating" value={`${avgRating}/5`} icon={<Star className="h-5 w-5" />} color="emerald" />
        <ScoreCard label="Quality Records" value={qualityRecords.length} icon={<Star className="h-5 w-5" />} color="blue" />
        <ScoreCard label="Defective Items" value={qualityRecords.reduce((s, q) => s + q.defective_quantity, 0)} icon={<AlertCircle className="h-5 w-5" />} color="red" />
        <ScoreCard label="Returns" value={qualityRecords.reduce((s, q) => s + q.return_quantity, 0)} icon={<Package className="h-5 w-5" />} color="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Quality Ratings History</h3>
          <div className="mt-4 space-y-2">
            {qualityRecords.slice(-8).map((q) => (
              <div key={q.quality_id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div><p className="text-sm font-medium text-gray-900">{q.order_id}</p><p className="text-xs text-gray-500">Defects: {q.defective_quantity} • Returns: {q.return_quantity}</p></div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= q.quality_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
            ))}
            {qualityRecords.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No quality records</p>}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Risk Assessment Feedback</h3>
          <div className="mt-4">
            {latestRisk ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <CircularProgress value={latestRisk.risk_score} size={90} label="Risk" />
                  <div><RiskBadge level={latestRisk.risk_level as 'low' | 'medium' | 'high'} score={latestRisk.risk_score} /><p className="mt-2 text-xs text-gray-500">Performance: {latestPerf?.overall_score || '-'}%</p></div>
                </div>
                {latestRisk.major_risk_factors && <div className="rounded-lg bg-amber-50 p-3"><p className="text-xs font-semibold text-gray-700">Areas to Improve:</p><p className="text-sm text-gray-600">{latestRisk.major_risk_factors}</p></div>}
                {latestRisk.positive_factors && <div className="rounded-lg bg-emerald-50 p-3"><p className="text-xs font-semibold text-gray-700">Strengths:</p><p className="text-sm text-gray-600">{latestRisk.positive_factors}</p></div>}
                {latestRisk.recommendation && <div className="rounded-lg bg-blue-50 p-3"><p className="text-xs font-semibold text-gray-700">Recommendation:</p><p className="text-sm text-gray-600">{latestRisk.recommendation}</p></div>}
              </div>
            ) : <p className="py-8 text-center text-sm text-gray-400">No risk assessment available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
