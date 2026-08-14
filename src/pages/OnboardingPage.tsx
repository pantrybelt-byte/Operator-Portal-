import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, Radio, Zap, Package, 
  Bell, ShieldCheck, Sparkles, ChevronRight, CheckCircle2,
  Volume2, Printer
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
  const [demoMsg, setDemoMsg] = useState('Fresh Produce Drop arriving at 2:00 PM today!');
  const [demoLang, setDemoLang] = useState<'English' | 'Spanish'>('English');

  const steps = [
    {
      id: 1,
      icon: Radio,
      title: 'Real-Time Operational Status',
      subtitle: 'Control how your pantry availability displays on the AccessBelt mobile app.',
      badge: 'Step 1 of 5',
      color: 'text-[#34c759]',
      bgLight: 'bg-[#34c759]/10',
      simpleRule: 'Set status to OPEN during distribution hours, and CLOSED when shift ends.',
      route: '/',
      actionText: 'View Dashboard',
    },
    {
      id: 2,
      icon: Zap,
      title: 'High-Volume Shift Mode',
      subtitle: 'Streamlined 1-tap interface for high-pressure distribution hours.',
      badge: 'Step 2 of 5',
      color: 'text-[#0071e3]',
      bgLight: 'bg-[#0071e3]/10',
      simpleRule: 'Use 1-tap presets (Walk-Ins, Drive-Thru, At Capacity) when lines are busy.',
      route: '/shift',
      actionText: 'Open Shift Mode',
    },
    {
      id: 3,
      icon: Package,
      title: 'Inventory & Stock Management',
      subtitle: 'Track categories, low-stock thresholds, and printable warehouse sheets.',
      badge: 'Step 3 of 5',
      color: 'text-[#ff9500]',
      bgLight: 'bg-[#ff9500]/10',
      simpleRule: 'Single-tap row flippers let staff adjust stock levels instantly on tablets.',
      route: '/inventory',
      actionText: 'View Inventory',
    },
    {
      id: 4,
      icon: Bell,
      title: 'Geofenced Push Notifications',
      subtitle: 'Broadcast 15-mile radius mobile push alerts to nearby app users.',
      badge: 'Step 4 of 5',
      color: 'text-[#0071e3]',
      bgLight: 'bg-[#0071e3]/10',
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
      color: 'text-[#34c759]',
      bgLight: 'bg-[#34c759]/10',
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
    <div className="space-y-6 max-w-3xl mx-auto pb-10 font-sans">
      {/* Refined Enterprise Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0071e3]/10 text-[#0071e3] text-[12px] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Operator Portal Walkthrough</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight font-display">
          AccessBelt Getting Started Guide
        </h1>
        <p className="text-[14px] text-[#86868b] max-w-lg mx-auto">
          An overview of portal controls, distribution shift tools, inventory tracking, and push alerts.
        </p>

        {/* Action Button */}
        <div className="pt-1">
          <button
            onClick={handlePrintVolunteerCheatSheet}
            className="px-3.5 py-1.5 bg-white border border-[#e5e5ea] hover:border-[#d2d2d7] text-[#1d1d1f] text-[12px] font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Print 1-Page Operator Cheat Sheet</span>
          </button>
        </div>
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
                  ? 'bg-[#0071e3] border-[#0071e3] text-white shadow-xs'
                  : idx < activeStep
                  ? 'bg-[#34c759]/10 border-[#34c759]/30 text-[#34c759]'
                  : 'bg-white border-[#e5e5ea] text-[#86868b] hover:border-[#d2d2d7]'
                }
              `}
            >
              <StepIcon className="w-4 h-4" />
              <span className="text-[11px] font-semibold truncate w-full">Step {s.id}</span>
            </button>
          );
        })}
      </div>

      {/* Main Enterprise Card */}
      <div className="card p-6 sm:p-8 space-y-6 bg-white border border-[#e5e5ea] rounded-2xl relative shadow-xs">
        {/* Step Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${current.bgLight} ${current.color} flex items-center justify-center shrink-0 border border-[#e5e5ea]`}>
              <current.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0071e3]">
                {current.badge}
              </span>
              <h2 className="text-lg font-bold text-[#1d1d1f] tracking-tight">{current.title}</h2>
              <p className="text-[13px] text-[#86868b] mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(current.route)}
            className="px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <span>{current.actionText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Guidelines Box */}
        <div className="p-3.5 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wide">Operational Objective</p>
            <p className="text-[13px] font-semibold text-[#1d1d1f] mt-0.5">{current.simpleRule}</p>
          </div>
        </div>

        {/* Live Interactive Demo Widget */}
        <div className="p-4 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759]" />
              Interactive Simulation
            </span>
            <span className="text-[11px] font-semibold text-[#0071e3]">
              Step Demo
            </span>
          </div>

          {/* STEP 1: Live Traffic Light Status Switcher */}
          {activeStep === 0 && (
            <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] space-y-3">
              <p className="text-[12px] text-[#86868b]">Select a status to test live portal behavior:</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { setDemoStatus('open'); setDemoNote('Walk-ins welcome!'); }}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${demoStatus === 'open' ? 'bg-[#34c759] text-white shadow-xs' : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#e5e5ea]'}`}
                >
                  OPEN NOW
                </button>
                <button
                  onClick={() => { setDemoStatus('limited'); setDemoNote('Drive-thru lane active'); }}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${demoStatus === 'limited' ? 'bg-[#ff9500] text-white shadow-xs' : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#e5e5ea]'}`}
                >
                  LIMITED
                </button>
                <button
                  onClick={() => { setDemoStatus('closed'); setDemoNote('Closed for restocking'); }}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${demoStatus === 'closed' ? 'bg-[#ff3b30] text-white shadow-xs' : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#e5e5ea]'}`}
                >
                  CLOSED
                </button>
              </div>

              {/* Result Preview Box */}
              <div className="p-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${demoStatus === 'open' ? 'bg-[#34c759]' : demoStatus === 'limited' ? 'bg-[#ff9500]' : 'bg-[#ff3b30]'}`} />
                  <span className="text-[13px] font-bold text-[#1d1d1f] uppercase">{demoStatus}</span>
                  <span className="text-[12px] text-[#86868b]">"{demoNote}"</span>
                </div>
                <span className="text-[11px] font-semibold text-[#0071e3]">Live App Output 📱</span>
              </div>
            </div>
          )}

          {/* STEP 2: Shift Mode Presets */}
          {activeStep === 1 && (
            <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] space-y-3">
              <p className="text-[12px] text-[#86868b]">1-tap presets for open distribution hours:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setDemoStatus('open')}
                  className="p-2.5 rounded-xl bg-[#34c759]/10 text-[#34c759] hover:bg-[#34c759] hover:text-white font-semibold text-[12px] text-center transition-all cursor-pointer"
                >
                  Walk-Ins
                </button>
                <button
                  onClick={() => setDemoStatus('limited')}
                  className="p-2.5 rounded-xl bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3] hover:text-white font-semibold text-[12px] text-center transition-all cursor-pointer"
                >
                  Drive-Thru
                </button>
                <button
                  onClick={() => setDemoStatus('limited')}
                  className="p-2.5 rounded-xl bg-[#ff9500]/10 text-[#ff9500] hover:bg-[#ff9500] hover:text-white font-semibold text-[12px] text-center transition-all cursor-pointer"
                >
                  At Capacity
                </button>
                <button
                  onClick={() => setDemoStatus('closed')}
                  className="p-2.5 rounded-xl bg-[#ff3b30]/10 text-[#ff3b30] hover:bg-[#ff3b30] hover:text-white font-semibold text-[12px] text-center transition-all cursor-pointer"
                >
                  Closed
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Stock Shelf Flippers */}
          {activeStep === 2 && (
            <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] space-y-3">
              <p className="text-[12px] text-[#86868b]">Click any row below to adjust stock status:</p>
              <div className="space-y-2">
                <div
                  onClick={() => setDemoStock(prev => ({ ...prev, apples: prev.apples === 'In Stock' ? 'Out of Stock' : 'In Stock' }))}
                  className="p-2.5 rounded-xl border border-[#e5e5ea] flex items-center justify-between cursor-pointer hover:bg-[#f5f5f7]"
                >
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">Fresh Apples (350 lbs)</span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${demoStock.apples === 'In Stock' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#ff3b30]/10 text-[#ff3b30]'}`}>
                    {demoStock.apples} (Toggle)
                  </span>
                </div>

                <div
                  onClick={() => setDemoStock(prev => ({ ...prev, milk: prev.milk === 'Low Stock' ? 'In Stock' : 'Low Stock' }))}
                  className="p-2.5 rounded-xl border border-[#e5e5ea] flex items-center justify-between cursor-pointer hover:bg-[#f5f5f7]"
                >
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">Whole Milk Gallons (18 units)</span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${demoStock.milk === 'Low Stock' ? 'bg-[#ff9500]/10 text-[#ff9500]' : 'bg-[#34c759]/10 text-[#34c759]'}`}>
                    {demoStock.milk} (Toggle)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Push Notification Simulator */}
          {activeStep === 3 && (
            <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-[#86868b]">Mobile push notification preview:</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDemoLang('English')}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${demoLang === 'English' ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-[#86868b]'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setDemoLang('Spanish')}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${demoLang === 'Spanish' ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-[#86868b]'}`}
                  >
                    Español
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={demoMsg}
                onChange={(e) => setDemoMsg(e.target.value)}
                className="w-full text-[13px] p-2 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3]"
              />

              <div className="p-3 rounded-xl bg-[#1d1d1f] text-white space-y-1 shadow-xs max-w-sm mx-auto">
                <div className="flex items-center justify-between text-[11px] text-[#86868b]">
                  <span className="flex items-center gap-1 text-[#0071e3] font-semibold">
                    <Volume2 className="w-3 h-3" /> AccessBelt Push Alert
                  </span>
                  <span>Now · 15-mile radius</span>
                </div>
                <p className="text-[13px] font-medium">
                  {demoLang === 'Spanish' ? '¡Llegada de alimentos frescos hoy!' : demoMsg}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Entrance QR Poster */}
          {activeStep === 4 && (
            <div className="bg-white p-4 rounded-xl border border-[#e5e5ea] space-y-3 text-center">
              <p className="text-[12px] text-[#86868b]">Entrance QR Poster for line queue check-ins:</p>
              <div className="p-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] inline-block space-y-1.5">
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-[#e5e5ea] mx-auto">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://accessbelt.org/demo"
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] font-semibold text-[#1d1d1f]">Scan for Live Stock Updates</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e5e5ea]">
          <button
            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-3.5 py-1.5 text-[13px] font-semibold text-[#1d1d1f] disabled:opacity-40 hover:bg-black/[0.04] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Next Step ({activeStep + 2} of 5)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-[#34c759] hover:bg-[#2fb350] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Complete Walkthrough</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
