import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings, Zap, WifiOff, ShieldCheck } from 'lucide-react';
import type { PantryInfo, Operator } from '../../types';
import { Link } from 'react-router-dom';

interface HeaderProps {
  pantry: PantryInfo;
  operator: Operator;
  onOpenLiveStatusModal: () => void;
  onNavigateToSettings: () => void;
  onSignOut: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pantry,
  operator,
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
      {/* Offline Connectivity Warning Banner */}
      {!isOnline && (
        <div className="bg-[#ff9500] text-white text-[12px] font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Working Offline — Local edits will sync automatically when network reconnects</span>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e5e5ea] px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Left: Mobile Nav Toggle & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Status indicator — Apple HIG pill */}
          <button
            onClick={onOpenLiveStatusModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e5ea] hover:border-[#d2d2d7] transition-colors cursor-pointer bg-white"
          >
            <span className={`w-2 h-2 rounded-full ${pantry.isOpen ? 'bg-[#34c759]' : 'bg-[#ff3b30]'}`} />
            <span className="text-[13px] font-medium text-[#1d1d1f]">
              {pantry.isOpen ? 'Open' : 'Closed'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#86868b]" />
          </button>

          {/* Auto-Close Info Badge */}
          {pantry.autoCloseEnabled && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[#86868b] bg-[#f5f5f7] border border-[#e5e5ea] px-2.5 py-1 rounded-md">
              Auto-closes at {pantry.autoCloseTime}
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Verification Badge */}
          <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold text-[#34c759] bg-[#34c759]/10 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            {pantry.verificationStatus}
          </span>

          {/* Shift Mode Quick Action Button */}
          <Link
            to="/shift"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0071e3] text-white text-[12px] font-semibold hover:bg-[#0077ed] transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Shift Mode</span>
          </Link>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-xl text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#0071e3] rounded-full" />
          </button>

          <div className="h-4 w-px bg-[#e5e5ea] mx-1 hidden sm:block" />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-xl hover:bg-black/[0.04] transition-colors text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e5e5ea] shrink-0 flex items-center justify-center border border-black/5">
                {operator.avatarUrl ? (
                  <img src={operator.avatarUrl} alt={operator.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#86868b]" />
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-semibold text-[#1d1d1f] leading-tight">{operator.name}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868b] hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl border border-[#e5e5ea] shadow-xl z-50 py-1.5">
                <div className="px-3 py-2 border-b border-[#e5e5ea]">
                  <p className="text-[13px] font-semibold text-[#1d1d1f]">{operator.name}</p>
                  <p className="text-[11px] text-[#86868b] truncate">{operator.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigateToSettings();
                    }}
                    className="w-full text-left px-3 py-2 text-[13px] text-[#1d1d1f] hover:bg-black/[0.04] flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#86868b]" />
                    Pantry settings
                  </button>
                </div>

                <div className="border-t border-[#e5e5ea] pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3 py-2 text-[13px] text-[#ff3b30] hover:bg-[#ff3b30]/10 flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
