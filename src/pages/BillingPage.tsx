import React, { useState } from 'react';
import { CreditCard, Download, ArrowUpRight, Users, Bell } from 'lucide-react';
import type { SubscriptionInfo, TeamMember } from '../types';

interface BillingPageProps {
  subscription: SubscriptionInfo;
  teamMembers: TeamMember[];
}

export const BillingPage: React.FC<BillingPageProps> = ({ subscription, teamMembers }) => {
  const [currentSub] = useState<SubscriptionInfo>(subscription);
  const [activeTab, setActiveTab] = useState<'plan' | 'team'>('plan');

  const broadcastUsagePct = Math.round((currentSub.broadcastsUsed / currentSub.broadcastsLimit) * 100);
  const seatsUsagePct = Math.round((teamMembers.length / currentSub.seatsLimit) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-display">Billing & Subscription</h1>
        <p className="text-[14px] text-[#86868b] mt-0.5">
          Manage your AccessBelt SaaS plan, team seats, and invoices
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e5ea] pb-1">
        <button
          onClick={() => setActiveTab('plan')}
          className={`
            px-3 py-2 text-[13px] font-semibold rounded-xl transition-colors cursor-pointer
            ${activeTab === 'plan'
              ? 'bg-[#0071e3] text-white'
              : 'text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/[0.04]'
            }
          `}
        >
          Subscription & Billing
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`
            px-3 py-2 text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2
            ${activeTab === 'team'
              ? 'bg-[#0071e3] text-white'
              : 'text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/[0.04]'
            }
          `}
        >
          <span>Team Seats</span>
          <span className={`text-[11px] font-bold px-2 py-0.2 rounded-full ${activeTab === 'team' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#86868b]'}`}>
            {teamMembers.length}/{currentSub.seatsLimit}
          </span>
        </button>
      </div>

      {activeTab === 'plan' ? (
        <div className="space-y-5">
          {/* Active Plan Card */}
          <div className="card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5ea] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-0.5 rounded-md">
                    {currentSub.status}
                  </span>
                  <h2 className="text-lg font-bold text-[#1d1d1f]">{currentSub.planName}</h2>
                </div>
                <p className="text-[13px] text-[#86868b] mt-1">
                  Full operator portal access, real-time Firebase sync, and push notifications
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-2xl font-bold text-[#1d1d1f]">
                  {currentSub.price}
                  <span className="text-[13px] font-normal text-[#86868b]"> / month</span>
                </p>
                <p className="text-[12px] text-[#86868b] mt-0.5">Renews {currentSub.renewsDate}</p>
              </div>
            </div>

            {/* Quota Usage Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Broadcast Usage */}
              <div className="p-4 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#0071e3]" />
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">Monthly App Broadcasts</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#86868b]">
                    {currentSub.broadcastsUsed} / {currentSub.broadcastsLimit}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-[#e5e5ea]">
                  <div
                    className="h-full bg-[#0071e3] rounded-full transition-all"
                    style={{ width: `${broadcastUsagePct}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#86868b]">Resets on 1st of next month</p>
              </div>

              {/* Team Seats Usage */}
              <div className="p-4 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#34c759]" />
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">Staff & Volunteer Seats</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#86868b]">
                    {teamMembers.length} / {currentSub.seatsLimit}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-[#e5e5ea]">
                  <div
                    className="h-full bg-[#34c759] rounded-full transition-all"
                    style={{ width: `${seatsUsagePct}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#86868b]">{currentSub.seatsLimit - teamMembers.length} seats available</p>
              </div>
            </div>

            {/* Payment Method & Flexible Non-Profit Billing */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-[13px] text-[#86868b]">
                <div className="flex items-center gap-1.5 font-semibold text-[#1d1d1f]">
                  <CreditCard className="w-4 h-4 text-[#0071e3]" />
                  <span>{currentSub.paymentMethod.type}: {currentSub.paymentMethod.brand} ending in {currentSub.paymentMethod.last4}</span>
                </div>
                <span className="text-[#d2d2d7]">·</span>
                <span className="text-[12px] text-[#86868b]">ACH & PO Invoicing Available</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("ACH Bank Transfer / Purchase Order invoicing request sent to AccessBelt Billing team.")}
                  className="px-3.5 py-2 border border-[#e5e5ea] hover:border-[#d2d2d7] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors cursor-pointer bg-white"
                >
                  Switch to ACH / PO Invoice
                </button>
                <button
                  onClick={() => alert("Stripe Customer Portal redirect simulated.")}
                  className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Manage Payment</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Plan Comparison Cards */}
          <div className="card p-6 space-y-4">
            <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Available SaaS Tiers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Free */}
              <div className="p-4 rounded-xl border border-[#e5e5ea] space-y-3 bg-white">
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">Free Community</h3>
                  <p className="text-xl font-bold text-[#1d1d1f] mt-1">$0 <span className="text-[12px] font-normal text-[#86868b]">/ forever</span></p>
                </div>
                <ul className="text-[12px] text-[#86868b] space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5">✓ 1 Rural/Local site</li>
                  <li className="flex items-center gap-1.5">✓ Live Open/Closed toggle</li>
                  <li className="flex items-center gap-1.5">✓ Address & hours listing</li>
                  <li className="flex items-center gap-1.5">✓ 1 Manager seat</li>
                </ul>
              </div>

              {/* Standard */}
              <div className="p-4 rounded-xl border border-[#e5e5ea] space-y-3 bg-white">
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">Community Standard</h3>
                  <p className="text-xl font-bold text-[#1d1d1f] mt-1">$29 <span className="text-[12px] font-normal text-[#86868b]">/ mo</span></p>
                </div>
                <ul className="text-[12px] text-[#86868b] space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5">✓ Everything in Free</li>
                  <li className="flex items-center gap-1.5">✓ Shift Mode 1-tap controls</li>
                  <li className="flex items-center gap-1.5">✓ 30 broadcasts/mo</li>
                  <li className="flex items-center gap-1.5">✓ 3 team seats</li>
                </ul>
              </div>

              {/* Pro (Current) */}
              <div className="p-4 rounded-xl border-2 border-[#0071e3] bg-[#f5f5f7] space-y-3 relative">
                <span className="absolute -top-2.5 right-4 bg-[#0071e3] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  CURRENT PLAN
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">Community Pro</h3>
                  <p className="text-xl font-bold text-[#1d1d1f] mt-1">$49 <span className="text-[12px] font-normal text-[#86868b]">/ mo</span></p>
                </div>
                <ul className="text-[12px] text-[#86868b] space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5 font-semibold text-[#1d1d1f]">✓ Everything in Standard</li>
                  <li className="flex items-center gap-1.5">✓ 100 broadcasts/mo</li>
                  <li className="flex items-center gap-1.5">✓ 5 team seats & RBAC</li>
                  <li className="flex items-center gap-1.5">✓ Geofencing & Auto-close</li>
                </ul>
              </div>

              {/* Enterprise */}
              <div className="p-4 rounded-xl border border-[#e5e5ea] space-y-3 bg-white">
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">Regional Enterprise</h3>
                  <p className="text-xl font-bold text-[#1d1d1f] mt-1">$149 <span className="text-[12px] font-normal text-[#86868b]">/ mo</span></p>
                </div>
                <ul className="text-[12px] text-[#86868b] space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5">✓ Multi-location switcher</li>
                  <li className="flex items-center gap-1.5">✓ Unlimited broadcasts</li>
                  <li className="flex items-center gap-1.5">✓ Multilingual alerts</li>
                  <li className="flex items-center gap-1.5">✓ ACH / PO Invoicing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Invoice History Table */}
          <div className="card p-6 space-y-4">
            <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Invoice & Receipt History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-[#e5e5ea] text-[#86868b] font-semibold text-[12px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5ea]">
                  {currentSub.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#f5f5f7]/60">
                      <td className="py-3 px-3 font-semibold text-[#1d1d1f]">{inv.date}</td>
                      <td className="py-3 px-3 text-[#86868b]">{inv.amount}</td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#34c759]/10 text-[#34c759] text-[12px] font-semibold">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => alert(`Downloading PDF for invoice ${inv.id}`)}
                          className="text-[12px] text-[#0071e3] hover:underline flex items-center gap-1 justify-end ml-auto cursor-pointer font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                {teamMembers.length} of {currentSub.seatsLimit} seats used on your {currentSub.planName} tier
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
