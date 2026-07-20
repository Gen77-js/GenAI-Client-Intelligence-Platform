import React, { useState } from 'react';
import {
  Activity, Moon, Droplets, Zap, Brain, Heart, ChevronDown, ChevronUp,
  AlertTriangle, ListChecks, BookOpen, Lightbulb, Info, Target, Users
} from 'lucide-react';
import { EvidenceList, ConfidenceBadge, SourceTag } from './EvidencePanel';
import ReviewControls from './ReviewControls';
import RiskBadges from './RiskBadges';

function reviewRingClass(status) {
  if (status === 'approved') return 'ring-2 ring-emerald-500/40';
  if (status === 'rejected') return 'ring-2 ring-red-500/40 opacity-60';
  if (status === 'edited') return 'ring-2 ring-amber-500/40';
  return '';
}

function SectionCard({ id, icon: Icon, iconBg, title, children, reviewStatus, onReview, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`card transition-all duration-200 ${reviewRingClass(reviewStatus)}`}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className={`section-icon ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-100">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {reviewStatus && (
            <span className={`text-xs font-medium capitalize px-2.5 py-1 rounded-full ${
              reviewStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
              reviewStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {reviewStatus}
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="mt-5 space-y-4 animate-fade-in">
          {children}
          <div className="pt-3 border-t border-surface-600">
            <ReviewControls sectionId={id} status={reviewStatus} onStatusChange={onReview} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatusRow({ label, value, status }) {
  const color =
    (status || '').toLowerCase().includes('on track') || (status || '').toLowerCase().includes('good') || (status || '').toLowerCase().includes('active') || (status || '').toLowerCase().includes('adequate') || (status || '').toLowerCase().includes('positive')
      ? 'text-emerald-400'
      : (status || '').toLowerCase().includes('partial') || (status || '').toLowerCase().includes('fair') || (status || '').toLowerCase().includes('moderate') || (status || '').toLowerCase().includes('neutral')
      ? 'text-amber-400'
      : (status || '').toLowerCase().includes('off') || (status || '').toLowerCase().includes('poor') || (status || '').toLowerCase().includes('sedentary') || (status || '').toLowerCase().includes('inadequate') || (status || '').toLowerCase().includes('negative')
      ? 'text-red-400'
      : 'text-gray-400';

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${color}`}>{value || 'Not Mentioned'}</span>
    </div>
  );
}

export default function AnalysisSection({ analysis, reviewStatuses, onReview }) {
  const {
    weekly_summary,
    nutrition_adherence,
    exercise,
    sleep,
    water_intake,
    symptoms,
    stress,
    mood,
    engagement,
    key_barriers,
    pending_actions,
    risk_flags,
    coach_recommendations,
    missing_information,
  } = analysis;

  return (
    <div className="space-y-5">
      {/* Weekly Summary */}
      <SectionCard
        id="weekly_summary"
        icon={BookOpen}
        iconBg="bg-brand-600/20 text-brand-400"
        title="Weekly Summary"
        reviewStatus={reviewStatuses.weekly_summary}
        onReview={onReview}
      >
        <p className="text-sm text-gray-300 leading-relaxed">{weekly_summary || 'Not available.'}</p>
      </SectionCard>

      {/* Nutrition */}
      <SectionCard
        id="nutrition"
        icon={Activity}
        iconBg="bg-emerald-500/20 text-emerald-400"
        title="Nutrition Adherence"
        reviewStatus={reviewStatuses.nutrition}
        onReview={onReview}
      >
        <StatusRow label="Status" value={nutrition_adherence?.status} status={nutrition_adherence?.status} />
        <ConfidenceBadge value={nutrition_adherence?.confidence} />
        <EvidenceList evidence={nutrition_adherence?.evidence} />
      </SectionCard>

      {/* Exercise */}
      <SectionCard
        id="exercise"
        icon={Zap}
        iconBg="bg-amber-500/20 text-amber-400"
        title="Exercise & Activity"
        reviewStatus={reviewStatuses.exercise}
        onReview={onReview}
      >
        <StatusRow label="Status" value={exercise?.status} status={exercise?.status} />
        <StatusRow label="Daily Steps" value={exercise?.steps} />
        <EvidenceList evidence={exercise?.evidence} />
      </SectionCard>

      {/* Sleep */}
      <SectionCard
        id="sleep"
        icon={Moon}
        iconBg="bg-indigo-500/20 text-indigo-400"
        title="Sleep"
        reviewStatus={reviewStatuses.sleep}
        onReview={onReview}
      >
        <StatusRow label="Status" value={sleep?.status} status={sleep?.status} />
        <StatusRow label="Average" value={sleep?.average} />
        <EvidenceList evidence={sleep?.evidence} />
      </SectionCard>

      {/* Water */}
      <SectionCard
        id="water"
        icon={Droplets}
        iconBg="bg-cyan-500/20 text-cyan-400"
        title="Water Intake"
        reviewStatus={reviewStatuses.water}
        onReview={onReview}
      >
        <StatusRow label="Status" value={water_intake?.status} status={water_intake?.status} />
        <StatusRow label="Average Daily" value={water_intake?.average} />
        <EvidenceList evidence={water_intake?.evidence} />
      </SectionCard>

      {/* Stress */}
      <SectionCard
        id="stress"
        icon={Brain}
        iconBg="bg-purple-500/20 text-purple-400"
        title="Stress"
        reviewStatus={reviewStatuses.stress}
        onReview={onReview}
      >
        <StatusRow label="Level" value={stress?.level} status={stress?.level} />
        <EvidenceList evidence={stress?.evidence} />
      </SectionCard>

      {/* Mood */}
      <SectionCard
        id="mood"
        icon={Heart}
        iconBg="bg-pink-500/20 text-pink-400"
        title="Mood"
        reviewStatus={reviewStatuses.mood}
        onReview={onReview}
      >
        <StatusRow label="Overall" value={mood?.overall} status={mood?.overall} />
        <EvidenceList evidence={mood?.evidence} />
      </SectionCard>

      {/* Symptoms */}
      {symptoms && symptoms.length > 0 && (
        <SectionCard
          id="symptoms"
          icon={AlertTriangle}
          iconBg="bg-orange-500/20 text-orange-400"
          title={`Symptoms (${symptoms.length})`}
          reviewStatus={reviewStatuses.symptoms}
          onReview={onReview}
        >
          <div className="space-y-3">
            {symptoms.map((s, i) => (
              <div key={i} className="bg-surface-700 rounded-xl p-3 border border-surface-600">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-gray-200">{s.symptom}</p>
                  <SourceTag type={s.source_type} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400">
                  <span>Frequency: <span className="text-gray-300">{s.frequency || 'Not Mentioned'}</span></span>
                  <span>Severity: <span className="text-gray-300">{s.severity || 'Not Mentioned'}</span></span>
                </div>
                {s.evidence && <p className="text-xs text-gray-400 italic mt-2">"{s.evidence}"</p>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Risk Flags */}
      <SectionCard
        id="risk_flags"
        icon={AlertTriangle}
        iconBg="bg-red-500/20 text-red-400"
        title={`Risk Flags ${risk_flags?.length ? `(${risk_flags.length})` : ''}`}
        reviewStatus={reviewStatuses.risk_flags}
        onReview={onReview}
      >
        <RiskBadges riskFlags={risk_flags} />
      </SectionCard>

      {/* Engagement */}
      <SectionCard
        id="engagement"
        icon={Users}
        iconBg="bg-teal-500/20 text-teal-400"
        title="Client Engagement"
        reviewStatus={reviewStatuses.engagement}
        onReview={onReview}
        defaultOpen={false}
      >
        <StatusRow label="Level" value={engagement?.level} status={engagement?.level} />
        {engagement?.reason && (
          <p className="text-sm text-gray-400 italic">"{engagement.reason}"</p>
        )}
      </SectionCard>

      {/* Key Barriers */}
      <SectionCard
        id="key_barriers"
        icon={Target}
        iconBg="bg-rose-500/20 text-rose-400"
        title={`Key Barriers ${key_barriers?.length ? `(${key_barriers.length})` : ''}`}
        reviewStatus={reviewStatuses.key_barriers}
        onReview={onReview}
        defaultOpen={false}
      >
        {key_barriers?.length ? (
          <div className="space-y-2">
            {key_barriers.map((b, i) => (
              <div key={i} className="bg-surface-700 rounded-lg p-3 border border-surface-600">
                <div className="flex items-start gap-2">
                  <SourceTag type={b.source_type} />
                  <p className="text-sm text-gray-300">{b.barrier}</p>
                </div>
                {b.evidence && <p className="text-xs text-gray-400 italic mt-1.5">"{b.evidence}"</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No barriers identified.</p>
        )}
      </SectionCard>

      {/* Pending Actions */}
      <SectionCard
        id="pending_actions"
        icon={ListChecks}
        iconBg="bg-sky-500/20 text-sky-400"
        title={`Pending Actions ${pending_actions?.length ? `(${pending_actions.length})` : ''}`}
        reviewStatus={reviewStatuses.pending_actions}
        onReview={onReview}
        defaultOpen={false}
      >
        {pending_actions?.length ? (
          <div className="space-y-2">
            {pending_actions.map((a, i) => (
              <div key={i} className="flex items-start gap-3 bg-surface-700 rounded-lg p-3 border border-surface-600">
                <span className={`text-xs font-bold px-2 py-0.5 rounded mt-0.5 flex-shrink-0 ${
                  a.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                  a.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>{a.priority}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{a.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Owner: {a.owner}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No pending actions identified.</p>
        )}
      </SectionCard>

      {/* Coach Recommendations */}
      <SectionCard
        id="coach_recommendations"
        icon={Lightbulb}
        iconBg="bg-yellow-500/20 text-yellow-400"
        title={`Coach Recommendations ${coach_recommendations?.length ? `(${coach_recommendations.length})` : ''}`}
        reviewStatus={reviewStatuses.coach_recommendations}
        onReview={onReview}
        defaultOpen={false}
      >
        {coach_recommendations?.length ? (
          <div className="space-y-3">
            {coach_recommendations.map((r, i) => (
              <div key={i} className="bg-surface-700 rounded-xl p-4 border border-surface-600">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-200">{r.recommendation}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                    r.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                    r.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{r.priority}</span>
                </div>
                {r.rationale && (
                  <p className="text-xs text-gray-400 italic">{r.rationale}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No recommendations available.</p>
        )}
      </SectionCard>

      {/* Missing Information */}
      <SectionCard
        id="missing_information"
        icon={Info}
        iconBg="bg-gray-500/20 text-gray-400"
        title={`Missing Information ${missing_information?.length ? `(${missing_information.length})` : ''}`}
        reviewStatus={reviewStatuses.missing_information}
        onReview={onReview}
        defaultOpen={false}
      >
        {missing_information?.length ? (
          <ul className="space-y-2">
            {missing_information.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic">All key areas were covered in the conversation.</p>
        )}
      </SectionCard>
    </div>
  );
}
