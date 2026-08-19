import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut, Settings, Radio, WifiOff, Menu, Loader2 } from 'lucide-react';
import type { PantryInfo, Operator } from '../../types';
import { Link } from 'react-router-dom';

interface HeaderProps {
  pantry: PantryInfo;
  operator: Operator;
  pending: number;
  onOpenLiveStatusModal: () => void;
  onNavigateToSettings: () => void;
  onSignOut: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pantry,
  operator,
  pending,
  onOpenLiveStatusModal,
  onNavigateToSettings,
  onSignOut,
  onToggleSidebar,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-warn-tint px-4 py-2 text-center text-xs font-medium text-warn-text">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Working offline — changes will sync when the connection returns</span>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="-ml-1 rounded-lg p-2 text-fg-muted transition-colors hover:bg-sunken hover:text-fg lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Current status — the primary control in the portal */}
          <button
            onClick={onOpenLiveStatusModal}
            className="flex min-h-[36px] items-center gap-2 rounded-lg border border-line bg-surface px-3 transition-colors hover:border-line-strong"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${pantry.isOpen ? 'bg-success' : 'bg-danger'}`}
            />
            <span className="text-sm font-semibold text-fg">
              {pantry.isOpen ? 'Open' : 'Closed'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-fg-muted" />
          </button>

          {pending > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-fg-muted" role="status">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="hidden sm:inline">Saving…</span>
            </span>
          )}

          {pantry.autoCloseEnabled && (
            <span className="hidden truncate text-xs text-fg-muted md:inline">
              Closes automatically at {pantry.autoCloseTime}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Reachable on phones — this is where shift mode is actually used */}
          <Link
            to="/shift"
            className="btn btn-primary"
            aria-label="Open shift mode"
          >
            <Radio className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Shift mode</span>
          </Link>

          <div className="mx-1 hidden h-5 w-px bg-line sm:block" />

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-lg p-1 text-left transition-colors hover:bg-sunken sm:pr-2.5"
              aria-expanded={showProfileMenu}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-sunken">
                {operator.avatarUrl ? (
                  <img src={operator.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-fg-muted" />
                )}
              </span>
              <span className="hidden text-sm font-semibold leading-tight text-fg sm:block">
                {operator.name}
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-fg-muted sm:block" />
            </button>

            {showProfileMenu && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg"
              >
                <div className="border-b border-line px-3 py-2.5">
                  <p className="text-sm font-semibold text-fg">{operator.name}</p>
                  <p className="truncate text-xs text-fg-muted">{operator.title}</p>
                  <p className="truncate text-xs text-fg-muted">{operator.email}</p>
                </div>

                <button
                  role="menuitem"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateToSettings();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-fg transition-colors hover:bg-sunken"
                >
                  <Settings className="h-4 w-4 text-fg-muted" />
                  Pantry settings
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSignOut();
                  }}
                  className="flex w-full items-center gap-2.5 border-t border-line px-3 py-2.5 text-left text-sm font-medium text-fg-muted transition-colors hover:bg-sunken hover:text-fg"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
