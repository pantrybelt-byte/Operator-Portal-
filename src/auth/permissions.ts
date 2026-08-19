/**
 * Portal job titles -> `firestore.rules` roles, and what each may do.
 *
 * ── The mapping, and one caveat worth knowing ──────────────────────────────
 *
 * The rules gate writes to `resources` behind `isOrgStaff()`, which is
 * `role in ['org_staff', 'org_admin', 'state_admin']`. `field_worker` is NOT
 * in that set — it only satisfies `isReadPartner()`, which is read-only.
 *
 * Volunteers must be able to set open/closed status during a shift; that is
 * the whole point of Shift Mode. So Volunteer maps to `org_staff`, not
 * `field_worker`.
 *
 * The consequence: the finer distinctions below (a Volunteer cannot send a
 * broadcast, cannot edit the profile) are enforced by THIS FILE ONLY — in the
 * UI. At the database level a Volunteer currently has the same write reach as
 * a Shift Lead. Closing that gap needs either a narrower rules path keyed on
 * the fields being written, or a new role. Until then, treat these as
 * guard-rails against mistakes, not as a security boundary.
 */
import type { ClaimRole, OperatorTitle } from '../types';

export const TITLE_TO_CLAIM_ROLE: Record<OperatorTitle, ClaimRole> = {
  Manager: 'org_admin',
  'Shift Lead': 'org_staff',
  Volunteer: 'org_staff',
};

export const CLAIM_ROLE_TO_TITLE: Record<ClaimRole, OperatorTitle> = {
  state_admin: 'Manager',
  org_admin: 'Manager',
  org_staff: 'Shift Lead',
  read_only_partner: 'Volunteer',
  field_worker: 'Volunteer',
};

export type Capability =
  | 'status:write'
  | 'inventory:write'
  | 'schedule:write'
  | 'broadcast:send'
  | 'profile:write'
  | 'team:manage';

const CAPABILITIES: Record<OperatorTitle, Capability[]> = {
  Manager: [
    'status:write', 'inventory:write', 'schedule:write',
    'broadcast:send', 'profile:write', 'team:manage',
  ],
  'Shift Lead': ['status:write', 'inventory:write', 'schedule:write', 'broadcast:send'],
  Volunteer: ['status:write', 'inventory:write'],
};

export function can(title: OperatorTitle, capability: Capability): boolean {
  return CAPABILITIES[title]?.includes(capability) ?? false;
}

/** Human-readable summary used on the Team page, generated from one source. */
export const ROLE_SUMMARY: Record<OperatorTitle, string> = {
  Manager:
    'Full access. Can edit the pantry profile, manage the team, and change verification details.',
  'Shift Lead':
    'Can set status, update inventory, edit operating hours, and send broadcasts during a shift.',
  Volunteer: 'Can set status and update stock availability. Cannot send broadcasts.',
};

/**
 * A county outside the caller's `counties` claim fails `countyOk()` and the
 * write is rejected. Checking here turns a cryptic permission-denied into a
 * message the operator can act on.
 */
export function coversCounty(counties: string[], county: string, role: ClaimRole): boolean {
  return role === 'state_admin' || counties.includes(county);
}
