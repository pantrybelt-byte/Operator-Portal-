import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Clock,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  
  HelpCircle, ShieldCheck,
} from 'lucide-react';
import type { PantryInfo } from '../../types';


interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pantry: PantryInfo;
  onSignOut: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  pantry,
  onSignOut,
  mobileOpen,
  onCloseMobile,
}) => {
  const mainNav = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Shift mode', path: '/shift', icon: Zap, badge: 'Live' },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Operating hours', path: '/hours', icon: Clock },
  ];

  const communicationNav = [
    { label: 'Broadcasts', path: '/notifications', icon: Bell },
  ];

  const settingsNav = [
    { label: 'Pantry profile', path: '/profile', icon: Building2 },
    { label: 'Free Services ($0)', path: '/billing', icon: ShieldCheck, badge: '$0 Free' },
  ];

  const helpNav = [
    { label: 'Onboarding Guide', path: '/onboarding', icon: HelpCircle, ShieldCheck, badge: 'New' },
  ];

  const linkClasses = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all relative
    ${isActive
      ? 'bg-[#0071e3] text-white shadow-xs'
      : 'text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/[0.04]'
    }
  `;

  const renderLink = (item: { label: string; path: string; icon: React.ElementType; badge?: string }) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={onCloseMobile}
      className={linkClasses}
    >
      <item.icon className="w-[18px] h-[18px] shrink-0 opacity-90" />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
      {!isCollapsed && item.badge && (
        <span className="ml-auto text-[10px] font-semibold bg-[#34c759] text-white px-1.5 py-0.2 rounded-full">
          {item.badge}
        </span>
      )}
    </NavLink>
  );

  const sectionLabel = (text: string) =>
    !isCollapsed ? (
      <p className="px-3 pt-5 pb-1 text-[11px] font-semibold text-[#86868b] uppercase tracking-wide">
        {text}
      </p>
    ) : (
      <div className="my-2 mx-3 border-t border-[#e5e5ea]" />
    );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          bg-[#f5f5f7]/80 lg:bg-white border-r border-[#e5e5ea] flex flex-col justify-between
          transition-all duration-200 ease-out
          ${isCollapsed ? 'w-[68px]' : 'w-[240px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Logo & Location Switcher */}
        <div>
          <div className="px-3.5 py-3 border-b border-[#e5e5ea] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-xs border border-[#e5e5ea]">
                  <img src="/accessbelt-official-logo.png" alt="AccessBelt" className="w-full h-full object-cover" />
                </div>
                {!isCollapsed && (
                  <span className="font-bold text-[15px] text-[#1d1d1f] tracking-tight">AccessBelt</span>
                )}
              </div>

              {/* Desktop Collapse Toggle */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Location Selector Pill */}
            {!isCollapsed && pantry.locations && pantry.locations.length > 0 && (
              <div className="pt-0.5">
                <select
                  value={pantry.id}
                  onChange={(e) => {
                    const selected = pantry.locations.find(l => l.id === e.target.value);
                    if (selected) {
                      alert(`Switched active location to: ${selected.name}`);
                    }
                  }}
                  className="w-full text-[11px] font-semibold py-1.5 px-2 rounded-lg border border-[#e5e5ea] bg-[#f5f5f7] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] cursor-pointer truncate"
                >
                  {pantry.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      📍 {loc.name} ({loc.type})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-2 mt-3 space-y-0.5">
            {/* Main */}
            {mainNav.map(renderLink)}

            {/* Communication */}
            {sectionLabel('Communication')}
            {communicationNav.map(renderLink)}

            {/* Settings */}
            {sectionLabel('Settings')}
            {settingsNav.map(renderLink)}

            {/* Help & Resources */}
            {sectionLabel('Help & Resources')}
            {helpNav.map(renderLink)}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-2 border-t border-[#e5e5ea]">
          <button
            onClick={onSignOut}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium
              text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title="Sign out"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
