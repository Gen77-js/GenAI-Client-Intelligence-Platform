import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const SOURCE_STYLES = {
  'Confirmed Fact': { cls: 'source-confirmed', label: '✓ Confirmed' },
  'Client Reported': { cls: 'source-client', label: '💬 Client Reported' },
  'AI Inference': { cls: 'source-inference', label: '🤖 AI Inference' },
  'Missing Information': { cls: 'source-missing', label: '— Missing' },
};

export function SourceTag({ type }) {
  const style = SOURCE_STYLES[type] || SOURCE_STYLES['Missing Information'];
  return (
    <span className={style.cls}>{style.label}</span>
  );
}

export function EvidenceList({ evidence = [] }) {
  if (!evidence.length) return null;

  return (
    <div className="space-y-2 mt-3">
      {evidence.map((item, i) => (
        <div
          key={i}
          className="bg-surface-700 rounded-lg p-3 text-sm text-gray-300 border border-surface-600 flex flex-col gap-1.5"
        >
          <p className="italic leading-relaxed">"{item.text}"</p>
          <div className="flex items-center gap-2">
            <SourceTag type={item.source_type} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConfidenceBadge({ value }) {
  const pct = Math.round((parseFloat(value) || 0) * 100);
  const color = pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400';
  return (
    <span className={`text-xs font-semibold ${color}`}>
      {pct}% confidence
    </span>
  );
}
