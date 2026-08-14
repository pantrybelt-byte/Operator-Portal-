import React, { useState } from 'react';
import { Zap, CheckCircle2, XCircle, ArrowLeft, Check } from 'lucide-react';
import type { PantryInfo, InventoryItem } from '../types';
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

  const emergencyPresets = [
    { label: 'Normal Walk-ins', note: 'Walk-ins welcome until 4:00 PM today. Drive-thru lane active.', isOpen: true },
    { label: 'At Capacity', note: 'We have reached maximum capacity for today. Next distribution tomorrow 8 AM.', isOpen: false },
    { label: 'Out of Fresh Produce', note: 'Fresh produce stock is depleted for today. Non-perishables still available.', isOpen: true },
    { label: 'Drive-Thru Only', note: 'Rain advisory: Indoor lobby closed. Drive-thru collection active at North Gate.', isOpen: true },
    { label: 'Early Closure (Weather)', note: 'Closing at 2:00 PM today due to severe weather warning.', isOpen: false },
  ];

  const handleApplyPreset = (preset: typeof emergencyPresets[0]) => {
    setQuickNote(preset.note);
    onUpdatePantryStatus(preset.isOpen, preset.note);
  };

  const handleToggleStock = (item: InventoryItem) => {
    const nextInStock = !item.inStock;
    onUpdateInventoryItem({
      ...item,
      inStock: nextInStock,
      status: nextInStock ? 'In Stock' : 'Out of Stock',
      quantity: nextInStock ? (item.quantity === 0 ? item.minThreshold + 10 : item.quantity) : 0,
      lastUpdated: 'Just now',
    });
  };

  const handleQuickBroadcast = (title: string, message: string, priority: 'important' | 'urgent') => {
    onSendQuickAlert(title, message, priority);
    setSentAlert(title);
    setTimeout(() => setSentAlert(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner — Shift Mode Indicator */}
      <div className="bg-[#1d1d1f] text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Shift Mode</h1>
              <span className="text-[11px] font-semibold bg-[#34c759] text-white px-2 py-0.5 rounded-full">Live Distribution</span>
            </div>
            <p className="text-[13px] text-[#86868b] mt-0.5">High-contrast, 1-tap controls for active open hours</p>
          </div>
        </div>

        <Link
          to="/"
          className="self-start sm:self-auto text-[13px] font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Shift Mode</span>
        </Link>
      </div>

      {/* Main Status Toggle Card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-4">
          <span className="text-[13px] font-medium text-[#86868b]">Live App Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${pantry.isOpen ? 'bg-[#34c759]' : 'bg-[#ff3b30]'}`} />
            <span className="text-base font-bold text-[#1d1d1f]">
              {pantry.isOpen ? 'OPEN TO PUBLIC' : 'CLOSED'}
            </span>
          </div>
        </div>

        {/* Big 1-Tap Toggle Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onUpdatePantryStatus(true, quickNote)}
            className={`
              p-5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2
              ${pantry.isOpen
                ? 'border-[#34c759] bg-[#34c759]/10 text-[#34c759]'
                : 'border-[#e5e5ea] bg-white text-[#86868b] hover:border-[#d2d2d7]'
              }
            `}
          >
            <CheckCircle2 className="w-7 h-7" />
            <span className="text-base font-bold">SET OPEN</span>
            <span className="text-[12px] opacity-80 font-medium">Visible on AccessBelt app</span>
          </button>

          <button
            onClick={() => onUpdatePantryStatus(false, quickNote)}
            className={`
              p-5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2
              ${!pantry.isOpen
                ? 'border-[#ff3b30] bg-[#ff3b30]/10 text-[#ff3b30]'
                : 'border-[#e5e5ea] bg-white text-[#86868b] hover:border-[#d2d2d7]'
              }
            `}
          >
            <XCircle className="w-7 h-7" />
            <span className="text-base font-bold">SET CLOSED</span>
            <span className="text-[12px] opacity-80 font-medium">Hidden on AccessBelt app</span>
          </button>
        </div>

        {/* 1-Tap Emergency Status Presets */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-2">1-Tap Emergency Status Presets</label>
          <div className="flex flex-wrap gap-2">
            {emergencyPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleApplyPreset(preset)}
                className="text-[12px] font-semibold px-3 py-2 rounded-xl border border-[#e5e5ea] hover:border-[#0071e3] hover:text-[#0071e3] bg-white transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Message Display */}
        <div className="pt-2">
          <label className="block text-[12px] font-medium text-[#86868b] mb-1">Current App Notice</label>
          <div className="p-3.5 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] text-[13px] font-medium text-[#1d1d1f]">
            "{pantry.openNote}"
          </div>
        </div>
      </div>

      {/* Instant 1-Tap Inventory Stock Flippers */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#1d1d1f]">Instant Stock Flippers</h2>
            <p className="text-[13px] text-[#86868b]">1-tap toggle between In Stock and Out of Stock during shifts</p>
          </div>
          <span className="text-[12px] font-semibold text-[#0071e3]">{inventory.filter(i => i.inStock).length} Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {inventory.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleStock(item)}
              className={`
                p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none
                ${item.inStock
                  ? 'border-[#e5e5ea] bg-white hover:border-[#34c759]'
                  : 'border-[#ff3b30]/30 bg-[#ff3b30]/5'
                }
              `}
            >
              <div>
                <p className="text-[13px] font-semibold text-[#1d1d1f]">{item.name}</p>
                <p className="text-[12px] text-[#86868b]">{item.category} · {item.quantity} {item.unit}</p>
              </div>

              <button
                type="button"
                className={`
                  px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors
                  ${item.inStock
                    ? 'bg-[#34c759]/10 text-[#34c759]'
                    : 'bg-[#ff3b30] text-white'
                  }
                `}
              >
                {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Broadcast Sender */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#1d1d1f]">Quick App Alerts</h2>
            <p className="text-[13px] text-[#86868b]">Send instant notifications to waiting app users</p>
          </div>
          {sentAlert && (
            <span className="text-[12px] font-semibold text-[#34c759] flex items-center gap-1">
              <Check className="w-4 h-4" /> Broadcast Sent!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickBroadcast(
              'Fresh Food Arrived!',
              'Fresh produce delivery just arrived and is now available.',
              'important'
            )}
            className="p-3.5 rounded-xl border border-[#e5e5ea] hover:border-[#0071e3] hover:bg-[#0071e3]/5 text-left transition-colors cursor-pointer"
          >
            <p className="text-[13px] font-semibold text-[#1d1d1f]">🍎 Fresh Food Arrived</p>
            <p className="text-[12px] text-[#86868b] mt-1">Notify waiting line</p>
          </button>

          <button
            onClick={() => handleQuickBroadcast(
              'Drive-Thru Lane Active',
              'Please form a vehicle queue on Elmwood Drive entrance.',
              'important'
            )}
            className="p-3.5 rounded-xl border border-[#e5e5ea] hover:border-[#0071e3] hover:bg-[#0071e3]/5 text-left transition-colors cursor-pointer"
          >
            <p className="text-[13px] font-semibold text-[#1d1d1f]">🚗 Drive-Thru Queue</p>
            <p className="text-[12px] text-[#86868b] mt-1">Traffic & line update</p>
          </button>

          <button
            onClick={() => handleQuickBroadcast(
              'Final Call — Closing Soon',
              'Distribution closes in 30 minutes. Please arrive by 3:45 PM.',
              'urgent'
            )}
            className="p-3.5 rounded-xl border border-[#e5e5ea] hover:border-[#ff3b30] hover:bg-[#ff3b30]/5 text-left transition-colors cursor-pointer"
          >
            <p className="text-[13px] font-semibold text-[#ff3b30]">⏳ Final Call (30m left)</p>
            <p className="text-[12px] text-[#86868b] mt-1">Closing notice</p>
          </button>
        </div>
      </div>
    </div>
  );
};
