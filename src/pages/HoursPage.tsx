import React, { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import type { DaySchedule, SpecialClosure } from '../types';
import { formatCalendarDate } from '../lib/datetime';


interface HoursPageProps {
  schedule: DaySchedule[];
  closures: SpecialClosure[];
  onSaveSchedule: (newSchedule: DaySchedule[]) => void;
  onAddClosure: (closure: Omit<SpecialClosure, 'id' | 'orgId' | 'pantryId'>) => void;
  onDeleteClosure: (id: string) => void;
}

export const HoursPage: React.FC<HoursPageProps> = ({
  schedule: initialSchedule,
  closures,
  onSaveSchedule,
  onAddClosure,
  onDeleteClosure,
}) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [closureTitle, setClosureTitle] = useState('');
  const [closureDate, setClosureDate] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index].isOpen = !updated[index].isOpen;
    setSchedule(updated);
  };

  const handleTimeChange = (index: number, field: 'openTime' | 'closeTime' | 'notes', value: string) => {
    const updated = [...schedule];
    updated[index][field] = value as any;
    setSchedule(updated);
  };

  const handleSave = () => {
    onSaveSchedule(schedule);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCreateClosure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureTitle || !closureDate) return;

    onAddClosure({
      title: closureTitle,
      startDate: closureDate,
      endDate: closureDate,
      reason: closureReason,
    });

    setClosureTitle('');
    setClosureDate('');
    setClosureReason('');
    setShowClosureModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Operating hours</h1>
          <p className="text-base text-fg-muted mt-0.5">
            Set your weekly schedule and holiday closures
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Saved' : 'Save schedule'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <h2 className="card-title border-b border-line pb-4">Weekly schedule</h2>

          <div className="space-y-2">
            {schedule.map((item, idx) => (
              <div
                key={item.day}
                className={`
                  p-3.5 rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors
                  ${!item.isOpen ? 'bg-sunken' : 'bg-surface'}
                `}
              >
                {/* Day & Toggle */}
                <div className="flex w-[118px] shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`
                      w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer relative
                      ${item.isOpen ? 'bg-success' : 'bg-line-strong'}
                    `}
                  >
                    <span
                      className={`
                        w-4 h-4 rounded-full bg-surface shadow-xs transform transition-transform duration-200 block
                        ${item.isOpen ? 'translate-x-4' : 'translate-x-0'}
                      `}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-fg">{item.day}</p>
                    <span className={`text-xs font-semibold ${item.isOpen ? 'text-success-text' : 'text-fg-muted'}`}>
                      {item.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>

                {/* Time Pickers */}
                {item.isOpen ? (
                  <div className="grid grid-cols-2 gap-2 sm:w-[236px] sm:shrink-0">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-fg-muted">Opens</label>
                      <input
                        type="time"
                        value={item.openTime}
                        onChange={(e) => handleTimeChange(idx, 'openTime', e.target.value)}
                        className="w-full px-2 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-fg-muted">Closes</label>
                      <input
                        type="time"
                        value={item.closeTime}
                        onChange={(e) => handleTimeChange(idx, 'closeTime', e.target.value)}
                        className="w-full px-2 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-sm font-medium text-fg-muted sm:w-[236px] sm:shrink-0">
                    Closed for distribution
                  </div>
                )}

                {/* Notes */}
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    placeholder="Add a note…"
                    value={item.notes || ''}
                    onChange={(e) => handleTimeChange(idx, 'notes', e.target.value)}
                    className="w-full p-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Special Closures */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h2 className="card-title">Closures</h2>
            <button
              onClick={() => setShowClosureModal(true)}
              className="flex items-center gap-1 text-sm font-semibold text-accent-text hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {closures.length === 0 ? (
              <p className="text-sm text-fg-muted py-4 text-center">No closures scheduled</p>
            ) : (
              closures.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-sunken border border-line">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-fg">{c.title}</p>
                      <p className="meta mt-0.5">{formatCalendarDate(c.startDate)}</p>
                      {c.reason && <p className="text-xs text-fg-muted mt-0.5">{c.reason}</p>}
                    </div>
                    <button
                      onClick={() => onDeleteClosure(c.id)}
                      className="text-fg-muted hover:text-danger-text p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Closure Modal */}
      {showClosureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
              <h3 className="card-title">Add closure date</h3>
              <button onClick={() => setShowClosureModal(false)} className="rounded-md p-1 text-fg-muted transition-colors hover:bg-sunken hover:text-fg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClosure} className="space-y-4">
              <div>
                <label className="field-label">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thanksgiving Holiday"
                  value={closureTitle}
                  onChange={(e) => setClosureTitle(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface placeholder:text-fg-muted"
                />
              </div>

              <div>
                <label className="field-label">Date</label>
                <input
                  type="date"
                  required
                  value={closureDate}
                  onChange={(e) => setClosureDate(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface"
                />
              </div>

              <div>
                <label className="field-label">
                  Reason <span className="text-fg-muted font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Closed for holiday observance"
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface placeholder:text-fg-muted"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowClosureModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-fg-muted hover:text-fg rounded-xl hover:bg-black/[0.04] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-danger-text text-white rounded-lg hover:bg-danger-text transition-colors cursor-pointer shadow-xs"
                >
                  Add closure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
