import React, { useState } from 'react';
import { Radio, CheckCircle2, XCircle, ArrowLeft, Check, Apple, Car, Timer } from 'lucide-react';
import type { PantryInfo, InventoryItem } from '../types';
import { isInStock, stockStatus } from '../types';
import { Link } from 'react-router-dom';

interface ShiftModePageProps {
  pantry: PantryInfo;
  inventory: InventoryItem[];
  onUpdatePantryStatus: (isOpen: boolean, note: string) => void;
  onUpdateInventoryItem: (updated: InventoryItem) => void;
  onSendQuickAlert: (title: string, message: string, priority: 'normal' | 'important' | 'urgent') => void;
}

export const ShiftModePage: React.FC<ShiftModePageProps> = ({
  pantry,
  inventory,
  onUpdatePantryStatus,
  onUpdateInventoryItem,
  onSendQuickAlert,
}) => {
  const [quickNote, setQuickNote] = useState(pantry.openNote);
  const [sentAlert, setSentAlert] = useState<string | null>(null);

  const statusPresets = [
    { label: 'Walk-ins open', note: 'Walk-ins welcome until 4:00 PM today. Drive-thru lane active.', isOpen: true },
    { label: 'At capacity', note: 'We have reached capacity for today. Next distribution tomorrow at 8:00 AM.', isOpen: false },
    { label: 'Produce sold out', note: 'Fresh produce is gone for today. Non-perishables still available.', isOpen: true },
    { label: 'Drive-thru only', note: 'Indoor lobby closed. Drive-thru collection active at the North Gate.', isOpen: true },
    { label: 'Closing early', note: 'Closing at 2:00 PM today due to a severe weather warning.', isOpen: false },
  ];

  const quickAlerts = [
    {
      icon: Apple,
      label: 'Fresh food arrived',
      hint: 'Notify the waiting line',
      title: 'Fresh food arrived',
      message: 'A fresh produce delivery just arrived and is now available.',
      priority: 'important' as const,
      urgent: false,
    },
    {
      icon: Car,
      label: 'Drive-thru queue',
      hint: 'Traffic and line update',
      title: 'Drive-thru lane active',
      message: 'Please form a vehicle queue at the Elmwood Drive entrance.',
      priority: 'important' as const,
      urgent: false,
    },
    {
      icon: Timer,
      label: 'Closing in 30 minutes',
      hint: 'Final call notice',
      title: 'Final call — closing soon',
      message: 'Distribution closes in 30 minutes. Please arrive by 3:45 PM.',
      priority: 'urgent' as const,
      urgent: true,
    },
  ];

  const handleApplyPreset = (preset: (typeof statusPresets)[0]) => {
    setQuickNote(preset.note);
    onUpdatePantryStatus(preset.isOpen, preset.note);
  };

  // Only quantity is written; "in stock" is derived from it everywhere else.
  const handleToggleStock = (item: InventoryItem) => {
    onUpdateInventoryItem({
      ...item,
      quantity: isInStock(item) ? 0 : item.minThreshold + 10,
      updatedAt: new Date(),
    });
  };

  const handleQuickBroadcast = (alert: (typeof quickAlerts)[0]) => {
    onSendQuickAlert(alert.title, alert.message, alert.priority);
    setSentAlert(alert.title);
    setTimeout(() => setSentAlert(null), 3000);
  };

  const availableCount = inventory.filter(isInStock).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sunken">
            <Radio className="h-5 w-5 text-fg" />
          </span>
          <div>
            <h1 className="page-title">Shift mode</h1>
            <p className="page-subtitle">Simplified controls for use during open hours</p>
          </div>
        </div>

        <Link to="/" className="btn btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Exit shift mode
        </Link>
      </div>

      {/* Status */}
      <section className="card space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <h2 className="card-title">Status in the app</h2>
          <span className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${pantry.isOpen ? 'bg-success' : 'bg-danger'}`}
            />
            <span className="text-lg font-semibold text-fg">
              {pantry.isOpen ? 'Open' : 'Closed'}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => onUpdatePantryStatus(true, quickNote)}
            aria-pressed={pantry.isOpen}
            className={`flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 text-center transition-colors ${
              pantry.isOpen
                ? 'border-success bg-success-tint'
                : 'border-line hover:border-line-strong'
            }`}
          >
            <CheckCircle2
              className={`h-7 w-7 ${pantry.isOpen ? 'text-success-text' : 'text-fg-muted'}`}
            />
            <span className="text-lg font-semibold text-fg">Set open</span>
            <span className="text-xs text-fg-muted">Shown as open in the app</span>
          </button>

          <button
            onClick={() => onUpdatePantryStatus(false, quickNote)}
            aria-pressed={!pantry.isOpen}
            className={`flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 text-center transition-colors ${
              !pantry.isOpen
                ? 'border-danger bg-danger-tint'
                : 'border-line hover:border-line-strong'
            }`}
          >
            <XCircle
              className={`h-7 w-7 ${!pantry.isOpen ? 'text-danger-text' : 'text-fg-muted'}`}
            />
            <span className="text-lg font-semibold text-fg">Set closed</span>
            <span className="text-xs text-fg-muted">Shown as closed in the app</span>
          </button>
        </div>

        <div>
          <p className="field-label">Common situations</p>
          <div className="flex flex-wrap gap-2">
            {statusPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleApplyPreset(preset)}
                className="btn btn-secondary"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="field-label">Message shown to families</p>
          <p className="rounded-xl bg-sunken px-4 py-3 text-sm text-fg">{pantry.openNote}</p>
        </div>
      </section>

      {/* Stock */}
      <section className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="card-title">Stock availability</h2>
            <p className="text-sm text-fg-muted">Tap an item to mark it in or out of stock</p>
          </div>
          <span className="badge badge-neutral shrink-0">{availableCount} available</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {inventory.map((item) => (
            <button
              key={item.id}
              onClick={() => handleToggleStock(item)}
              aria-pressed={isInStock(item)}
              className={`flex min-h-[64px] items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                isInStock(item) ? 'border-line hover:border-line-strong' : 'border-danger/40 bg-danger-tint'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-fg">{item.name}</span>
                <span className="meta block truncate">
                  {item.category} · {item.quantity} {item.unit}
                </span>
              </span>

              <span className={`badge shrink-0 ${isInStock(item) ? 'badge-success' : 'badge-danger'}`}>
                {stockStatus(item)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Alerts */}
      <section className="card space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="card-title">Send an alert</h2>
            <p className="text-sm text-fg-muted">Notifies app users within 15 miles</p>
          </div>
          {sentAlert && (
            <span className="badge badge-success shrink-0">
              <Check className="h-3.5 w-3.5" />
              Sent
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickAlerts.map((alert) => (
            <button
              key={alert.label}
              onClick={() => handleQuickBroadcast(alert)}
              className="card-hover flex min-h-[80px] flex-col items-start gap-1.5 rounded-xl border border-line p-3.5 text-left"
            >
              <alert.icon
                className={`h-[18px] w-[18px] ${alert.urgent ? 'text-danger-text' : 'text-fg-muted'}`}
              />
              <span className="text-sm font-semibold text-fg">{alert.label}</span>
              <span className="meta">{alert.hint}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
