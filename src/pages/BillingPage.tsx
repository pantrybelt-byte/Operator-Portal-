import React, { useState } from "react";
import { ShieldCheck, Sparkles, CheckCircle2, Users, Bell, MapPin, Zap, Clock, Package, Download } from "lucide-react";
import type { SubscriptionInfo, TeamMember } from "../types";

interface BillingPageProps {
  subscription: SubscriptionInfo;
  teamMembers: TeamMember[];
}

export const BillingPage: React.FC<BillingPageProps> = ({ subscription: _subscription, teamMembers }) => {
  const [activeTab, setActiveTab] = useState<"plan" | "team">("plan");

  const freeOfferings = [
    {
      title: "Real-Time Availability & Hours Broadcaster",
      desc: "Set live Open/Closed status, holiday schedules, and stock levels to stop desperate calls to personal phones.",
      icon: Clock,
    },
    {
      title: "Interactive Satellite Geolocation Pinpoint",
      desc: "Drag the map pin directly onto your actual building door or driveway entrance to guide rural drivers.",
      icon: MapPin,
    },
    {
      title: "Hands-Free SMS Morning Check-In",
      desc: "Daily 8:00 AM text prompt: Reply 1 for Open, 2 for Low Stock, 3 for Closed. Takes 3 seconds on any phone.",
      icon: Bell,
    },
    {
      title: "High-Volume 1-Tap Shift Mode",
      desc: "Streamlined interface for staff and volunteers during high-pressure distribution hours.",
      icon: Zap,
    },
    {
      title: "Unlimited Staff & Volunteer Team Seats",
      desc: "Invite as many volunteers and pantry staff as needed with role-based permissions.",
      icon: Users,
    },
    {
      title: "Pantry Surplus & Emergency Alert Network",
      desc: "Share expiring food surpluses with neighboring pantries or alert regional food banks of urgent needs.",
      icon: Package,
    },
    {
      title: "Printable QR Code Entrance Flyers",
      desc: "Print entrance flyers so waiting families can scan for live inventory updates while in line.",
      icon: Sparkles,
    },
    {
      title: "Free Monthly Board Impact PDF Exports",
      desc: "Export 1-page printable impact summaries for church board meetings and grant proposals.",
      icon: Download,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#34c759] bg-[#34c759]/10 px-2.5 py-0.5 rounded-md border border-[#34c759]/20">
            $0 Free Forever
          </span>
          <span className="text-xs font-semibold text-[#86868b]">Community Standard Tier</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-display">Pantry Services & $0 Free Plan</h1>
        <p className="text-[14px] text-[#86868b] mt-0.5">
          AccessBelt is 100% free forever for all community food pantries & distribution centers.
        </p>
      </div>

      {/* Hero Banner explaining $0 Free Model */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[#34c759]/5 to-transparent border border-[#34c759]/30 text-[#1d1d1f] space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#34c759]" />
          <h2 className="text-base font-bold text-[#1d1d1f]">Why AccessBelt is $0 / Free for Pantries</h2>
        </div>
        <p className="text-[13px] text-[#1d1d1f]/80 leading-relaxed max-w-3xl">
          We believe community food pantries should never pay for technology. AccessBelt Operator Portal is 100% free and fully subsidized by regional agency analytics subscriptions (United Way, Health Systems, and State Agencies). You receive full access to all features at zero cost.
        </p>
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[#34c759] pt-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>No credit card required · No hidden fees · Unlimited usage for pantries</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e5ea] pb-1">
        <button
          onClick={() => setActiveTab("plan")}
          className={`px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-colors cursor-pointer ${
            activeTab === "plan" ? "bg-[#0071e3] text-white shadow-xs" : "text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/[0.04]"
          }`}
        >
          Included Community Offerings ($0)
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "team" ? "bg-[#0071e3] text-white shadow-xs" : "text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/[0.04]"
          }`}
        >
          <span>Volunteer & Staff Seats</span>
          <span className={`text-[11px] font-bold px-2 py-0.2 rounded-full ${activeTab === "team" ? "bg-white/20 text-white" : "bg-black/5 text-[#86868b]"}`}>
            {teamMembers.length} Active
          </span>
        </button>
      </div>

      {activeTab === "plan" ? (
        <div className="space-y-6">
          {/* Master Offerings Grid */}
          <div className="card p-6 space-y-4">
            <h2 className="text-[15px] font-bold text-[#1d1d1f]">Community Standard Suite (All Unlocked)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freeOfferings.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#e5e5ea] bg-white space-y-2 hover:border-[#0071e3]/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-[13px] font-bold text-[#1d1d1f]">{item.title}</h3>
                  </div>
                  <p className="text-[12px] text-[#86868b] leading-relaxed pl-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Team Members Tab */
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Staff & Volunteer Access Seats</h2>
              <p className="text-[13px] text-[#86868b] mt-0.5">
                Unlimited free team seats on the Community Standard plan
              </p>
            </div>

            <button
              onClick={() => alert("Invite link created and copied to clipboard!")}
              className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              + Invite Team Member
            </button>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-3.5 rounded-xl border border-[#e5e5ea] flex items-center justify-between bg-white">
                <div>
                  <p className="text-[13px] font-semibold text-[#1d1d1f]">{member.name}</p>
                  <p className="text-[12px] text-[#86868b]">{member.email} · Role: {member.role}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold bg-[#34c759]/10 text-[#34c759] px-2.5 py-0.5 rounded-md">
                    {member.status}
                  </span>
                  <span className="text-[12px] text-[#86868b]">Active {member.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
