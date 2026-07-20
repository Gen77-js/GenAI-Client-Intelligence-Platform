import React, { useState, useEffect } from 'react';
import { Brain, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { checkHealth, analyzeConversation } from './api/client';

export default function App() {
  const [uploadData, setUploadData] = useState(null);   // from /upload
  const [analysis, setAnalysis] = useState(null);       // from /analyze
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [backendStatus, setBackendStatus] = useState(null); // null | { status, groq_configured }

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(setBackendStatus)
      .catch(() => setBackendStatus({ status: 'error', groq_configured: false }));
  }, []);

  const handleUploadComplete = (data) => {
    setUploadData(data);
    setAnalysis(null);
    setAnalyzeError('');
  };

  const handleAnalyze = async () => {
    if (!uploadData?.session_id) return;
    setAnalyzing(true);
    setAnalyzeError('');
    setAnalysis(null);

    try {
      const result = await analyzeConversation(uploadData.session_id);
      setAnalysis(result.analysis);
    } catch (err) {
      setAnalyzeError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-surface-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-100 leading-tight">
                GenAI Client Intelligence
              </h1>
              <p className="text-xs text-gray-500">Powered by Groq</p>
            </div>
          </div>

          {/* Backend status indicator */}
          <div className="flex items-center gap-2">
            {backendStatus === null ? (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Connecting...
              </div>
            ) : backendStatus.status === 'ok' && backendStatus.groq_configured ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Groq Connected
              </div>
            ) : backendStatus.status === 'ok' && !backendStatus.groq_configured ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                API Key Missing
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Backend Offline
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* API Key warning */}
        {backendStatus?.status === 'ok' && !backendStatus?.groq_configured && (
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Groq API Key not configured</p>
              <p className="text-xs text-amber-400/80 mt-1">
                Add your key to <code className="bg-surface-700 px-1 py-0.5 rounded text-amber-300">backend/.env</code>:
                {' '}<code className="bg-surface-700 px-1 py-0.5 rounded text-amber-300">GROQ_API_KEY=your_key_here</code>
              </p>
            </div>
          </div>
        )}

        {/* Hero / Upload Section */}
        <section>
          {!uploadData && !analysis && (
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span className="text-sm text-brand-300 font-medium">AI-Powered Health Coaching Intelligence</span>
              </div>
              <h2 className="text-4xl font-extrabold text-gray-100 mb-4 leading-tight">
                Upload a Conversation,<br />
                <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                  Get Instant AI Insights
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Upload your client-coach conversation (PDF, DOCX, or TXT) and Groq will analyze it for wellness insights, risk flags, and actionable recommendations.
              </p>
            </div>
          )}

          <FileUpload onUploadComplete={handleUploadComplete} />

          {/* Analyze button */}
          {uploadData && !analysis && (
            <div className="flex flex-col items-center mt-8 gap-4">
              <button
                className="btn-primary text-base px-8 py-4"
                onClick={handleAnalyze}
                disabled={analyzing}
                id="analyze-btn"
                aria-label="Analyze conversation with Groq AI"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with Groq AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Conversation
                  </>
                )}
              </button>

              {analyzing && (
                <p className="text-sm text-gray-400 animate-pulse">
                  Sending conversation to Groq · This may take 15–30 seconds
                </p>
              )}

              {analyzeError && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 max-w-lg w-full animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{analyzeError}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Empty state — no file uploaded */}
        {!uploadData && !analysis && (
          <div className="text-center py-10 text-gray-500">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-gray-600" />
            </div>
            <p className="font-medium text-gray-400">No conversation uploaded</p>
            <p className="text-sm mt-1">Upload a file above to begin AI analysis</p>
          </div>
        )}

        {/* Dashboard */}
        {analysis && (
          <section>
            <Dashboard analysis={analysis} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-600 mt-20 py-6 text-center text-xs text-gray-600">
        GenAI Client Intelligence Platform · Powered by Groq · Evidence-grounded, hallucination-controlled AI analysis
      </footer>
    </div>
  );
}
