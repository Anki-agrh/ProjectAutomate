import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
      <AlertTriangle size={32} className="text-rose-400" />
    </div>
    <h4 className="text-lg font-bold text-rose-400 mb-1">Connection Lost</h4>
    <p className="text-sm text-slate-500 mb-6 max-w-sm">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-ghost px-5 py-2.5 text-sm">
        <RefreshCw size={16} />
        Retry
      </button>
    )}
  </div>
);

export default ErrorState;
