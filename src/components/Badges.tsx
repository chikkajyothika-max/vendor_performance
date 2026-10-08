import type { RiskLevel } from '@/types';

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  const config = {
    low: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Low Risk',
    },
    medium: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'Medium Risk',
    },
    high: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500',
      label: 'High Risk',
    },
  };

  const c = config[level];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
      {score !== undefined && <span className="opacity-70">({score}%)</span>}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' },
    pending: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Pending' },
    processing: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Processing' },
    shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Shipped' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Delivered' },
    delayed: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Delayed' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
    open: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Open' },
    resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Resolved' },
  };

  const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
