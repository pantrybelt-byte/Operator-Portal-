import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { PantryInfo, Operator } from '../../types';
import { X, CheckCircle2, Store } from 'lucide-react';


interface DashboardLayoutProps {
  children: React.ReactNode;
  pantry: PantryInfo;
  operator: Operator;
  onUpdatePantryStatus: (isOpen: boolean, note: string) => void;
  onNavigateToSettings: () => void;
  onSignOut: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pantry,
  operator,
  onUpdatePantryStatus,
  onNavigateToSettings,
  onSignOut,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Status Modal State
  const [pendingIsOpen, setPendingIsOpen] = useState(pantry.isOpen);
  const [statusNote, setStatusNote] = useState(pantry.openNote);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePantryStatus(pendingIsOpen, statusNote);
    setStatusModalOpen(false);
    
    setToastMessage(`Pantry status updated to ${pendingIsOpen ? 'Open' : 'Closed'}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fb] text-[#1a1a2e] relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-[#e8eaed] shadow-lg px-4 py-3 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
          <p className="text-[13px] text-[#1a1a2e]">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#9ca3af] hover:text-[#5f6368] ml-2 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        pantry={pantry}
        onSignOut={onSignOut}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          pantry={pantry}
          operator={operator}
          onOpenLiveStatusModal={() => {
            setPendingIsOpen(pantry.isOpen);
            setStatusNote(pantry.openNote);
            setStatusModalOpen(true);
          }}
          onNavigateToSettings={onNavigateToSettings}
          onSignOut={onSignOut}
          onToggleSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-5 sm:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Status Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#e8eaed]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#4263eb]/8 text-[#4263eb] flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1a1a2e]">Update pantry status</h3>
                  <p className="text-[13px] text-[#9ca3af]">This updates your listing on the AccessBelt app</p>
                </div>
              </div>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="p-1 rounded-md text-[#9ca3af] hover:text-[#5f6368] hover:bg-[#f1f3f5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              {/* Status Radio Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPendingIsOpen(true)}
                  className={`
                    p-4 rounded-lg border text-center transition-colors flex flex-col items-center gap-2 cursor-pointer
                    ${pendingIsOpen
                      ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]'
                      : 'border-[#e8eaed] hover:border-[#d0d5dd] text-[#5f6368]'
                    }
                  `}
                >
                  <span className="w-3 h-3 rounded-full bg-[#16a34a]" />
                  <span className="text-[13px] font-semibold text-[#1a1a2e]">Open</span>
                  <span className="text-[12px] text-[#9ca3af]">Visible to users</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingIsOpen(false)}
                  className={`
                    p-4 rounded-lg border text-center transition-colors flex flex-col items-center gap-2 cursor-pointer
                    ${!pendingIsOpen
                      ? 'border-[#dc2626] bg-[#fef2f2] text-[#dc2626]'
                      : 'border-[#e8eaed] hover:border-[#d0d5dd] text-[#5f6368]'
                    }
                  `}
                >
                  <span className="w-3 h-3 rounded-full bg-[#dc2626]" />
                  <span className="text-[13px] font-semibold text-[#1a1a2e]">Closed</span>
                  <span className="text-[12px] text-[#9ca3af]">Hidden from users</span>
                </button>
              </div>

              {/* Status Note */}
              <div>
                <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">
                  Status message <span className="text-[#9ca3af] font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Walk-ins welcome until 4:00 PM"
                  className="w-full text-[13px] p-3 rounded-lg border border-[#e8eaed] focus:outline-none focus:border-[#4263eb] focus:ring-1 focus:ring-[#4263eb]/20 bg-white placeholder:text-[#c4c9d4]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#5f6368] hover:text-[#1a1a2e] rounded-lg hover:bg-[#f1f3f5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-[13px] font-medium bg-[#4263eb] text-white rounded-lg hover:bg-[#3b5bdb] transition-colors cursor-pointer"
                >
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
