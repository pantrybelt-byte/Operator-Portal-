import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  Bell,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import type { PantryInfo, InventoryItem, ActivityItem } from '../types';
import { Link, useNavigate } from 'react-router-dom';


interface DashboardPageProps {
  pantry: PantryInfo;
  inventory: InventoryItem[];
  activity: ActivityItem[];
  onQuickToggleStatus: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  pantry,
  inventory,
  activity,
  onQuickToggleStatus,
}) => {
  const navigate = useNavigate();
  const [showOnboardingBanner, setShowOnboardingBanner] = useState<boolean>(true);
  const lowStockItems = inventory.filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock');
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* First-Time Onboarding Banner */}
      {showOnboardingBanner && (
        <div className="p-4 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#1d1d1f]">New to AccessBelt? Take the 2-Minute Quick Guide</p>
              <p className="text-[12px] text-[#86868b]">Learn how to switch live status, use 1-tap shift mode, and send neighborhood push alerts.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => navigate('/onboarding')}
              className="px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[12px] font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Start 2-Min Guide
            </button>
            <button
              onClick={() => setShowOnboardingBanner(false)}
              className="p-1 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-display">
          Good afternoon, {pantry.name.split(' ').slice(0, 2).join(' ')}
        </h1>
        <p className="text-[14px] text-[#86868b] mt-0.5">
          Here's an overview of your pantry operations
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div className="card p-5">
          <p className="text-[13px] text-[#86868b] font-medium">Status</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${pantry.isOpen ? 'bg-[#34c759]' : 'bg-[#ff3b30]'}`} />
              <span className="text-lg font-bold text-[#1d1d1f]">
                {pantry.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <button
              onClick={onQuickToggleStatus}
              className="text-[12px] font-semibold text-[#0071e3] hover:underline cursor-pointer"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Food Items */}
        <div className="card p-5">
          <p className="text-[13px] text-[#86868b] font-medium">Inventory items</p>
          <div className="mt-3">
            <p className="text-lg font-bold text-[#1d1d1f]">{inventory.length}</p>
            <p className="text-[12px] text-[#86868b] mt-0.5">
              {totalQuantity.toLocaleString()} units in stock
            </p>
          </div>
        </div>

        {/* Served Families */}
        <div className="card p-5">
          <p className="text-[13px] text-[#86868b] font-medium">Families served</p>
          <div className="mt-3">
            <p className="text-lg font-bold text-[#1d1d1f]">{pantry.servedThisWeek}</p>
            <p className="text-[12px] text-[#34c759] mt-0.5 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              +14% vs last week
            </p>
          </div>
        </div>

        {/* Capacity */}
        <div className="card p-5">
          <p className="text-[13px] text-[#86868b] font-medium">Capacity</p>
          <div className="mt-3">
            <p className="text-lg font-bold text-[#1d1d1f]">{pantry.capacityPercentage}%</p>
            <div className="w-full h-1.5 rounded-full bg-[#f5f5f7] overflow-hidden mt-2 border border-[#e5e5ea]">
              <div
                className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
                style={{ width: `${pantry.capacityPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Quick Links & Low Stock */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Links */}
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-[#1d1d1f] mb-4">Quick actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Update stock', path: '/inventory', icon: Package, color: '#0071e3' },
                { label: 'Send broadcast', path: '/notifications', icon: Bell, color: '#34c759' },
                { label: 'Set schedule', path: '/hours', icon: Clock, color: '#ff9500' },
                { label: 'Edit profile', path: '/profile', icon: ArrowUpRight, color: '#af52de' },
              ].map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="p-3.5 rounded-xl border border-[#e5e5ea] hover:border-[#d2d2d7] transition-all flex flex-col items-center text-center gap-2 group cursor-pointer bg-white"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${action.color}15`, color: action.color }}
                  >
                    <action.icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className="text-[12px] font-semibold text-[#1d1d1f]">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Low Stock */}
          {lowStockItems.length > 0 && (
            <div className="card p-5 border-l-4 border-l-[#ff9500]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-[18px] h-[18px] text-[#ff9500]" />
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#1d1d1f]">Low stock items</h3>
                    <p className="text-[12px] text-[#86868b]">{lowStockItems.length} items need restocking</p>
                  </div>
                </div>
                <Link to="/inventory" className="text-[12px] font-semibold text-[#0071e3] hover:underline flex items-center gap-0.5">
                  View all
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="py-2.5 px-3.5 rounded-xl bg-[#f5f5f7] flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1d1d1f]">{item.name}</p>
                      <p className="text-[12px] text-[#86868b]">{item.category}</p>
                    </div>
                    <span
                      className={`text-[12px] font-semibold px-2.5 py-1 rounded-md ${
                        item.status === 'Out of Stock'
                          ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
                          : 'bg-[#ff9500]/10 text-[#ff9500]'
                      }`}
                    >
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Activity Feed */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-[#1d1d1f] mb-4">Recent activity</h3>

          <div className="space-y-4">
            {activity.slice(0, 6).map((act) => (
              <div key={act.id} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#1d1d1f]">{act.action}</p>
                  <p className="text-[12px] text-[#86868b] leading-snug mt-0.5">{act.details}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] text-[#86868b]">{act.operatorName}</span>
                    <span className="text-[11px] text-[#d2d2d7]">·</span>
                    <span className="text-[11px] text-[#86868b]">{act.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
