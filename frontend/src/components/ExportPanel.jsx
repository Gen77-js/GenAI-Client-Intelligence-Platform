import React from 'react';
import { Download, FileJson, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

function downloadJson(analysis, reviewStatuses) {
  const exportData = {
    exported_at: new Date().toISOString(),
    platform: 'GenAI Client Intelligence Platform',
    review_statuses: reviewStatuses,
    analysis,
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analysis_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPdf(analysis, reviewStatuses) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 18;
  const pageW = doc.internal.pageSize.getWidth();
  let y = margin;

  // Header
  doc.setFillColor(15, 15, 26);
  doc.rect(0, 0, pageW, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GenAI Client Intelligence Report', margin, 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 180);
  doc.text(new Date().toLocaleString(), pageW - margin, 13, { align: 'right' });

  y = 28;
  doc.setTextColor(30, 30, 50);

  const addSection = (title, content) => {
    if (y > 265) { doc.addPage(); y = margin; }
    doc.setFillColor(240, 240, 255);
    doc.rect(margin - 2, y - 4, pageW - (margin * 2) + 4, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 150);
    doc.text(title, margin, y + 1);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 80);
    const lines = doc.splitTextToSize(content, pageW - margin * 2);
    lines.forEach((line) => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 5;
    });
    y += 4;
  };

  addSection('Weekly Summary', analysis.weekly_summary || 'Not available');
  addSection('Overall Wellness Score', `${analysis.overall_wellness_score || 'N/A'} (Confidence: ${Math.round((parseFloat(analysis.confidence) || 0) * 100)}%)`);
  addSection('Nutrition Adherence', `Status: ${analysis.nutrition_adherence?.status || 'Not Mentioned'}`);
  addSection('Sleep', `Status: ${analysis.sleep?.status || 'Not Mentioned'} | Average: ${analysis.sleep?.average || 'Not Mentioned'}`);
  addSection('Exercise', `Status: ${analysis.exercise?.status || 'Not Mentioned'} | Steps: ${analysis.exercise?.steps || 'Not Mentioned'}`);
  addSection('Water Intake', `Status: ${analysis.water_intake?.status || 'Not Mentioned'} | Average: ${analysis.water_intake?.average || 'Not Mentioned'}`);
  addSection('Stress Level', analysis.stress?.level || 'Not Mentioned');
  addSection('Mood', analysis.mood?.overall || 'Not Mentioned');
  addSection('Engagement', `Level: ${analysis.engagement?.level || 'Not Mentioned'} | ${analysis.engagement?.reason || ''}`);

  if (analysis.risk_flags?.length) {
    addSection('Risk Flags', analysis.risk_flags.map(r => `[${r.severity}] ${r.flag}`).join('\n'));
  }
  if (analysis.key_barriers?.length) {
    addSection('Key Barriers', analysis.key_barriers.map(b => `• ${b.barrier}`).join('\n'));
  }
  if (analysis.pending_actions?.length) {
    addSection('Pending Actions', analysis.pending_actions.map(a => `• [${a.priority}] ${a.action} (${a.owner})`).join('\n'));
  }
  if (analysis.coach_recommendations?.length) {
    addSection('Coach Recommendations', analysis.coach_recommendations.map(r => `• [${r.priority}] ${r.recommendation}`).join('\n'));
  }
  if (analysis.missing_information?.length) {
    addSection('Missing Information', analysis.missing_information.join('\n'));
  }

  // Review summary
  const reviewSummary = Object.entries(reviewStatuses)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
  if (reviewSummary) {
    addSection('Human Review Status', reviewSummary);
  }

  doc.save(`analysis_report_${Date.now()}.pdf`);
}

export default function ExportPanel({ analysis, reviewStatuses }) {
  if (!analysis) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm text-gray-400 font-medium">Export:</span>
      <button
        className="btn-secondary text-sm"
        onClick={() => downloadJson(analysis, reviewStatuses)}
        id="export-json-btn"
        aria-label="Export analysis as JSON"
      >
        <FileJson className="w-4 h-4 text-brand-400" />
        Export JSON
      </button>
      <button
        className="btn-secondary text-sm"
        onClick={() => downloadPdf(analysis, reviewStatuses)}
        id="export-pdf-btn"
        aria-label="Export analysis as PDF"
      >
        <FileText className="w-4 h-4 text-emerald-400" />
        Export PDF
      </button>
    </div>
  );
}
