import React, { useState } from 'react';
import { UserPlus, Mail, MoreHorizontal, ShieldCheck } from 'lucide-react';
import type { Operator, OperatorTitle, TeamMember } from '../types';
import { formatRelative } from '../lib/datetime';
import { ROLE_SUMMARY, can } from '../auth/permissions';

interface TeamPageProps {
  teamMembers: TeamMember[];
  operator: Operator;
  onInvite: (email: string, title: OperatorTitle) => void;
}

const ROLE_ORDER: OperatorTitle[] = ['Manager', 'Shift Lead', 'Volunteer'];

export const TeamPage: React.FC<TeamPageProps> = ({ teamMembers, operator, onInvite }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OperatorTitle>('Volunteer');
  const [inviteSent, setInviteSent] = useState<string | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.includes('@')) return;
    onInvite(inviteEmail, inviteRole);
    setInviteSent(inviteEmail);
    setInviteEmail('');
    setTimeout(() => setInviteSent(null), 3500);
  };

  const activeCount = teamMembers.filter((m) => m.status === 'Active').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Team &amp; access</h1>
        <p className="page-subtitle">
          Manage who can update this pantry and what they are allowed to change
        </p>
      </div>

      {/* Members */}
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="card-title">Members</h2>
            <p className="text-sm text-fg-muted">
              {activeCount} active · unlimited seats included
            </p>
          </div>
        </div>

        <ul className="divide-y divide-line">
          {teamMembers.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken text-sm font-semibold text-fg-muted">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg">{member.name}</p>
                  <p className="meta truncate">{member.email}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="hidden text-sm text-fg-muted sm:block">{formatRelative(member.lastActive)}</span>
                <span className="badge badge-neutral">{member.title}</span>
                <span
                  className={`badge ${member.status === 'Active' ? 'badge-success' : 'badge-warn'}`}
                >
                  {member.status}
                </span>
                <button
                  className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-sunken hover:text-fg"
                  aria-label={`Manage ${member.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Invite */}
        <section className="card p-5">
          <h2 className="card-title mb-4">Invite a team member</h2>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="invite-email" className="field-label">
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="volunteer@organization.org"
                className="w-full p-2.5"
              />
            </div>

            <div>
              <label htmlFor="invite-role" className="field-label">
                Role
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as OperatorTitle)}
                className="w-full p-2.5"
              >
                <option value="Volunteer">Volunteer</option>
                <option value="Shift Lead">Shift Lead</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3">
              {inviteSent ? (
                <span className="meta flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-success-text" />
                  Invitation sent to {inviteSent}
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="btn btn-primary shrink-0"
                disabled={!can(operator.title, 'team:manage')}
                title={can(operator.title, 'team:manage') ? undefined : 'Only a Manager can invite people'}
              >
                <UserPlus className="h-4 w-4" />
                Send invitation
              </button>
            </div>
          </form>
        </section>

        {/* Permissions */}
        <section className="card p-5">
          <h2 className="card-title mb-4">What each role can do</h2>
          <ul className="divide-y divide-line">
            {ROLE_ORDER.map((role) => (
              <li key={role} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-fg">{role}</p>
                <p className="mt-0.5 text-sm text-fg-muted">{ROLE_SUMMARY[role]}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Account standing */}
      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success-text" />
          <div>
            <p className="text-sm font-semibold text-fg">
              No cost to your pantry
            </p>
            <p className="text-sm text-fg-muted">
              AccessBelt is funded by regional agency partners. There is no billing, no seat limit,
              and no payment method on file.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
