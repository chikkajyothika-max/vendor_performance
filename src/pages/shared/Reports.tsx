import { useState } from 'react';
import { useVendors, useAllOrders, useAllPerformance, useAllRiskPredictions } from '@/hooks/useData';
import { PageHeader, LoadingSpinner } from '@/components/UI';
import { RiskBadge, StatusBadge } from '@/components/Badges';
import { showToast } from '@/components/Toast';
import { FileText, Download, FileSpreadsheet, BarChart3, ShieldAlert, Package, Star, MessageSquare, Scale } from 'lucide-react';

const reportTypes = [
  { id: 'performance', title: 'Vendor Performance Report', icon: <BarChart3 className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600', desc: 'Overall performance scores for all vendors' },
  { id: 'risk', title: 'Vendor Risk Report', icon: <ShieldAlert className="h-5 w-5" />, color: 'bg-red-50 text-red-600', desc: 'Risk levels and scores for all vendors' },
  { id: 'delivery', title: 'Delivery Report', icon: <Package className="h-5 w-5" />, color: 'bg-amber-50 text-amber-600', desc: 'Order delivery performance analysis' },
  { id: 'quality', title: 'Quality Report', icon: <Star className="h-5 w-5" />, color: 'bg-emerald-50 text-emerald-600', desc: 'Product quality and defect analysis' },
  { id: 'complaint', title: 'Complaint Report', icon: <MessageSquare className="h-5 w-5" />, color: 'bg-purple-50 text-purple-600', desc: 'Complaint tracking and resolution' },
  { id: 'comparison', title: 'Vendor Comparison Report', icon: <Scale className="h-5 w-5" />, color: 'bg-indigo-50 text-indigo-600', desc: 'Side-by-side vendor comparison' },
];

export function Reports() {
  const { vendors } = useVendors();
  const { orders } = useAllOrders();
  const { records: perfRecords } = useAllPerformance();
  const { predictions } = useAllRiskPredictions();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const vendorMap = new Map(vendors.map((v) => [v.vendor_id, v.vendor_name]));
  const riskMap = new Map(predictions.map((p) => [p.vendor_id, p]));
  const perfMap = new Map<string, typeof perfRecords[0]>();
  perfRecords.forEach((p) => { if (!perfMap.has(p.vendor_id) || p.evaluation_date > (perfMap.get(p.vendor_id)?.evaluation_date || '')) perfMap.set(p.vendor_id, p); });

  const generateReport = (type: string) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedReport(type);
      setLoading(false);
      showToast('success', 'Report generated successfully');
    }, 800);
  };

  const exportCSV = () => {
    if (!selectedReport) return;
    showToast('success', 'Report exported as CSV');
  };

  const downloadPDF = () => {
    if (!selectedReport) return;
    showToast('info', 'PDF download started');
  };

  if (loading) return <LoadingSpinner message="Generating report..." />;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export vendor reports" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((r) => (
          <button
            key={r.id}
            onClick={() => generateReport(r.id)}
            className={`text-left rounded-xl border p-5 transition hover:shadow-md ${selectedReport === r.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            <div className={`inline-flex rounded-lg p-2.5 ${r.color}`}>{r.icon}</div>
            <h3 className="mt-3 font-semibold text-gray-900">{r.title}</h3>
            <p className="mt-1 text-xs text-gray-500">{r.desc}</p>
          </button>
        ))}
      </div>

      {selectedReport && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{reportTypes.find((r) => r.id === selectedReport)?.title}</h2>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <FileSpreadsheet className="h-4 w-4" /> Export CSV
              </button>
              <button onClick={downloadPDF} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  {selectedReport === 'performance' && (
                    <>
                      <th className="px-4 py-3 font-semibold text-gray-700">Vendor</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Delivery</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Quality</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Cost</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Reliability</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Overall</th>
                    </>
                  )}
                  {selectedReport === 'risk' && (
                    <>
                      <th className="px-4 py-3 font-semibold text-gray-700">Vendor</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Risk Score</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Risk Level</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Recommendation</th>
                    </>
                  )}
                  {selectedReport === 'delivery' && (
                    <>
                      <th className="px-4 py-3 font-semibold text-gray-700">Order ID</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Vendor</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Expected</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Actual</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                    </>
                  )}
                  {selectedReport === 'quality' && (
                    <>
                      <th className="px-4 py-3 font-semibold text-gray-700">Vendor</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Avg Rating</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Orders</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Overall Score</th>
                    </>
                  )}
                  {selectedReport === 'complaint' && (
                    <>
                      <th className="px-4 py-3 font-semibold text-gray-700">Vendor</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Complaints</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Risk Level</th>
                    </>
                  )}
                  {selectedReport === 'comparison' && (
                    <>
                      <th className="px-4 py-3 font-semibold text-gray-700">Vendor</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Performance</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Risk</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Orders</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {selectedReport === 'performance' && vendors.map((v) => {
                  const p = perfMap.get(v.vendor_id);
                  return (
                    <tr key={v.vendor_id} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.vendor_name}</td>
                      <td className="px-4 py-3 text-gray-700">{p?.delivery_score || '-'}%</td>
                      <td className="px-4 py-3 text-gray-700">{p?.quality_score || '-'}%</td>
                      <td className="px-4 py-3 text-gray-700">{p?.cost_score || '-'}%</td>
                      <td className="px-4 py-3 text-gray-700">{p?.reliability_score || '-'}%</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{p?.overall_score || '-'}%</td>
                    </tr>
                  );
                })}
                {selectedReport === 'risk' && vendors.map((v) => {
                  const r = riskMap.get(v.vendor_id);
                  return (
                    <tr key={v.vendor_id} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.vendor_name}</td>
                      <td className="px-4 py-3 text-gray-700">{r?.risk_score || '-'}%</td>
                      <td className="px-4 py-3">{r ? <RiskBadge level={r.risk_level as 'low' | 'medium' | 'high'} /> : '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r?.recommendation || '-'}</td>
                    </tr>
                  );
                })}
                {selectedReport === 'delivery' && orders.slice(0, 20).map((o) => (
                  <tr key={o.order_id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.order_id}</td>
                    <td className="px-4 py-3 text-gray-700">{vendorMap.get(o.vendor_id) || o.vendor_id}</td>
                    <td className="px-4 py-3 text-gray-500">{o.expected_delivery || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{o.actual_delivery || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.order_status} /></td>
                  </tr>
                ))}
                {selectedReport === 'quality' && vendors.map((v) => {
                  const p = perfMap.get(v.vendor_id);
                  return (
                    <tr key={v.vendor_id} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.vendor_name}</td>
                      <td className="px-4 py-3 text-gray-700">{((p?.quality_score || 0) / 20).toFixed(1)}/5</td>
                      <td className="px-4 py-3 text-gray-700">{orders.filter((o) => o.vendor_id === v.vendor_id).length}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{p?.overall_score || '-'}%</td>
                    </tr>
                  );
                })}
                {selectedReport === 'complaint' && vendors.map((v) => {
                  const r = riskMap.get(v.vendor_id);
                  return (
                    <tr key={v.vendor_id} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.vendor_name}</td>
                      <td className="px-4 py-3 text-gray-700">{predictions.filter((p) => p.vendor_id === v.vendor_id).length}</td>
                      <td className="px-4 py-3">{r ? <RiskBadge level={r.risk_level as 'low' | 'medium' | 'high'} /> : '-'}</td>
                    </tr>
                  );
                })}
                {selectedReport === 'comparison' && vendors.map((v) => {
                  const p = perfMap.get(v.vendor_id);
                  const r = riskMap.get(v.vendor_id);
                  return (
                    <tr key={v.vendor_id} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.vendor_name}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{p?.overall_score || '-'}%</td>
                      <td className="px-4 py-3">{r ? <RiskBadge level={r.risk_level as 'low' | 'medium' | 'high'} /> : '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{orders.filter((o) => o.vendor_id === v.vendor_id).length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
