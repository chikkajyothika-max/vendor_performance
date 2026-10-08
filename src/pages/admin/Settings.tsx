import { PageHeader } from '@/components/UI';
import { showToast } from '@/components/Toast';
import { Settings as SettingsIcon, Bell, Shield, Database, Globe } from 'lucide-react';

export function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage system configuration" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Email notifications for new complaints', defaultChecked: true },
              { label: 'Alert on high-risk vendor detection', defaultChecked: true },
              { label: 'Weekly performance summary', defaultChecked: false },
              { label: 'Monthly risk prediction report', defaultChecked: true },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.label}</span>
                <input type="checkbox" defaultChecked={item.defaultChecked} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Security</h3>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-700">Password Policy</label>
              <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" defaultValue="medium">
                <option value="low">Low (6+ characters)</option>
                <option value="medium">Medium (8+ characters, mixed)</option>
                <option value="high">High (12+ characters, symbols)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Session Timeout</label>
              <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" defaultValue="60">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Data Management</h3>
          </div>
          <div className="mt-4 space-y-3">
            <button onClick={() => showToast('info', 'Data export started')} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Export All Data
            </button>
            <button onClick={() => showToast('info', 'Backup initiated')} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Backup Database
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">System Preferences</h3>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-700">Default Currency</label>
              <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" defaultValue="USD">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Date Format</label>
              <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" defaultValue="YYYY-MM-DD">
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={() => showToast('success', 'Settings saved successfully')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          <SettingsIcon className="h-4 w-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
