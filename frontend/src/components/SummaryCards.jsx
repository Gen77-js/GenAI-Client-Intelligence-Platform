import React from 'react';
import {
  Activity, Moon, Droplets, Zap, Heart, Brain, AlertTriangle, TrendingUp
} from 'lucide-react';

function getStatusColor(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('on track') || s.includes('good') || s.includes('adequate') || s.includes('active') || s.includes('high') || s.includes('positive')) return 'text-emerald-400';
  if (s.includes('partially') || s.includes('fair') || s.includes('moderate') || s.includes('medium') || s.includes('neutral')) return 'text-amber-400';
  if (s.includes('off track') || s.includes('poor') || s.includes('inadequate') || s.includes('sedentary') || s.includes('low') || s.includes('negative')) return 'text-red-400';
  return 'text-gray-400';
}

function getStatusBg(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('on track') || s.includes('good') || s.includes('adequate') || s.includes('active') || s.includes('positive')) return 'bg-emerald-500/10 border-emerald-500/20';
  if (s.includes('partially') || s.includes('fair') || s.includes('moderate') || s.includes('neutral')) return 'bg-amber-500/10 border-amber-500/20';
  if (s.includes('off track') || s.includes('poor') || s.includes('inadequate') || s.includes('sedentary') || s.includes('negative')) return 'bg-red-500/10 border-red-500/20';
  return 'bg-surface-600 border-surface-500';
}

function WellnessScoreCard({ score, confidence }) {
  const numericScore = parseFloat((score || '0').split('/')[0]) || 0;
  const total = parseFloat((score || '100').split('/')[1]) || 100;
  const pct = Math.min(100, (numericScore / total) * 100);

  let ringColor = '#10b981';
  if (pct < 40) ringColor = '#ef4444';
  else if (pct < 70) ringColor = '#f59e0b';

  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="card-glow flex flex-col items-center text-center">
      <div className="section-icon bg-brand-600/20 mb-3 w-auto h-auto p-0">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#252540" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-100">{Math.round(pct)}</span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
        </div>
      </div>
      <p className="font-semibold text-gray-100 text-sm">Overall Wellness</p>
      <p className="text-xs text-gray-400 mt-1">Confidence: {Math.round((parseFloat(confidence) || 0) * 100)}%</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, status, color, bgClass }) {
  return (
    <div className={`card border ${bgClass || 'border-surface-600'} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-surface-700`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBg(status)} ${getStatusColor(status)}`}>
          {status || 'Not Mentioned'}
        </span>
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-semibold text-gray-100 text-sm mt-0.5">{value || 'Not Mentioned'}</p>
      </div>
    </div>
  );
}

export default function SummaryCards({ analysis }) {
  const {
    overall_wellness_score,
    confidence,
    nutrition_adherence,
    exercise,
    sleep,
    water_intake,
    stress,
    mood,
    engagement,
  } = analysis;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <WellnessScoreCard score={overall_wellness_score} confidence={confidence} />
        </div>

        <MetricCard
          icon={Activity}
          label="Nutrition"
          value={nutrition_adherence?.status}
          status={nutrition_adherence?.status}
          color="text-green-400"
        />
        <MetricCard
          icon={Moon}
          label="Sleep"
          value={sleep?.average ? `Avg: ${sleep.average}` : sleep?.status}
          status={sleep?.status}
          color="text-indigo-400"
        />
        <MetricCard
          icon={Zap}
          label="Exercise"
          value={exercise?.steps !== 'Not Mentioned' ? `${exercise?.steps} steps` : exercise?.status}
          status={exercise?.status}
          color="text-amber-400"
        />
        <MetricCard
          icon={Droplets}
          label="Hydration"
          value={water_intake?.average ? `${water_intake.average}/day` : water_intake?.status}
          status={water_intake?.status}
          color="text-cyan-400"
        />
        <MetricCard
          icon={Brain}
          label="Stress"
          value={stress?.level}
          status={stress?.level}
          color="text-purple-400"
        />
        <MetricCard
          icon={Heart}
          label="Mood"
          value={mood?.overall}
          status={mood?.overall}
          color="text-pink-400"
        />
      </div>
    </div>
  );
}
