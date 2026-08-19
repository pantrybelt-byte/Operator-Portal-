import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  Bell,
  Building2,
  ChevronRight,
  BookOpen,
  Printer,
  X,
  Radio,
  CalendarDays,
  Megaphone,
  Users,
} from 'lucide-react';
import type { PantryInfo, InventoryItem, ActivityItem, Operator } from '../types';
import { stockStatus } from '../types';
import { formatRelative } from '../lib/datetime';
import { Link, useNavigate } from 'react-router-dom';

interface DashboardPageProps {
  pantry: PantryInfo;
  operator: Operator;
  inventory: InventoryItem[];
  activity: ActivityItem[];
  onQuickToggleStatus: () => void;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const activityIcon: Record<ActivityItem['type'], React.ElementType> = {
  status: Radio,
  inventory: Package,
  schedule: CalendarDays,
  announcement: Megaphone,
  profile: Building2,
  location: Building2,
  team: Users,
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  pantry,
  operator,
  inventory,
  activity,
  onQuickToggleStatus,
}) => {
  const navigate = useNavigate();
  const [showGuideBanner, setShowGuideBanner] = useState(true);

  const lowStockItems = inventory.filter((item) => stockStatus(item) !== 'In Stock');
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const quickActions = [
    { label: 'Update stock', path: '/inventory', icon: Package },
    { label: 'Send broadcast', path: '/notifications', icon: Bell },
    { label: 'Set schedule', path: '/hours', icon: Clock },
    { label: 'Edit profile', path: '/profile', icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">
            {greeting()}, {operator.name.split(' ')[0]}
          </h1>
          <p className="page-subtitle">
            {pantry.name} · updated {formatRelative(pantry.updatedAt)}
          </p>
        </div>

        <button onClick={() => window.print()} className="btn btn-secondary no-print">
          <Printer className="h-4 w-4 text-fg-muted" />
          Print summary
        </button>
      </div>

      {showGuideBanner && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-fg-muted" />
            <div>
              <p className="text-sm font-semibold text-fg">New to the operator portal?</p>
              <p className="text-sm text-fg-muted">
                A short guide covers setting your status, running a shift, and sending broadcasts.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            <button onClick={() => navigate('/onboarding')} className="btn btn-secondary">
              Open guide
            </button>
            <button
              onClick={() => setShowGuideBanner(false)}
              className="rounded-md p-1.5 text-fg-muted transition-colors hover:bg-sunken hover:text-fg"
              aria-label="Dismiss guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Key figures — one anatomy: label, value, qualifier */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="card p-4 sm:p-5">
          <p className="text-sm font-medium text-fg-muted">Current status</p>
          <p className="stat-value mt-2 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${pantry.isOpen ? 'bg-success' : 'bg-danger'}`}
            />
            {pantry.isOpen ? 'Open' : 'Closed'}
          </p>
          <button
            onClick={onQuickToggleStatus}
            className="mt-1 text-xs font-semibold text-accent-text hover:underline"
          >
            Switch to {pantry.isOpen ? 'closed' : 'open'}
          </button>
        </div>

        <div className="card p-4 sm:p-5">
          <p className="text-sm font-medium text-fg-muted">Inventory items</p>
          <p className="stat-value mt-2">{inventory.length}</p>
          <p className="meta mt-1">{totalQuantity.toLocaleString()} units in stock</p>
        </div>

        <div className="card p-4 sm:p-5">
          <p className="text-sm font-medium text-fg-muted">Families served</p>
          <p className="stat-value mt-2">{pantry.servedThisWeek.toLocaleString()}</p>
          <p className="meta mt-1">This week</p>
        </div>

        <div className="card p-4 sm:p-5">
          <p className="text-sm font-medium text-fg-muted">Capacity used</p>
          <p className="stat-value mt-2">{pantry.capacityPercentage}%</p>
          <div
            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-sunken"
            role="progressbar"
            aria-valuenow={pantry.capacityPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Capacity used"
          >
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${pantry.capacityPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Quick actions */}
          <section className="card p-5">
            <h2 className="card-title mb-4">Quick actions</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="card-hover flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-line p-3.5 text-center"
                >
                  <action.icon className="h-5 w-5 text-fg-muted" />
                  <span className="text-sm font-semibold text-fg">{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Low stock */}
          {lowStockItems.length > 0 && (
            <section className="card p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="h-[18px] w-[18px] shrink-0 text-warn-text" />
                  <div>
                    <h2 className="card-title">Needs restocking</h2>
                    <p className="text-sm text-fg-muted">
                      {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'items'} low or
                      out of stock
                    </p>
                  </div>
                </div>
                <Link
                  to="/inventory"
                  className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-accent-text hover:underline"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <ul className="divide-y divide-line border-t border-line">
                {lowStockItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fg">{item.name}</p>
                      <p className="meta">{item.category}</p>
                    </div>
                    <span
                      className={`badge shrink-0 ${
                        stockStatus(item) === 'Out of Stock' ? 'badge-danger' : 'badge-warn'
                      }`}
                    >
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Activity */}
        <section className="card p-5">
          <h2 className="card-title mb-4">Recent activity</h2>
          <ul className="space-y-4">
            {activity.slice(0, 6).map((act) => {
              const Icon = activityIcon[act.type] ?? Building2;
              return (
                <li key={act.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sunken">
                    <Icon className="h-3.5 w-3.5 text-fg-muted" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-fg">{act.action}</p>
                    <p className="mt-0.5 text-sm leading-snug text-fg-muted">{act.details}</p>
                    <p className="meta mt-1">
                      {act.operatorName} · {formatRelative(act.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
};
