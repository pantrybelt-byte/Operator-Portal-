import React, { useState } from 'react';
import { Send, Trash2, Clock, Eye, MapPin, ShieldCheck, Carrot, Siren, CalendarClock } from 'lucide-react';
import type { Announcement, BroadcastQuota } from '../types';
import { formatDateTime, formatUntil } from '../lib/datetime';


interface NotificationsPageProps {
  announcements: Announcement[];
  quota: BroadcastQuota;
  onSendBroadcast: (
    input: Pick<Announcement, 'title' | 'message' | 'priority' | 'language' | 'radiusMiles'> & {
      expiresInHours: number;
    }
  ) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  announcements,
  quota,
  onSendBroadcast,
  onDeleteAnnouncement,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<Announcement['priority']>('important');
  const [language, setLanguage] = useState<Announcement['language']>('English');
  const [expiresHours, setExpiresHours] = useState('24');
  const [isSent, setIsSent] = useState(false);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    onSendBroadcast({
      title,
      message,
      priority,
      language,
      radiusMiles: 15,
      expiresInHours: Number(expiresHours),
    });

    setIsSent(true);
    setTitle('');
    setMessage('');
    setTimeout(() => setIsSent(false), 3500);
  };

  const templates = [
    {
      icon: Carrot,
      label: 'Fresh produce drop',
      title: 'Fresh produce arriving today',
      message:
        'Fresh vegetables and fruit donated by local farms are available starting at 2:00 PM today.',
      priority: 'important' as const,
    },
    {
      icon: Siren,
      label: 'Emergency pickup',
      title: 'Drive-thru collection open',
      message:
        'Weather update: drive-thru food package collection is now active at our North Gate entrance.',
      priority: 'urgent' as const,
    },
    {
      icon: CalendarClock,
      label: 'Extended hours',
      title: 'Extended hours this week',
      message: 'We will stay open until 7:00 PM this Wednesday for working families.',
      priority: 'normal' as const,
    },
  ];

  const handleApplyTemplate = (tplTitle: string, tplMsg: string, tplPriority: Announcement['priority']) => {
    setTitle(tplTitle);
    setMessage(tplMsg);
    setPriority(tplPriority);
  };

  const priorityBadge = (p: string) => {
    const tone =
      { urgent: 'badge-danger', important: 'badge-accent', normal: 'badge-neutral' }[p] ??
      'badge-neutral';
    return <span className={`badge ${tone} capitalize`}>{p}</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Broadcasts</h1>
          <p className="page-subtitle">
            Send a push notification to app users near your pantry
          </p>
        </div>

        <span className="badge badge-neutral">
          <MapPin className="h-3.5 w-3.5" />
          15-mile delivery radius
        </span>
      </div>

      {/* Composer */}
      <section className="card space-y-4 p-5">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <h2 className="card-title">New broadcast</h2>
          <span className="meta shrink-0">
            {quota.usedToday} of {quota.dailyLimit} daily broadcasts used
          </span>
        </div>

        <div>
          <p className="field-label">Start from a template</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => handleApplyTemplate(tpl.title, tpl.message, tpl.priority)}
                className="btn btn-secondary"
              >
                <tpl.icon className="h-4 w-4 text-fg-muted" />
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="field-label">Title</label>
            <input
              type="text"
              required
              placeholder="Fresh produce arriving at 2:00 PM"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5"
            />
          </div>

          <div>
            <label className="field-label">Message</label>
            <textarea
              rows={3}
              required
              placeholder="Add the details families need"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Announcement['language'])}
                className="w-full p-2.5"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="Bilingual">Bilingual (English &amp; Spanish)</option>
              </select>
            </div>

            <div>
              <label className="field-label">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2.5"
              >
                <option value="normal">Standard</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="field-label">Expires</label>
              <select
                value={expiresHours}
                onChange={(e) => setExpiresHours(e.target.value)}
                className="w-full p-2.5"
              >
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="72">3 days</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-line">
            <span className="meta flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success-text" />
              Delivered only to app users within 15 miles
            </span>

            <button type="submit" className="btn btn-primary">
              <Send className="h-4 w-4" />
              {isSent ? 'Sent' : 'Send broadcast'}
            </button>
          </div>
        </form>
      </section>

      {/* History */}
      <section className="card p-5">
        <h2 className="card-title mb-1">History</h2>
        <ul className="divide-y divide-line">
          {announcements.map((ann) => (
            <li
              key={ann.id}
              className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-fg">{ann.title}</h3>
                  {priorityBadge(ann.priority)}
                </div>
                <p className="line-clamp-1 text-sm text-fg-muted">{ann.message}</p>
                <p className="meta flex flex-wrap items-center gap-x-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    {formatDateTime(ann.createdAt)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatUntil(ann.expiresAt).replace('In ', 'Expires in ')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ann.radiusMiles || 15}-mile radius</span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {ann.sentToApp ? (
                  <span className="badge badge-neutral" title="Views">
                    <Eye className="h-3.5 w-3.5" />
                    {ann.viewsCount}
                  </span>
                ) : (
                  <span className="badge badge-warn" title="Waiting on delivery">
                    Pending
                  </span>
                )}

                <button
                  onClick={() => onDeleteAnnouncement(ann.id)}
                  className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-danger-tint hover:text-danger-text"
                  aria-label={`Delete broadcast: ${ann.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
