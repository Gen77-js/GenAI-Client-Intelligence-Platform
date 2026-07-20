import React, { useState, useCallback } from 'react';
import SummaryCards from './SummaryCards';
import AnalysisSection from './AnalysisSection';
import Charts from './Charts';
import ExportPanel from './ExportPanel';
import { Activity, BarChart2, List } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'details', label: 'Detailed Analysis', icon: List },
];

export default function Dashboard({ analysis }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewStatuses, setReviewStatuses] = useState({});

  const handleReview = useCallback((sectionId, status) => {
    setReviewStatuses(prev => ({
      ...prev,
      [sectionId]: status,
    }));
  }, []);

  if (!analysis) return null;

  const reviewedCount = Object.values(reviewStatuses).filter(Boolean).length;
  const approvedCount = Object.values(reviewStatuses).filter(s => s === 'approved').length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Dashboard header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Analysis Dashboard</h2>
          {reviewedCount > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {reviewedCount} section{reviewedCount !== 1 ? 's' : ''} reviewed
              {approvedCount > 0 && ` · ${approvedCount} approved`}
            </p>
          )}
        </div>
        <ExportPanel analysis={analysis} reviewStatuses={reviewStatuses} />
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-surface-800 p-1 rounded-xl w-fit border border-surface-600">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-brand-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
            }`}
            onClick={() => setActiveTab(id)}
            id={`tab-${id}`}
            aria-selected={activeTab === id}
            role="tab"
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Summary cards — always visible */}
      <SummaryCards analysis={analysis} />

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in space-y-5">
          {/* Weekly summary card */}
          <div className="card-glow">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" />
              Weekly Summary
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {analysis.weekly_summary || 'No summary available.'}
            </p>
          </div>

          {/* Charts */}
          <Charts analysis={analysis} />
        </div>
      )}

      {activeTab === 'details' && (
        <div className="animate-fade-in">
          <AnalysisSection
            analysis={analysis}
            reviewStatuses={reviewStatuses}
            onReview={handleReview}
          />
        </div>
      )}
    </div>
  );
}
