import React, { useState } from 'react';
import { Clock, Calendar, Plus, Trash2, Save, X } from 'lucide-react';
import type { DaySchedule, SpecialClosure } from '../types';


interface HoursPageProps {
  schedule: DaySchedule[];
  closures: SpecialClosure[];
  onSaveSchedule: (newSchedule: DaySchedule[]) => void;
  onAddClosure: (closure: Omit<SpecialClosure, 'id'>) => void;
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
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-display">Operating hours</h1>
          <p className="text-[14px] text-[#86868b] mt-0.5">
            Set your weekly schedule and holiday closures
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Saved' : 'Save schedule'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5ea]">
            <Clock className="w-[18px] h-[18px] text-[#0071e3]" />
            <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Weekly schedule</h2>
          </div>

          <div className="space-y-2">
            {schedule.map((item, idx) => (
              <div
                key={item.day}
                className={`
                  p-3.5 rounded-xl border border-[#e5e5ea] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors
                  ${!item.isOpen ? 'bg-[#f5f5f7]' : 'bg-white'}
                `}
              >
                {/* Day & Toggle */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`
                      w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer relative
                      ${item.isOpen ? 'bg-[#34c759]' : 'bg-[#d2d2d7]'}
                    `}
                  >
                    <span
                      className={`
                        w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 block
                        ${item.isOpen ? 'translate-x-4' : 'translate-x-0'}
                      `}
                    />
                  </button>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1d1d1f]">{item.day}</p>
                    <span className={`text-[11px] font-semibold ${item.isOpen ? 'text-[#34c759]' : 'text-[#86868b]'}`}>
                      {item.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>

                {/* Time Pickers */}
                {item.isOpen ? (
                  <div className="flex-1 grid grid-cols-2 gap-2 sm:max-w-xs">
                    <div>
                      <label className="text-[11px] font-medium text-[#86868b] block mb-0.5">Opens</label>
                      <input
                        type="time"
                        value={item.openTime}
                        onChange={(e) => handleTimeChange(idx, 'openTime', e.target.value)}
                        className="w-full text-[13px] p-1.5 rounded-lg border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#86868b] block mb-0.5">Closes</label>
                      <input
                        type="time"
                        value={item.closeTime}
                        onChange={(e) => handleTimeChange(idx, 'closeTime', e.target.value)}
                        className="w-full text-[13px] p-1.5 rounded-lg border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-[13px] text-[#86868b] font-medium">
                    Closed for distribution
                  </div>
                )}

                {/* Notes */}
                <div className="sm:w-44">
                  <input
                    type="text"
                    placeholder="Add a note…"
                    value={item.notes || ''}
                    onChange={(e) => handleTimeChange(idx, 'notes', e.target.value)}
                    className="w-full text-[12px] p-1.5 rounded-lg border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] bg-white placeholder:text-[#86868b]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Special Closures */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea]">
            <div className="flex items-center gap-2">
              <Calendar className="w-[18px] h-[18px] text-[#ff3b30]" />
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Closures</h2>
            </div>
            <button
              onClick={() => setShowClosureModal(true)}
              className="text-[12px] font-semibold text-[#0071e3] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {closures.length === 0 ? (
              <p className="text-[13px] text-[#86868b] py-4 text-center">No closures scheduled</p>
            ) : (
              closures.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1d1d1f]">{c.title}</p>
                      <p className="text-[12px] text-[#0071e3] font-semibold mt-0.5">{c.startDate}</p>
                      {c.reason && <p className="text-[12px] text-[#86868b] mt-0.5">{c.reason}</p>}
                    </div>
                    <button
                      onClick={() => onDeleteClosure(c.id)}
                      className="text-[#86868b] hover:text-[#ff3b30] p-1 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e5ea]">
            <div className="flex items-center justify-between mb-5 border-b border-[#e5e5ea] pb-3">
              <h3 className="text-base font-bold text-[#1d1d1f]">Add closure date</h3>
              <button onClick={() => setShowClosureModal(false)} className="p-1 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClosure} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thanksgiving Holiday"
                  value={closureTitle}
                  onChange={(e) => setClosureTitle(e.target.value)}
                  className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={closureDate}
                  onChange={(e) => setClosureDate(e.target.value)}
                  className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                  Reason <span className="text-[#86868b] font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Closed for holiday observance"
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5ea]">
                <button
                  type="button"
                  onClick={() => setShowClosureModal(false)}
                  className="px-4 py-2 text-[13px] font-semibold text-[#86868b] hover:text-[#1d1d1f] rounded-xl hover:bg-black/[0.04] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-[13px] font-semibold bg-[#ff3b30] text-white rounded-xl hover:bg-[#e03126] transition-colors cursor-pointer shadow-xs"
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
