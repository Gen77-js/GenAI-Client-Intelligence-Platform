import React from 'react';
import { CheckCircle2, X, Pencil, RotateCcw } from 'lucide-react';

export default function ReviewControls({ sectionId, status, onStatusChange }) {
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isEdited = status === 'edited';

  const handleClick = (newStatus) => {
    if (status === newStatus) {
      onStatusChange(sectionId, null); // toggle off
    } else {
      onStatusChange(sectionId, newStatus);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 font-medium mr-1">Review:</span>

      <button
        className={`btn-approve ${isApproved ? 'opacity-100 ring-1 ring-emerald-500/50' : 'opacity-60 hover:opacity-100'}`}
        onClick={() => handleClick('approved')}
        aria-label="Approve this section"
        title="Approve"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Approve
      </button>

      <button
        className={`btn-edit ${isEdited ? 'opacity-100 ring-1 ring-amber-500/50' : 'opacity-60 hover:opacity-100'}`}
        onClick={() => handleClick('edited')}
        aria-label="Mark as edited"
        title="Mark Edited"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>

      <button
        className={`btn-reject ${isRejected ? 'opacity-100 ring-1 ring-red-500/50' : 'opacity-60 hover:opacity-100'}`}
        onClick={() => handleClick('rejected')}
        aria-label="Reject this section"
        title="Reject"
      >
        <X className="w-3.5 h-3.5" />
        Reject
      </button>

      {status && (
        <button
          className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
          onClick={() => onStatusChange(sectionId, null)}
          title="Clear review"
        >
          <RotateCcw className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
