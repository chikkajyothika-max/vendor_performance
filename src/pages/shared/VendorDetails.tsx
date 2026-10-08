import { useParams, useNavigate } from 'react-router-dom';
import { useVendor, useVendorOrders, useVendorQuality, useVendorComplaints, useVendorPerformance, useVendorRiskPredictions } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, ScoreCard, CircularProgress, ProgressBar } from '@/components/UI';
import { RiskBadge, StatusBadge } from '@/components/Badges';
import { MonthlyLineChart, RadarChartComponent, RiskFactorBarChart } from '@/components/Charts';
import { Package, AlertCircle, Star, TrendingUp, ArrowLeft, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useMemo } from 'react';

export function VendorDetails({ backLink }: { backLink: string }) {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { vendor, loading } = useVendor(vendorId);
  const { orders } = useVendorOrders(vendorId);
  const { records: qualityRecords } = useVendorQuality(vendorId);
  const { complaints } = useVendorComplaints(vendorId);
  const { records: perfRecords } = useVendorPerformance(vendorId);
  const { predictions } = useVendorRiskPredictions(vendorId);

  const latestPerf = perfRecords[perfRecords.length - 1];
  const latestRisk = predictions[0];

  const radarData = useMemo(() => {
    if (!latestPerf) return [];
    return [
      { metric: 'Delivery', value: latestPerf.delivery_score },
      { metric: 'Quality', value: latestPerf.quality_score },
      { metric: 'Cost', value: latestPerf.cost_score },
      { metric: 'Reliability', value: latestPerf.reliability_score },
    ];
  }, [latestPerf]);

  const monthlyData = useMemo(() => {
    return perfRecords.map((p) => ({ month: p.month, score: p.overall_score }));
  }, [perfRecords]);

  if (loading) return <LoadingSpinner message="Loading vendor details..." />;

  if (!vendor) {
    return (
      <div>
        <PageHeader title="Vendor Not Found" />
        <button onClick={() => navigate(backLink)} className="text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate(backLink)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" /> Back to Vendors
      </button>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.vendor_name}</h1>
            <p className="mt-1 text-sm text-gray-500">Vendor ID: {vendor.vendor_id}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{vendor.category}</span>
              <StatusBadge status={vendor.status} />
              {latestRisk && <RiskBadge level={latestRisk.risk_level as 'low' | 'medium' | 'high'} score={latestRisk.risk_score} />}
            </div>
          </div>
          {latestPerf && (
            <div className="flex flex-col items-center">
              <CircularProgress value={latestPerf.overall_score} size={100} label="Overall" />
              <p className="mt-2 text-xs font-medium text-gray-500">
                {latestPerf.overall_score >= 80 ? 'Excellent' : latestPerf.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <div><p className="text-gray-500">Email</p><p className="font-medium text-gray-900">{vendor.email}</p></div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <div><p className="text-gray-500">Phone</p><p className="font-medium text-gray-900">{vendor.phone || '-'}</p></div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div><p className="text-gray-500">Address</p><p className="font-medium text-gray-900">{vendor.address || '-'}</p></div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div><p className="text-gray-500">Registered</p><p className="font-medium text-gray-900">{vendor.registration_date || '-'}</p></div>
          </div>
        </div>
      </div>

      {latestPerf && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ScoreCard label="Delivery Score" value={`${latestPerf.delivery_score}%`} icon={<TrendingUp className="h-5 w-5" />} color="blue" />
          <ScoreCard label="Quality Score" value={`${latestPerf.quality_score}%`} icon={<Star className="h-5 w-5" />} color="emerald" />
          <ScoreCard label="Cost Score" value={`${latestPerf.cost_score}%`} icon={<TrendingUp className="h-5 w-5" />} color="amber" />
          <ScoreCard label="Reliability Score" value={`${latestPerf.reliability_score}%`} icon={<TrendingUp className="h-5 w-5" />} color="indigo" />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Performance Metrics Radar</h3>
          <div className="mt-4">
            {radarData.length > 0 ? <RadarChartComponent data={radarData} /> : <p className="py-12 text-center text-sm text-gray-400">No performance data</p>}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Monthly Performance Trend</h3>
          <div className="mt-4">
            {monthlyData.length > 0 ? <MonthlyLineChart data={monthlyData} /> : <p className="py-12 text-center text-sm text-gray-400">No trend data</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Orders</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{orders.length}</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Delivered</span><span className="font-medium text-emerald-600">{orders.filter((o) => o.order_status === 'delivered').length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pending</span><span className="font-medium text-blue-600">{orders.filter((o) => o.order_status === 'pending').length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delayed</span><span className="font-medium text-amber-600">{orders.filter((o) => o.order_status === 'delayed').length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Cancelled</span><span className="font-medium text-red-600">{orders.filter((o) => o.order_status === 'cancelled').length}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Complaints</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{complaints.length}</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Open</span><span className="font-medium text-amber-600">{complaints.filter((c) => c.status === 'open').length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Resolved</span><span className="font-medium text-emerald-600">{complaints.filter((c) => c.status === 'resolved').length}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Quality</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {qualityRecords.length > 0 ? (qualityRecords.reduce((s, q) => s + q.quality_rating, 0) / qualityRecords.length).toFixed(1) : '-'}
          </p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Records</span><span className="font-medium text-gray-900">{qualityRecords.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Defective Items</span><span className="font-medium text-red-600">{qualityRecords.reduce((s, q) => s + q.defective_quantity, 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Returns</span><span className="font-medium text-amber-600">{qualityRecords.reduce((s, q) => s + q.return_quantity, 0)}</span></div>
          </div>
        </div>
      </div>

      {vendor.products_services && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Business Information</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs text-gray-500">Products / Services</p><p className="mt-1 text-sm font-medium text-gray-900">{vendor.products_services}</p></div>
            <div><p className="text-xs text-gray-500">Contract Value</p><p className="mt-1 text-sm font-medium text-gray-900">${vendor.contract_value?.toLocaleString() || '-'}</p></div>
            <div><p className="text-xs text-gray-500">Payment Terms</p><p className="mt-1 text-sm font-medium text-gray-900">{vendor.payment_terms || '-'}</p></div>
            <div><p className="text-xs text-gray-500">Contract Period</p><p className="mt-1 text-sm font-medium text-gray-900">{vendor.contract_start_date || '-'} to {vendor.contract_end_date || '-'}</p></div>
          </div>
        </div>
      )}

      {latestRisk && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Latest Risk Assessment</h3>
          <div className="mt-4 flex items-center gap-4">
            <CircularProgress value={latestRisk.risk_score} size={90} label="Risk" />
            <div className="flex-1">
              <RiskBadge level={latestRisk.risk_level as 'low' | 'medium' | 'high'} score={latestRisk.risk_score} />
              <p className="mt-2 text-sm text-gray-600">{latestRisk.recommendation}</p>
              {latestRisk.major_risk_factors && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700">Risk Factors:</p>
                  <p className="text-sm text-gray-600">{latestRisk.major_risk_factors}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
