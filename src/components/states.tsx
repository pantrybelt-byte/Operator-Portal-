/**
 * Loading, empty and error states.
 *
 * Every read can be slow and every write can fail once a network is
 * involved. These are the three states the portal previously had no way to
 * express, because mock state resolved synchronously.
 */
import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-sunken ${className}`} aria-hidden="true" />
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-label="Loading">
    <div className="space-y-2">
      <Skeleton className="h-7 w-64" />
      <Skeleton className="h-4 w-80" />
    </div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Skeleton className="h-64 lg:col-span-2" />
      <Skeleton className="h-64" />
    </div>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
    <Inbox className="h-6 w-6 text-fg-muted" aria-hidden="true" />
    <p className="text-sm font-semibold text-fg">{title}</p>
    {description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Something went wrong', message, onRetry }) => (
  <div
    role="alert"
    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface px-6 py-12 text-center"
  >
    <AlertTriangle className="h-6 w-6 text-danger-text" aria-hidden="true" />
    <div>
      <p className="text-sm font-semibold text-fg">{title}</p>
      <p className="mt-1 max-w-md text-sm text-fg-muted">{message}</p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-secondary">
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    )}
  </div>
);
