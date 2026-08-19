import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { PantryInfo } from '../../types';
import type { Operator } from '../../types';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pantry: PantryInfo;
  operator: Operator;
  /** Which data source is live, surfaced so demo data is never mistaken for real. */
  mode: 'Demo Data' | 'Firestore Live';
  /** Number of writes in flight. */
  pending: number;
  /** Set when a write was rejected and the UI has been rolled back. */
  writeError: string | null;
  onDismissWriteError: () => void;
  onUpdatePantryStatus: (isOpen: boolean, note: string) => void;
  onNavigateToSettings: () => void;
  onSignOut: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pantry,
  operator,
  mode,
  pending,
  writeError,
  onDismissWriteError,
  onUpdatePantryStatus,
  onNavigateToSettings,
  onSignOut,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [pendingIsOpen, setPendingIsOpen] = useState(pantry.isOpen);
  const [statusNote, setStatusNote] = useState(pantry.openNote);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePantryStatus(pendingIsOpen, statusNote);
    setStatusModalOpen(false);
    showToast(`Status set to ${pendingIsOpen ? 'open' : 'closed'}`);
  };

  const handleSwitchLocation = (locationId: string) => {
    const selected = pantry.locations.find((l) => l.id === locationId);
    if (selected) showToast(`Now managing ${selected.name}`);
  };

  return (
    <div className="relative flex min-h-screen bg-canvas text-fg">
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-lg"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success-text" />
          <p className="text-sm text-fg">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded-md p-0.5 text-fg-muted transition-colors hover:text-fg"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Sidebar
        mode={mode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        pantry={pantry}
        onSignOut={onSignOut}
        onSwitchLocation={handleSwitchLocation}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header
          pantry={pantry}
          operator={operator}
          pending={pending}
          onOpenLiveStatusModal={() => {
            setPendingIsOpen(pantry.isOpen);
            setStatusNote(pantry.openNote);
            setStatusModalOpen(true);
          }}
          onNavigateToSettings={onNavigateToSettings}
          onSignOut={onSignOut}
          onToggleSidebar={() => setMobileSidebarOpen(true)}
        />

        {writeError && (
          <div
            role="alert"
            className="mx-auto flex w-full max-w-[1180px] items-start gap-3 px-4 pt-4 sm:px-6 lg:px-8"
          >
            <div className="flex w-full items-start gap-3 rounded-xl border border-danger/30 bg-danger-tint p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger-text" />
              <p className="flex-1 text-sm text-danger-text">{writeError}</p>
              <button
                onClick={onDismissWriteError}
                className="rounded-md p-0.5 text-danger-text/80 transition-colors hover:text-danger-text"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Single content measure for every page */}
        <main className="mx-auto w-full max-w-[1180px] flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {statusModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setStatusModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="status-modal-title" className="card-title">
                  Update pantry status
                </h2>
                <p className="mt-0.5 text-sm text-fg-muted">
                  This changes how your pantry appears in the AccessBelt app
                </p>
              </div>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="-mr-1 -mt-1 rounded-md p-1 text-fg-muted transition-colors hover:bg-sunken hover:text-fg"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPendingIsOpen(true)}
                  aria-pressed={pendingIsOpen}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-colors ${
                    pendingIsOpen
                      ? 'border-success bg-success-tint'
                      : 'border-line hover:border-line-strong'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-success" />
                  <span className="text-sm font-semibold text-fg">Open</span>
                  <span className="text-xs text-fg-muted">Shown as open</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingIsOpen(false)}
                  aria-pressed={!pendingIsOpen}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-colors ${
                    !pendingIsOpen
                      ? 'border-danger bg-danger-tint'
                      : 'border-line hover:border-line-strong'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                  <span className="text-sm font-semibold text-fg">Closed</span>
                  <span className="text-xs text-fg-muted">Shown as closed</span>
                </button>
              </div>

              <div>
                <label htmlFor="status-note" className="field-label">
                  Status message <span className="font-normal text-fg-muted">(optional)</span>
                </label>
                <textarea
                  id="status-note"
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Walk-ins welcome until 4:00 PM"
                  className="w-full p-3"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setStatusModalOpen(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
