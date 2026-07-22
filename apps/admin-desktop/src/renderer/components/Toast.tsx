import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  message: { type: 'success' | 'error'; text: string } | null;
}

export function Toast({ message }: Props) {
  if (!message) return null;
  return (
    <div className={`toast ${message.type}`} role="status" aria-live="polite">
      {message.type === 'success'
        ? <CheckCircle size={18} color="#22c55e" aria-hidden />
        : <AlertTriangle size={18} color="#ef4444" aria-hidden />}
      <span>{message.text}</span>
    </div>
  );
}
