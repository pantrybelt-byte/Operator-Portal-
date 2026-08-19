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
  Radio,
  BookOpen,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { PantryInfo } from '../../types';

interface SidebarProps {
  mode: 'Demo Data' | 'Firestore Live';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pantry: PantryInfo;
  onSignOut: () => void;
  onSwitchLocation: (locationId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mode,
  isCollapsed,
  onToggleCollapse,
  pantry,
  onSignOut,
  onSwitchLocation,
  mobileOpen,
  onCloseMobile,
}) => {
  const sections: { heading?: string; items: NavItem[] }[] = [
    {
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Shift mode', path: '/shift', icon: Radio },
        { label: 'Inventory', path: '/inventory', icon: Package },
        { label: 'Operating hours', path: '/hours', icon: Clock },
      ],
    },
    {
      heading: 'Communication',
      items: [{ label: 'Broadcasts', path: '/notifications', icon: Bell }],
    },
    {
      heading: 'Settings',
      items: [
        { label: 'Pantry profile', path: '/profile', icon: Building2 },
        { label: 'Team & access', path: '/team', icon: Users },
      ],
    },
    {
      heading: 'Support',
      items: [{ label: 'Getting started', path: '/onboarding', icon: BookOpen }],
    },
  ];

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors',
      // Comfortable touch target — volunteers use this on phones mid-shift
      'min-h-[40px]',
      isCollapsed ? 'justify-center px-0' : '',
      isActive
        ? 'bg-accent text-white'
        : 'text-fg hover:bg-sunken',
    ].join(' ');

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/25 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-line bg-surface
          transition-transform duration-200 ease-out lg:static lg:translate-x-0
          ${isCollapsed ? 'w-[72px]' : 'w-[248px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand + location */}
        <div className="border-b border-line px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src="/accessbelt-official-logo.png"
                alt=""
                className="h-8 w-8 shrink-0 rounded-full border border-line object-cover"
              />
              {!isCollapsed && (
                <span className="truncate text-lg font-semibold tracking-tight text-fg">
                  AccessBelt
                </span>
              )}
            </div>

            <button
              onClick={onToggleCollapse}
              className="hidden rounded-md p-1 text-fg-muted transition-colors hover:bg-sunken hover:text-fg lg:block"
              aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {!isCollapsed && pantry.locations?.length > 0 && (
            <div className="mt-2.5">
              <label htmlFor="location-switcher" className="sr-only">
                Active location
              </label>
              <select
                id="location-switcher"
                value={pantry.id}
                onChange={(e) => onSwitchLocation(e.target.value)}
                className="w-full cursor-pointer truncate bg-sunken px-2.5 py-2 text-xs font-medium"
              >
                {pantry.locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} — {loc.kind}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {sections.map((section, i) => (
            <div key={section.heading ?? i} className={i === 0 ? '' : 'mt-5'}>
              {section.heading &&
                (isCollapsed ? (
                  <div className="mx-2 mb-2 border-t border-line" />
                ) : (
                  <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                    {section.heading}
                  </p>
                ))}

              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={linkClasses}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: verification + sign out */}
        <div className="border-t border-line p-3">
          {!isCollapsed && (
            <div className="mb-2 rounded-lg bg-sunken px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck
                  className={`h-3.5 w-3.5 shrink-0 ${pantry.verified ? 'text-success-text' : 'text-fg-muted'}`}
                />
                <span
                  className={`text-xs font-semibold ${pantry.verified ? 'text-success-text' : 'text-fg-muted'}`}
                >
                  {pantry.verified ? 'Verified 501(c)(3)' : 'Verification pending'}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-fg-muted">
                {pantry.verified ? `Verified by ${pantry.verifiedBy}` : 'Awaiting review'}
              </p>
              {mode === 'Demo Data' && (
                <p className="mt-2 border-t border-line pt-2 text-xs text-fg-muted">
                  Demonstration data — changes are not saved.
                </p>
              )}
            </div>
          )}

          <button
            onClick={onSignOut}
            className={`flex min-h-[40px] w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-fg-muted transition-colors hover:bg-sunken hover:text-fg ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title={isCollapsed ? 'Sign out' : undefined}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
