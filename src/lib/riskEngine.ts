import type { Order, QualityRecord, Complaint, Performance } from '@/types';
import type { RiskResult } from '@/types';

function daysBetween(a: string, b: string): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function calculateRisk(
  orders: Order[],
  qualityRecords: QualityRecord[],
  complaints: Complaint[],
  performanceRecords: Performance[]
): RiskResult {
  const totalOrders = orders.length;
  const delayedOrders = orders.filter((o) => o.order_status === 'delayed').length;
  const cancelledOrders = orders.filter((o) => o.order_status === 'cancelled').length;
  const pendingOrders = orders.filter((o) => o.order_status === 'pending').length;

  const deliveredOrders = orders.filter(
    (o) => o.actual_delivery && o.expected_delivery
  );
  const onTimeOrders = deliveredOrders.filter(
    (o) => daysBetween(o.expected_delivery!, o.actual_delivery!) <= 0
  ).length;
  const lateDelivered = deliveredOrders.filter(
    (o) => daysBetween(o.expected_delivery!, o.actual_delivery!) > 0
  ).length;

  const defectiveProducts = qualityRecords.reduce(
    (sum, q) => sum + (q.defective_quantity || 0),
    0
  );
  const returns = qualityRecords.reduce(
    (sum, q) => sum + (q.return_quantity || 0),
    0
  );
  const totalQuantity = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);

  const avgQualityRating =
    qualityRecords.length > 0
      ? qualityRecords.reduce((sum, q) => sum + (q.quality_rating || 0), 0) /
        qualityRecords.length
      : 0;

  const openComplaints = complaints.filter((c) => c.status === 'open').length;
  const totalComplaints = complaints.length;

  const avgDeliveryDelays = deliveredOrders.map((o) =>
    Math.max(0, daysBetween(o.expected_delivery!, o.actual_delivery!))
  );
  const avgDeliveryTime =
    avgDeliveryDelays.length > 0
      ? avgDeliveryDelays.reduce((a, b) => a + b, 0) / avgDeliveryDelays.length
      : 0;

  const onTimeRate = totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 100;
  const cancelRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
  const defectRate =
    totalQuantity > 0 ? (defectiveProducts / totalQuantity) * 100 : 0;
  const returnRate = totalQuantity > 0 ? (returns / totalQuantity) * 100 : 0;
  const complaintRate = totalOrders > 0 ? (totalComplaints / totalOrders) * 100 : 0;

  const deliveryDelayFactor = Math.min(100, ((100 - onTimeRate) * 1.2) + (avgDeliveryTime * 3));
  const qualityIssueFactor = Math.min(100, (defectRate * 2.5) + (returnRate * 2) + ((5 - avgQualityRating) * 12));
  const complaintFactor = Math.min(100, (complaintRate * 5) + (openComplaints * 8));
  const cancellationFactor = Math.min(100, (cancelRate * 4) + (pendingOrders * 2));

  const riskScore = Math.round(
    deliveryDelayFactor * 0.3 +
    qualityIssueFactor * 0.25 +
    complaintFactor * 0.2 +
    cancellationFactor * 0.15 +
    (avgQualityRating < 4 ? (4 - avgQualityRating) * 10 : 0) * 0.1
  );

  const clampedScore = Math.max(0, Math.min(100, riskScore));

  let riskLevel: 'low' | 'medium' | 'high';
  if (clampedScore <= 30) riskLevel = 'low';
  else if (clampedScore <= 60) riskLevel = 'medium';
  else riskLevel = 'high';

  const latestPerf = performanceRecords[performanceRecords.length - 1];
  const performanceScore = latestPerf
    ? Math.round(
        (latestPerf.delivery_score * 0.3 +
          latestPerf.quality_score * 0.25 +
          latestPerf.reliability_score * 0.15 +
          latestPerf.cost_score * 0.1 +
          (avgQualityRating / 5) * 100 * 0.1 +
          onTimeRate * 0.1)
      )
    : Math.round(onTimeRate * 0.5 + (avgQualityRating / 5) * 100 * 0.5);

  const positiveFactors: string[] = [];
  const riskFactors: string[] = [];

  if (onTimeRate >= 85) positiveFactors.push('High on-time delivery rate');
  if (avgQualityRating >= 4.5) positiveFactors.push('Excellent product quality');
  else if (avgQualityRating >= 4) positiveFactors.push('Good product quality');
  if (totalComplaints === 0) positiveFactors.push('No complaints filed');
  else if (openComplaints === 0) positiveFactors.push('All complaints resolved');
  if (cancelRate === 0) positiveFactors.push('No order cancellations');
  if (returnRate < 2) positiveFactors.push('Low return rate');
  if (defectRate < 3) positiveFactors.push('Low defect rate');

  if (onTimeRate < 70) riskFactors.push('Low on-time delivery rate');
  if (avgDeliveryTime > 3) riskFactors.push(`Average delivery delay of ${avgDeliveryTime.toFixed(1)} days`);
  if (avgQualityRating < 4) riskFactors.push('Below-average quality rating');
  if (defectRate > 5) riskFactors.push(`High defect rate (${defectRate.toFixed(1)}%)`);
  if (openComplaints > 0) riskFactors.push(`${openComplaints} unresolved complaint${openComplaints > 1 ? 's' : ''}`);
  if (cancelRate > 10) riskFactors.push('High order cancellation rate');
  if (returnRate > 5) riskFactors.push(`High return rate (${returnRate.toFixed(1)}%)`);
  if (totalComplaints > totalOrders * 0.3) riskFactors.push('High complaint-to-order ratio');

  let recommendation: string;
  if (riskLevel === 'low') {
    recommendation =
      'This vendor is currently performing well and can be considered for future orders. Continue monitoring delivery performance.';
  } else if (riskLevel === 'medium') {
    recommendation =
      'This vendor shows moderate risk. Monitor performance closely and consider them for non-critical orders. Implement additional quality checks for time-sensitive purchases.';
  } else {
    recommendation =
      'Consider alternative vendors. This vendor shows significant performance issues with high risk of delays and quality problems. Review the contract before renewal.';
  }

  return {
    riskScore: clampedScore,
    riskLevel,
    performanceScore,
    positiveFactors: positiveFactors.length > 0 ? positiveFactors : ['No significant positive factors identified'],
    riskFactors: riskFactors.length > 0 ? riskFactors : ['No significant risk factors identified'],
    recommendation,
    factorBreakdown: {
      deliveryDelays: Math.round(deliveryDelayFactor),
      qualityIssues: Math.round(qualityIssueFactor),
      complaints: Math.round(complaintFactor),
      cancellations: Math.round(cancellationFactor),
    },
    stats: {
      totalOrders,
      delayedOrders: delayedOrders + lateDelivered,
      onTimeOrders,
      defectiveProducts,
      returns,
      complaints: totalComplaints,
      cancelledOrders,
      avgDeliveryTime: Math.round(avgDeliveryTime * 10) / 10,
      avgQualityRating: Math.round(avgQualityRating * 10) / 10,
    },
  };
}
