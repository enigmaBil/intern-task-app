'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Erreur</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 rounded bg-red-100 px-3 py-1 text-sm text-red-800 hover:bg-red-200"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
