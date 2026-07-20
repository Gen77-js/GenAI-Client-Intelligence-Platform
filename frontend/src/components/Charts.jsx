import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

function statusToScore(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('on track') || s.includes('good') || s.includes('adequate') || s.includes('active') || s.includes('high') || s.includes('positive')) return 80;
  if (s.includes('partially') || s.includes('fair') || s.includes('moderate') || s.includes('medium') || s.includes('neutral')) return 55;
  if (s.includes('off track') || s.includes('poor') || s.includes('inadequate') || s.includes('sedentary') || s.includes('low') || s.includes('negative')) return 25;
  return 0; // Not Mentioned
}

const CHART_COLORS = {
  nutrition: '#10b981',
  sleep: '#818cf8',
  exercise: '#f59e0b',
  water: '#06b6d4',
  stress: '#a855f7',
  mood: '#f472b6',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-xl p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Charts({ analysis }) {
  const { nutrition_adherence, sleep, exercise, water_intake, stress, mood } = analysis;

  const radarData = [
    { subject: 'Nutrition', score: statusToScore(nutrition_adherence?.status) },
    { subject: 'Sleep', score: statusToScore(sleep?.status) },
    { subject: 'Exercise', score: statusToScore(exercise?.status) },
    { subject: 'Hydration', score: statusToScore(water_intake?.status) },
    { subject: 'Stress Mgmt', score: 100 - statusToScore(stress?.level) }, // invert stress
    { subject: 'Mood', score: statusToScore(mood?.overall) },
  ];

  const barData = [
    { name: 'Nutrition', value: statusToScore(nutrition_adherence?.status), fill: CHART_COLORS.nutrition },
    { name: 'Sleep', value: statusToScore(sleep?.status), fill: CHART_COLORS.sleep },
    { name: 'Exercise', value: statusToScore(exercise?.status), fill: CHART_COLORS.exercise },
    { name: 'Water', value: statusToScore(water_intake?.status), fill: CHART_COLORS.water },
    { name: 'Stress Mgmt', value: 100 - statusToScore(stress?.level), fill: CHART_COLORS.stress },
    { name: 'Mood', value: statusToScore(mood?.overall), fill: CHART_COLORS.mood },
  ];

  const pieData = barData.filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Radar */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-300 mb-4">Wellness Radar</p>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#252540" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-300 mb-4">Domain Scores</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} barSize={28} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252540" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
