import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, CloudUpload } from 'lucide-react';
import { uploadFile } from '../api/client';

const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const ACCEPTED_EXT = ['.pdf', '.docx', '.txt'];
const MAX_SIZE = 20 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ onUploadComplete }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFile = useCallback(async (file) => {
    setError('');
    setUploadedFile(null);

    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) {
      setError(`Unsupported file type. Please upload PDF, DOCX, or TXT.`);
      return;
    }

    if (file.size > MAX_SIZE) {
      setError(`File too large. Maximum size is 20MB (your file: ${formatSize(file.size)}).`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadFile(file, setProgress);
      setUploadedFile({ ...result, size: file.size });
      onUploadComplete(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onInputChange = (e) => handleFile(e.target.files[0]);

  const reset = () => {
    setUploadedFile(null);
    setError('');
    setProgress(0);
    onUploadComplete(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!uploadedFile ? (
        <div
          className={`upload-zone card-glow border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-400 bg-brand-900/20 drag-over'
              : 'border-surface-500 hover:border-brand-500 hover:bg-surface-700/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-input').click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-input').click()}
          aria-label="Upload conversation file"
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={onInputChange}
          />

          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              dragOver ? 'bg-brand-500/30' : 'bg-surface-700'
            }`}>
              <CloudUpload className={`w-8 h-8 ${dragOver ? 'text-brand-400' : 'text-gray-400'}`} />
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-100 mb-1">
                {dragOver ? 'Drop your file here' : 'Upload Conversation File'}
              </p>
              <p className="text-sm text-gray-400">
                Drag & drop or click to browse
              </p>
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              {['PDF', 'DOCX', 'TXT'].map((type) => (
                <span key={type} className="px-3 py-1 bg-surface-700 rounded-full text-xs text-gray-300 font-medium border border-surface-500">
                  {type}
                </span>
              ))}
            </div>

            <p className="text-xs text-gray-500">Maximum file size: 20MB</p>
          </div>
        </div>
      ) : (
        <div className="card-glow animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-100 text-sm">{uploadedFile.filename}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatSize(uploadedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="w-8 h-8 rounded-lg bg-surface-600 hover:bg-surface-500 flex items-center justify-center transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Pages', value: uploadedFile.pages },
              { label: 'Characters', value: uploadedFile.characters.toLocaleString() },
              { label: 'Words', value: uploadedFile.word_count.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-700 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-brand-400">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>File uploaded successfully — ready for analysis</span>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="mt-4 card animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="spinner" />
            <span className="text-sm text-gray-300">Uploading and extracting text...</span>
            <span className="ml-auto text-sm font-semibold text-brand-400">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill bg-gradient-to-r from-brand-600 to-brand-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
