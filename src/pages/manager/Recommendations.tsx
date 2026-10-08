import { useMemo } from 'react';
import { useVendors, useAllPerformance, useAllRiskPredictions } from '@/hooks/useData';
import { PageHeader, LoadingSpinner } from '@/components/UI';
import { RiskBadge } from '@/components/Badges';
import { Trophy, Award, AlertTriangle, Lightbulb, Star } from 'lucide-react';

export function Recommendations() {
  const { vendors, loading: vLoading } = useVendors();
  const { records: perfRecords, loading: pLoading } = useAllPerformance();
  const { predictions, loading: rLoading } = useAllRiskPredictions();

  const loading = vLoading || pLoading || rLoading;

  const recommendations = useMemo(() => {
    const perfMap = new Map<string, number>();
    perfRecords.forEach((p) => { if (!perfMap.has(p.vendor_id) || p.evaluation_date > (perfRecords.find((x) => x.vendor_id === p.vendor_id && x.overall_score === perfMap.get(p.vendor_id))?.evaluation_date || '')) perfMap.set(p.vendor_id, p.overall_score); });

    const riskMap = new Map<string, string>();
    predictions.forEach((p) => { if (!riskMap.has(p.vendor_id)) riskMap.set(p.vendor_id, p.risk_level); });

    return vendors
      .map((v) => ({
        ...v,
        score: perfMap.get(v.vendor_id) || 0,
        risk: riskMap.get(v.vendor_id) as 'low' | 'medium' | 'high' | undefined,
      }))
      .sort((a, b) => b.score - a.score);
  }, [vendors, perfRecords, predictions]);

  if (loading) return <LoadingSpinner message="Loading recommendations..." />;

  return (
    <div>
      <PageHeader title="AI Recommendations" subtitle="Smart vendor recommendations based on performance and risk" />

      <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-600 p-2 text-white"><Lightbulb className="h-5 w-5" /></div>
          <div>
            <h3 className="font-semibold text-gray-900">AI-Powered Vendor Recommendations</h3>
            <p className="mt-1 text-sm text-gray-600">These recommendations are based on each vendor's performance score, risk level, and historical data analysis.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {recommendations.map((v, i) => {
          const isTop = i < 3;
          const icon = v.risk === 'low' ? (i === 0 ? <Trophy className="h-5 w-5 text-amber-500" /> : <Award className="h-5 w-5 text-gray-400" />) : <AlertTriangle className="h-5 w-5 text-red-500" />;
          const recommendationText = v.risk === 'low'
            ? `Recommended for ${v.score >= 85 ? 'high-value' : 'regular'} orders`
            : v.risk === 'medium'
            ? 'Suitable for non-critical orders with monitoring'
            : 'Consider alternative vendors';

          return (
            <div key={v.vendor_id} className={`rounded-xl border p-5 ${v.risk === 'high' ? 'border-red-200 bg-red-50/50' : v.risk === 'medium' ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200 bg-white'}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">{icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{v.vendor_name}</h3>
                      {isTop && v.risk === 'low' && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Top {i + 1}</span>}
                    </div>
                    <p className="text-xs text-gray-500">{v.category} • {v.vendor_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Performance</p>
                    <p className="text-lg font-bold text-gray-900">{Math.round(v.score)}%</p>
                  </div>
                  {v.risk && <RiskBadge level={v.risk} />}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                <Star className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-gray-700"><span className="font-medium">Recommendation:</span> {recommendationText}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
