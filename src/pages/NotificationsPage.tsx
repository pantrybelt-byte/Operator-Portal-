import React, { useState } from 'react';
import { Bell, Send, Trash2, Clock, Eye, MapPin, ShieldCheck } from 'lucide-react';
import type { Announcement } from '../types';


interface NotificationsPageProps {
  announcements: Announcement[];
  onAddAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'sentToApp' | 'viewsCount'>) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('important');
  const [expiresHours, setExpiresHours] = useState('24');
  const [isSent, setIsSent] = useState(false);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    onAddAnnouncement({
      title,
      message,
      priority,
      expiresAt: `In ${expiresHours} hours`,
      radiusMiles: 15,
    });

    setIsSent(true);
    setTitle('');
    setMessage('');
    setTimeout(() => setIsSent(false), 3500);
  };

  const handleApplyTemplate = (tplTitle: string, tplMsg: string, tplPriority: Announcement['priority']) => {
    setTitle(tplTitle);
    setMessage(tplMsg);
    setPriority(tplPriority);
  };

  const priorityBadge = (p: string) => {
    const styles = {
      urgent: 'bg-[#ff3b30]/10 text-[#ff3b30]',
      important: 'bg-[#0071e3]/10 text-[#0071e3]',
      normal: 'bg-[#f5f5f7] text-[#86868b]',
    }[p] || 'bg-[#f5f5f7] text-[#86868b]';

    return (
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${styles}`}>
        {p}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-display">Broadcasts</h1>
          <p className="text-[14px] text-[#86868b] mt-0.5">
            Send geofenced push notifications to AccessBelt app users in your area
          </p>
        </div>

        {/* Anti-Spam Guard Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#1d1d1f] bg-[#f5f5f7] border border-[#e5e5ea] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#0071e3]" />
            15-mile Geofence Active
          </span>
        </div>
      </div>

      {/* Composer */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Bell className="w-[18px] h-[18px] text-[#0071e3]" />
            <h2 className="text-[14px] font-semibold text-[#1d1d1f]">New broadcast</h2>
          </div>
          <span className="text-[12px] text-[#86868b] font-medium">Daily limit: 1 / 2 sent today</span>
        </div>

        {/* Quick Templates */}
        <div>
          <p className="text-[12px] font-semibold text-[#86868b] mb-2">Templates</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleApplyTemplate(
                  'Fresh Produce Drop Arriving Today!',
                  'We have fresh organic vegetables & fruits donated by local farms available starting at 2:00 PM today.',
                  'important'
                )
              }
              className="text-[12px] font-semibold px-3 py-1.5 rounded-xl border border-[#e5e5ea] text-[#1d1d1f] hover:border-[#0071e3] hover:text-[#0071e3] transition-colors cursor-pointer bg-white"
            >
              🥕 Fresh produce drop
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyTemplate(
                  'Emergency Drive-Thru Collection Open',
                  'Weather update: Drive-thru food package collection is now active at our North Gate entrance.',
                  'urgent'
                )
              }
              className="text-[12px] font-semibold px-3 py-1.5 rounded-xl border border-[#e5e5ea] text-[#1d1d1f] hover:border-[#ff3b30] hover:text-[#ff3b30] transition-colors cursor-pointer bg-white"
            >
              🚨 Emergency pickup
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyTemplate(
                  'Extended Hours This Week',
                  'Our pantry will remain open until 7:00 PM this Wednesday for working families.',
                  'normal'
                )
              }
              className="text-[12px] font-semibold px-3 py-1.5 rounded-xl border border-[#e5e5ea] text-[#1d1d1f] hover:border-[#0071e3] hover:text-[#0071e3] transition-colors cursor-pointer bg-white"
            >
              ⏰ Extended hours
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh produce arriving at 2:00 PM"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Message</label>
            <textarea
              rows={3}
              required
              placeholder="Write details for app users…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Target Language</label>
              <select
                className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="Both">Bilingual (English & Spanish)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white"
              >
                <option value="normal">Standard</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Expires</label>
              <select
                value={expiresHours}
                onChange={(e) => setExpiresHours(e.target.value)}
                className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white"
              >
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="72">3 days</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#e5e5ea]">
            <span className="text-[12px] text-[#86868b] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34c759]" />
              Delivered only to mobile users within 15 miles
            </span>

            <button
              type="submit"
              className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{isSent ? 'Sent!' : 'Send broadcast'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History */}
      <div className="card p-5 space-y-4">
        <h2 className="text-[14px] font-semibold text-[#1d1d1f]">History</h2>
        <div className="space-y-2">
          {announcements.map((ann) => (
            <div key={ann.id} className="p-4 rounded-xl border border-[#e5e5ea] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {priorityBadge(ann.priority)}
                  <h3 className="text-[13px] font-semibold text-[#1d1d1f]">{ann.title}</h3>
                </div>
                <p className="text-[12px] text-[#86868b] line-clamp-1">{ann.message}</p>
                <div className="flex items-center gap-3 text-[11px] text-[#86868b]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ann.createdAt}
                  </span>
                  <span>·</span>
                  <span>Expires {ann.expiresAt}</span>
                  <span>·</span>
                  <span>{ann.radiusMiles || 15}-mile radius</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1d1d1f] bg-[#f5f5f7] px-2.5 py-1 rounded-md border border-[#e5e5ea]">
                  <Eye className="w-3.5 h-3.5 text-[#86868b]" />
                  <span>{ann.viewsCount}</span>
                </div>

                <button
                  onClick={() => onDeleteAnnouncement(ann.id)}
                  className="p-1.5 rounded-lg text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
