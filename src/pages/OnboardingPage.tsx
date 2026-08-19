import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, Radio, Zap, Package,
  Bell, ShieldCheck, ChevronRight, CheckCircle2,
  Volume2, Printer, Target
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);

  // Interactive Demo Widget States
  const [demoStatus, setDemoStatus] = useState<'open' | 'limited' | 'closed'>('open');
  const [demoNote, setDemoNote] = useState('Walk-ins welcome until 4:00 PM');
  const [demoStock, setDemoStock] = useState({
    apples: 'In Stock',
    milk: 'Low Stock',
    chicken: 'Out of Stock',
  });
  const [demoMsg, setDemoMsg] = useState('Fresh produce arriving at 2:00 PM today');
  const [demoLang, setDemoLang] = useState<'English' | 'Spanish'>('English');

  const steps = [
    {
      id: 1,
      icon: Radio,
      title: 'Set your status',
      subtitle: 'Control how your pantry availability displays on the AccessBelt mobile app.',
      badge: 'Step 1 of 5',
      color: 'text-success-text',
      bgLight: 'bg-success-tint',
      simpleRule: 'Set status to OPEN during distribution hours, and CLOSED when shift ends.',
      route: '/',
      actionText: 'View Dashboard',
    },
    {
      id: 2,
      icon: Zap,
      title: 'High-Volume Shift Mode',
      subtitle: 'A simplified screen for use while a distribution is running.',
      badge: 'Step 2 of 5',
      color: 'text-accent-text',
      bgLight: 'bg-accent-tint',
      simpleRule: 'Use the status presets when lines are busy.',
      route: '/shift',
      actionText: 'Open Shift Mode',
    },
    {
      id: 3,
      icon: Package,
      title: 'Inventory & Stock Management',
      subtitle: 'Track categories, low-stock thresholds, and printable warehouse sheets.',
      badge: 'Step 3 of 5',
      color: 'text-warn-text',
      bgLight: 'bg-warn-tint',
      simpleRule: 'Staff can mark an item in or out of stock with one tap on a tablet.',
      route: '/inventory',
      actionText: 'View Inventory',
    },
    {
      id: 4,
      icon: Bell,
      title: 'Geofenced Push Notifications',
      subtitle: 'Broadcast 15-mile radius mobile push alerts to nearby app users.',
      badge: 'Step 4 of 5',
      color: 'text-accent-text',
      bgLight: 'bg-accent-tint',
      simpleRule: 'Notify community members about food drops with optional Spanish translation.',
      route: '/notifications',
      actionText: 'Try Broadcasts',
    },
    {
      id: 5,
      icon: ShieldCheck,
      title: '501(c)(3) Verification & Entrance Poster',
      subtitle: 'Display verified organization status and print entrance QR posters.',
      badge: 'Step 5 of 5',
      color: 'text-success-text',
      bgLight: 'bg-success-tint',
      simpleRule: 'Print your QR Code entrance poster so waiting families can scan for live stock.',
      route: '/profile',
      actionText: 'View Profile & Poster',
    },
  ];

  const current = steps[activeStep];

  const handlePrintVolunteerCheatSheet = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {/* Refined Enterprise Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Getting started</h1>
          <p className="page-subtitle">
            How to set your status, run a shift, track stock, and send broadcasts
          </p>
        </div>

        <button onClick={handlePrintVolunteerCheatSheet} className="btn btn-secondary no-print">
          <Printer className="h-4 w-4 text-fg-muted" />
          Print reference sheet
        </button>
      </div>

      {/* 5 Step Indicator Pills */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((s, idx) => {
          const StepIcon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`
                p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5
                ${idx === activeStep
                  ? 'bg-accent border-accent text-white shadow-xs'
                  : idx < activeStep
                  ? 'bg-success-tint border-success/30 text-success-text'
                  : 'bg-surface border-line text-fg-muted hover:border-line-strong'
                }
              `}
            >
              <StepIcon className="w-4 h-4" />
              <span className="text-xs font-semibold truncate w-full">Step {s.id}</span>
            </button>
          );
        })}
      </div>

      {/* Main Enterprise Card */}
      <div className="card p-6 sm:p-8 space-y-6 bg-surface border border-line rounded-2xl relative shadow-xs">
        {/* Step Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${current.bgLight} ${current.color} flex items-center justify-center shrink-0 border border-line`}>
              <current.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-text">
                {current.badge}
              </span>
              <h2 className="text-lg font-bold text-fg tracking-tight">{current.title}</h2>
              <p className="text-sm text-fg-muted mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(current.route)}
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <span>{current.actionText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Guidelines Box */}
        <div className="p-3.5 rounded-xl bg-sunken border border-line flex items-start gap-3">
          <Target className="w-4 h-4 text-fg-muted shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wide">The goal</p>
            <p className="text-sm font-semibold text-fg mt-0.5">{current.simpleRule}</p>
          </div>
        </div>

        {/* Live Interactive Demo Widget */}
        <div className="p-4 rounded-xl bg-sunken border border-line space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-success-text" />
              Try it
            </span>
            <span className="text-xs font-semibold text-accent-text">
              Step Demo
            </span>
          </div>

          {/* STEP 1: Live Traffic Light Status Switcher */}
          {activeStep === 0 && (
            <div className="bg-surface p-4 rounded-xl border border-line space-y-3">
              <p className="text-xs text-fg-muted">Select a status to test live portal behavior:</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { setDemoStatus('open'); setDemoNote('Walk-ins welcome'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${demoStatus === 'open' ? 'bg-success-text text-white' : 'bg-sunken text-fg border border-line'}`}
                >
                  Open now
                </button>
                <button
                  onClick={() => { setDemoStatus('limited'); setDemoNote('Drive-thru lane active'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${demoStatus === 'limited' ? 'bg-warn-text text-white' : 'bg-sunken text-fg border border-line'}`}
                >
                  Limited
                </button>
                <button
                  onClick={() => { setDemoStatus('closed'); setDemoNote('Closed for restocking'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${demoStatus === 'closed' ? 'bg-danger-text text-white' : 'bg-sunken text-fg border border-line'}`}
                >
                  Closed
                </button>
              </div>

              {/* Result Preview Box */}
              <div className="p-3 rounded-xl bg-sunken border border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${demoStatus === 'open' ? 'bg-success' : demoStatus === 'limited' ? 'bg-warn' : 'bg-danger'}`} />
                  <span className="text-sm font-semibold capitalize text-fg">{demoStatus}</span>
                  <span className="text-xs text-fg-muted">"{demoNote}"</span>
                </div>
                <span className="meta shrink-0">What families see</span>
              </div>
            </div>
          )}

          {/* STEP 2: Shift Mode Presets */}
          {activeStep === 1 && (
            <div className="bg-surface p-4 rounded-xl border border-line space-y-3">
              <p className="text-sm text-fg-muted">Presets for common situations during open hours:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setDemoStatus('open')}
                  className="p-2.5 rounded-xl bg-success-tint text-success-text hover:bg-success-text hover:text-white font-semibold text-xs text-center transition-all cursor-pointer"
                >
                  Walk-Ins
                </button>
                <button
                  onClick={() => setDemoStatus('limited')}
                  className="p-2.5 rounded-xl bg-accent-tint text-accent-text hover:bg-accent hover:text-white font-semibold text-xs text-center transition-all cursor-pointer"
                >
                  Drive-Thru
                </button>
                <button
                  onClick={() => setDemoStatus('limited')}
                  className="p-2.5 rounded-xl bg-warn-tint text-warn-text hover:bg-warn-text hover:text-white font-semibold text-xs text-center transition-all cursor-pointer"
                >
                  At Capacity
                </button>
                <button
                  onClick={() => setDemoStatus('closed')}
                  className="p-2.5 rounded-xl bg-danger-tint text-danger-text hover:bg-danger-text hover:text-white font-semibold text-xs text-center transition-all cursor-pointer"
                >
                  Closed
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Stock availability */}
          {activeStep === 2 && (
            <div className="bg-surface p-4 rounded-xl border border-line space-y-3">
              <p className="text-xs text-fg-muted">Click any row below to adjust stock status:</p>
              <div className="space-y-2">
                <div
                  onClick={() => setDemoStock(prev => ({ ...prev, apples: prev.apples === 'In Stock' ? 'Out of Stock' : 'In Stock' }))}
                  className="p-2.5 rounded-xl border border-line flex items-center justify-between cursor-pointer hover:bg-sunken"
                >
                  <span className="text-sm font-semibold text-fg">Fresh Apples (350 lbs)</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${demoStock.apples === 'In Stock' ? 'bg-success-tint text-success-text' : 'bg-danger-tint text-danger-text'}`}>
                    {demoStock.apples} (Toggle)
                  </span>
                </div>

                <div
                  onClick={() => setDemoStock(prev => ({ ...prev, milk: prev.milk === 'Low Stock' ? 'In Stock' : 'Low Stock' }))}
                  className="p-2.5 rounded-xl border border-line flex items-center justify-between cursor-pointer hover:bg-sunken"
                >
                  <span className="text-sm font-semibold text-fg">Whole Milk Gallons (18 units)</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${demoStock.milk === 'Low Stock' ? 'bg-warn-tint text-warn-text' : 'bg-success-tint text-success-text'}`}>
                    {demoStock.milk} (Toggle)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Push Notification Simulator */}
          {activeStep === 3 && (
            <div className="bg-surface p-4 rounded-xl border border-line space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-fg-muted">Mobile push notification preview:</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDemoLang('English')}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${demoLang === 'English' ? 'bg-accent text-white' : 'bg-sunken text-fg-muted'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setDemoLang('Spanish')}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${demoLang === 'Spanish' ? 'bg-accent text-white' : 'bg-sunken text-fg-muted'}`}
                  >
                    Español
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={demoMsg}
                onChange={(e) => setDemoMsg(e.target.value)}
                className="w-full text-sm p-2 rounded-xl border border-line focus:outline-none focus:border-accent"
              />

              <div className="p-3 rounded-xl bg-fg text-white space-y-1 shadow-xs max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <span className="flex items-center gap-1 text-accent-text font-semibold">
                    <Volume2 className="w-3 h-3" /> AccessBelt Push Alert
                  </span>
                  <span>Now · 15-mile radius</span>
                </div>
                <p className="text-sm font-medium">
                  {demoLang === 'Spanish' ? '¡Llegada de alimentos frescos hoy!' : demoMsg}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Entrance QR Poster */}
          {activeStep === 4 && (
            <div className="bg-surface p-4 rounded-xl border border-line space-y-3 text-center">
              <p className="text-xs text-fg-muted">Entrance QR Poster for line queue check-ins:</p>
              <div className="p-3 rounded-xl bg-sunken border border-line inline-block space-y-1.5">
                <div className="w-16 h-16 bg-surface p-1 rounded-lg border border-line mx-auto">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://accessbelt.org/demo"
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs font-semibold text-fg">Scan for Live Stock Updates</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-line">
          <button
            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-3.5 py-1.5 text-sm font-semibold text-fg disabled:opacity-40 hover:bg-black/[0.04] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Next Step ({activeStep + 2} of 5)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-success-text hover:bg-success-text text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Finish walkthrough</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
