import React, { useState } from 'react';
import { Building2, MapPin, Save, ShieldCheck, Clock } from 'lucide-react';
import type { PantryInfo } from '../types';


interface ProfilePageProps {
  pantry: PantryInfo;
  onUpdatePantry: (updated: PantryInfo) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ pantry, onUpdatePantry }) => {
  const [formData, setFormData] = useState<PantryInfo>(pantry);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof PantryInfo, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePantry(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const inputClass = "w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-display">Pantry profile</h1>
          <p className="text-[14px] text-[#86868b] mt-0.5">
            Manage your organization verification, hours rules, and public listing details
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Saved' : 'Save changes'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          {/* Organization Verification Section */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5ea]">
              <ShieldCheck className="w-[18px] h-[18px] text-[#34c759]" />
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Verification & Non-Profit Status</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">501(c)(3) Tax ID / EIN</label>
                <input
                  type="text"
                  required
                  value={formData.ein}
                  onChange={(e) => handleChange('ein', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Verification Status</label>
                <div className="p-2.5 rounded-xl bg-[#34c759]/10 border border-[#34c759]/20 text-[#34c759] text-[13px] font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{formData.verificationStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shift Automation & Safety Rules */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5ea]">
              <Clock className="w-[18px] h-[18px] text-[#0071e3]" />
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Shift Automation & Auto-Close Rules</h2>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea]">
              <div>
                <p className="text-[13px] font-semibold text-[#1d1d1f]">Automatic Shift Closure</p>
                <p className="text-[12px] text-[#86868b]">Prevents stale status if operators forget to set Closed at shift end</p>
              </div>

              <input
                type="checkbox"
                checked={formData.autoCloseEnabled}
                onChange={(e) => handleChange('autoCloseEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#0071e3] cursor-pointer"
              />
            </div>
          </div>

          {/* General Information */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5ea]">
              <Building2 className="w-[18px] h-[18px] text-[#0071e3]" />
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Organization details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Pantry name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Capacity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-semibold text-[#1d1d1f]">Storage capacity</label>
                <span className="text-[13px] font-bold text-[#0071e3]">{formData.capacityPercentage}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={formData.capacityPercentage}
                onChange={(e) => handleChange('capacityPercentage', Number(e.target.value))}
                className="w-full accent-[#0071e3] cursor-pointer"
              />
              <p className="text-[12px] text-[#86868b] mt-1">Helps food banks prioritize delivery drops</p>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5ea]">
              <MapPin className="w-[18px] h-[18px] text-[#0071e3]" />
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Address & contact</h2>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Street address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">ZIP</label>
                <input
                  type="text"
                  required
                  value={formData.zip}
                  onChange={(e) => handleChange('zip', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Precise Satellite Geolocation & Pinpoint Entrance Verifier */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea]">
              <div className="flex items-center gap-2">
                <MapPin className="w-[18px] h-[18px] text-[#0071e3]" />
                <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Precise Satellite Building Pinpoint</h2>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20">
                🟢 Level 3 Field Verified
              </span>
            </div>

            <p className="text-[12px] text-[#86868b]">
              Rural addresses often geocode to highway midpoints or empty fields. Drag the marker directly onto your actual building structure or distribution entrance door on the satellite map below.
            </p>

            {/* Interactive Satellite Pin Map Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-[#e5e5ea] h-64 bg-[#1c1c1e] flex flex-col justify-between p-4 text-white shadow-inner">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#34c759_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[11px] font-semibold bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 text-white">
                  🛰️ Satellite Pin-Placement Active
                </span>
                <span className="text-[11px] font-mono bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 text-emerald-400">
                  Lat: 32.379210 | Lng: -86.307742
                </span>
              </div>

              {/* Pin Representation */}
              <div className="relative z-10 mx-auto text-center my-auto space-y-1 animate-bounce">
                <div className="w-10 h-10 bg-[#0071e3] text-white rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-white/30">
                  <MapPin className="w-6 h-6 fill-current" />
                </div>
                <span className="inline-block bg-black/80 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-md">
                  Pantry Entrance Door Pin
                </span>
              </div>

              <div className="relative z-10 text-[11px] text-white/80 bg-black/60 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                <span>Drag pin to exact distribution door</span>
                <button type="button" className="text-[#0071e3] font-semibold hover:underline cursor-pointer">
                  Confirm Pin Location
                </button>
              </div>
            </div>

            {/* Physical Entrance Landmark Notes */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                Landmark & Physical Entrance Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Distribution takes place around back at the Fellowship Hall door near the blue awning."
                className={inputClass}
                defaultValue="Distribution is held at the rear Fellowship Hall entrance door behind the blue awning."
              />
              <p className="text-[11px] text-[#86868b] mt-1">
                Helps citizens and delivery drivers find the exact door on large church or warehouse campuses.
              </p>
            </div>
          </div>

          {/* Hands-Free SMS Check-In Preferences */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea]">
              <div className="flex items-center gap-2">
                <Clock className="w-[18px] h-[18px] text-[#0071e3]" />
                <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Hands-Free Morning SMS Check-In</h2>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                Free Volunteer Feature
              </span>
            </div>

            <p className="text-[12px] text-[#86868b]">
              Receive an automated SMS every distribution morning. Reply 1 for Open, 2 for Low Stock, 3 for Closed. Updates your pantry status instantly without needing a computer or password.
            </p>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea]">
              <div>
                <p className="text-[13px] font-semibold text-[#1d1d1f]">Enable Daily 8:00 AM SMS Check-In Prompt</p>
                <p className="text-[12px] text-[#86868b]">Sent to pantry manager phone: (334) 555-0192</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0071e3] cursor-pointer" />
            </div>
          </div>
        </form>

        {/* Right: Preview & QR Code Poster */}
        <div className="space-y-5 self-start">
          {/* App Listing Preview */}
          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-semibold text-[#1d1d1f] pb-3 border-b border-[#e5e5ea]">
              App listing preview
            </h2>

            <div className="p-4 rounded-xl border border-[#e5e5ea] space-y-3 bg-white">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#34c759] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Organization
                </div>
                <h3 className="text-[14px] font-semibold text-[#1d1d1f]">{formData.name}</h3>
                <p className="text-[12px] text-[#86868b]">{formData.city}, {formData.state}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.isOpen ? 'bg-[#34c759]' : 'bg-[#ff3b30]'}`} />
                <span className="text-[12px] font-semibold text-[#1d1d1f]">
                  {formData.isOpen ? 'Open now' : 'Closed'}
                </span>
              </div>

              {formData.openNote && (
                <p className="text-[12px] text-[#1d1d1f] bg-[#f5f5f7] p-2.5 rounded-xl border border-[#e5e5ea] leading-relaxed">
                  "{formData.openNote}"
                </p>
              )}

              <p className="text-[11px] text-[#86868b] font-medium">
                {formData.servedThisWeek} families served this week
              </p>
            </div>
          </div>

          {/* Printable Entrance Poster & QR Code */}
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Pantry Entrance Poster</h2>
            <p className="text-[12px] text-[#86868b]">
              Print a flyer with your AccessBelt QR Code for your entrance so waiting families can scan for live stock.
            </p>
            
            <div className="p-4 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] text-center space-y-2">
              <div className="w-24 h-24 bg-white border border-[#e5e5ea] rounded-xl mx-auto p-2 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://accessbelt.org/pantry/${formData.id}`}
                  alt="AccessBelt QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] font-semibold text-[#1d1d1f]">Scan for Live Stock & Updates</p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2 bg-white border border-[#e5e5ea] hover:border-[#d2d2d7] text-[#1d1d1f] text-[12px] font-semibold rounded-xl transition-colors cursor-pointer"
            >
              🖨️ Print Entrance Poster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
