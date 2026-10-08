import { useState, useMemo } from 'react';
import { useVendors } from '@/hooks/useData';
import { PageHeader, LoadingSpinner, Select, ScoreCard, CircularProgress, ProgressBar } from '@/components/UI';
import { RiskBadge } from '@/components/Badges';
import { RiskFactorBarChart } from '@/components/Charts';
import { runRiskPrediction, saveRiskPrediction } from '@/lib/api';
import { showToast } from '@/components/Toast';
import type { RiskResult } from '@/types';
import { ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Lightbulb, Brain } from 'lucide-react';

export function RiskPredictionPage({ backLink }: { backLink: string }) {
  const { vendors, loading } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState('');
  const [result, setResult] = useState<RiskResult | null>(null);
  const [predicting, setPredicting] = useState(false);

  const vendor = useMemo(() => vendors.find((v) => v.vendor_id === selectedVendor), [vendors, selectedVendor]);

  const handlePredict = async () => {
    if (!selectedVendor) {
      showToast('error', 'Please select a vendor first');
      return;
    }
    setPredicting(true);
    try {
      const r = await runRiskPrediction(selectedVendor);
      setResult(r);
      await saveRiskPrediction(selectedVendor, r);
      showToast('success', 'Risk prediction completed and saved');
    } catch {
      showToast('error', 'Failed to run prediction');
    }
    setPredicting(false);
  };

  if (loading) return <LoadingSpinner message="Loading vendors..." />;

  return (
    <div>
      <PageHeader title="AI Vendor Risk Prediction" subtitle="Predict vendor risk using AI-powered analysis" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Brain className="h-6 w-6" /></div>
          <div>
            <h3 className="font-semibold text-gray-900">Select a vendor to predict risk</h3>
            <p className="text-sm text-gray-500">The AI model analyzes historical data to predict risk level</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[250px]">
            <Select label="Vendor" value={selectedVendor} onChange={setSelectedVendor} placeholder="Select a vendor" options={vendors.map((v) => ({ value: v.vendor_id, label: `${v.vendor_name} (${v.vendor_id})` }))} />
          </div>
          <button
            onClick={handlePredict}
            disabled={!selectedVendor || predicting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {predicting ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Predicting...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Predict Risk</>
            )}
          </button>
        </div>
      </div>

      {vendor && !result && !predicting && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Vendor Information: {vendor.vendor_name}</h3>
          <p className="mt-1 text-sm text-gray-500">Click "Predict Risk" to run the AI analysis</p>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          {/* Result Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <CircularProgress value={result.riskScore} size={120} label="Risk Score" />
                <div>
                  <p className="text-sm text-gray-500">Vendor Risk Level</p>
                  <div className="mt-2"><RiskBadge level={result.riskLevel} score={result.riskScore} /></div>
                  <div className="mt-3 space-y-1 text-sm">
                    <p><span className="text-gray-500">Risk Score:</span> <span className="font-bold text-gray-900">{result.riskScore}%</span></p>
                    <p><span className="text-gray-500">Performance Score:</span> <span className="font-bold text-gray-900">{result.performanceScore}%</span></p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <ScoreCard label="Total Orders" value={result.stats.totalOrders} icon={<ShieldAlert className="h-5 w-5" />} color="blue" />
                <ScoreCard label="Delayed" value={result.stats.delayedOrders} icon={<AlertTriangle className="h-5 w-5" />} color="amber" />
                <ScoreCard label="Complaints" value={result.stats.complaints} icon={<ShieldAlert className="h-5 w-5" />} color="red" />
              </div>
            </div>
          </div>

          {/* Historical Stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Historical Data Summary</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: 'Total Orders', value: result.stats.totalOrders },
                { label: 'Delayed Orders', value: result.stats.delayedOrders },
                { label: 'On-Time Orders', value: result.stats.onTimeOrders },
                { label: 'Defective Products', value: result.stats.defectiveProducts },
                { label: 'Returns', value: result.stats.returns },
                { label: 'Complaints', value: result.stats.complaints },
                { label: 'Cancelled Orders', value: result.stats.cancelledOrders },
                { label: 'Avg Delivery Delay (days)', value: result.stats.avgDeliveryTime },
                { label: 'Avg Quality Rating', value: `${result.stats.avgQualityRating}/5` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">Positive Factors</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {result.positiveFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900">Risk Factors</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {result.riskFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risk Factor Analysis */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Risk Factor Analysis</h3>
            <div className="mt-4">
              <RiskFactorBarChart data={[
                { name: 'Delivery Delays', value: result.factorBreakdown.deliveryDelays },
                { name: 'Quality Issues', value: result.factorBreakdown.qualityIssues },
                { name: 'Complaints', value: result.factorBreakdown.complaints },
                { name: 'Cancellations', value: result.factorBreakdown.cancellations },
              ]} />
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-600 p-2 text-white"><Lightbulb className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Recommendation</h3>
                <p className="mt-2 text-gray-700">{result.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
