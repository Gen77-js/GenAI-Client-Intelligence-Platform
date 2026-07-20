import React from 'react';
import { AlertTriangle, ShieldAlert, AlertOctagon } from 'lucide-react';

const SEVERITY_CONFIG = {
  High: {
    cls: 'badge-risk-high',
    icon: AlertOctagon,
    bg: 'bg-red-500/10 border-red-500/20',
    labelColor: 'text-red-300',
  },
  Medium: {
    cls: 'badge-risk-medium',
    icon: AlertTriangle,
    bg: 'bg-amber-500/10 border-amber-500/20',
    labelColor: 'text-amber-300',
  },
  Low: {
    cls: 'badge-risk-low',
    icon: ShieldAlert,
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    labelColor: 'text-emerald-300',
  },
};

export default function RiskBadges({ riskFlags = [] }) {
  if (!riskFlags.length) {
    return (
      <div className="text-sm text-gray-400 italic py-2">No risk flags identified in this conversation.</div>
    );
  }

  return (
    <div className="space-y-3">
      {riskFlags.map((flag, i) => {
        const config = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG['Medium'];
        const Icon = config.icon;

        return (
          <div key={i} className={`border rounded-xl p-4 ${config.bg}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Icon className={`w-4 h-4 ${config.labelColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm font-semibold ${config.labelColor}`}>{flag.flag}</p>
                  <span className={config.cls}>{flag.severity}</span>
                </div>
                {flag.evidence && (
                  <p className="text-xs text-gray-400 mt-1.5 italic">"{flag.evidence}"</p>
                )}
                {flag.source_type && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 bg-surface-700 px-2 py-0.5 rounded">
                      {flag.source_type}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
