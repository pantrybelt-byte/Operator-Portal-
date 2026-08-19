/**
 * Top-level error boundary.
 *
 * Without one, a render error anywhere unmounts the whole tree and the
 * operator sees a blank white page — mid-shift, with a queue outside. React
 * warns about this in the console; this is the answer to that warning.
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[operator-portal] unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="card max-w-md p-6 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-danger-text" aria-hidden="true" />
          <h1 className="card-title mt-3">This page stopped responding</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Your pantry status has not changed. Reload to continue, and if it keeps happening let
            the AccessBelt team know what you were doing.
          </p>
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
            Reload the portal
          </button>
        </div>
      </div>
    );
  }
}
