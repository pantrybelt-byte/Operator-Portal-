/**
 * Firestore wire format.
 *
 * These interfaces describe documents exactly as they sit in Firestore, so a
 * mismatch with `firestore.rules` is a type error here rather than a rejected
 * write at runtime.
 *
 * ── Where things live ──────────────────────────────────────────────────────
 *
 * Two databases, deliberately:
 *
 *   (default)                  project `pantrybelt-1e7eb`, shared with the
 *                              consumer Expo app. Contains `resources` — the
 *                              collection the phone app reads with
 *                              `where('status','==','active')`. The portal
 *                              writes pantry identity, address, hours and
 *                              coordinates straight into it so operator edits
 *                              are visible to families immediately, with no
 *                              sync step to fall behind or fail silently.
 *
 *   accessbelt-operator        named database, portal-owned. Holds the
 *                              concepts `resources` has no field for:
 *                              inventory, broadcasts, closures, activity.
 *                              Every document is keyed by `orgId` + `pantryId`
 *                              so it can be joined back to a resource.
 *
 * The one field that spans both is live open/closed state. `resources` has no
 * place for it today, so `LiveStatusDoc` below is written to the operator
 * database AND mirrored onto the resource as `liveStatus`. Adding that field
 * to the consumer app's read path is the last step to close the loop — until
 * then Shift Mode changes are recorded correctly but not yet surfaced to
 * families. See docs/firestore-integration.md.
 */

// ─── Collection paths ──────────────────────────────────────────────────────

/** Collections in the shared `(default)` database. */
export const SHARED = {
  resources: 'resources',
  organizations: 'organizations',
  users: 'users',
} as const;

/** Collections in the portal-owned `accessbelt-operator` database. */
export const OPERATOR = {
  inventory: 'inventory',
  broadcasts: 'broadcasts',
  closures: 'closures',
  activity: 'activity',
  liveStatus: 'liveStatus',
} as const;

// ─── Shared: `resources` ───────────────────────────────────────────────────

/** Weekday-keyed hours map, as the consumer app's `formatHours()` expects. */
export interface HoursMapDoc {
  [weekday: string]: { open: string; close: string; closed: boolean; notes?: string } | undefined;
}

/**
 * A document in `(default)/resources`.
 *
 * Every field the security rules validate is non-optional here:
 * `orgId` (ownsOrg), `county` (countyOk), `status` (validResourceStatus),
 * `coordinates` (validCoordinates), `geohash` (validGeohash).
 */
export interface ResourceDoc {
  orgId: string;
  county: string;
  status: 'unopened' | 'pending' | 'active' | 'inactive' | 'closed';
  geohash: string;
  coordinates: { lat: number; lng: number };

  name: string;
  type: 'Pantry' | 'Hub';
  address: { street: string; city: string; state: string; zip: string };
  phone: string;
  email?: string;
  website: string;
  verified: boolean;
  verifiedBy?: string;
  ein?: string;
  organization?: string;
  description?: string;
  eligibilityNotes: string;
  docsRequired: string[];
  accessNotes?: string;
  hours: HoursMapDoc;

  /**
   * Live open/closed state, mirrored from the operator database.
   * Not yet read by the consumer app — see the module comment.
   */
  liveStatus?: {
    isOpen: boolean;
    note: string;
    updatedAt: FirestoreTimestamp;
  };

  updatedAt: FirestoreTimestamp;
}

// ─── Operator database ─────────────────────────────────────────────────────

export interface InventoryDoc {
  orgId: string;
  pantryId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  notes?: string;
  updatedAt: FirestoreTimestamp;
}

export interface BroadcastDoc {
  orgId: string;
  pantryId: string;
  title: string;
  message: string;
  spanishMessage?: string;
  language: string;
  priority: 'normal' | 'important' | 'urgent';
  radiusMiles: number;
  /** Written by the delivery function once fan-out succeeds, not by the client. */
  sentToApp: boolean;
  viewsCount: number;
  createdAt: FirestoreTimestamp;
  expiresAt: FirestoreTimestamp;
}

export interface ClosureDoc {
  orgId: string;
  pantryId: string;
  title: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ActivityDoc {
  orgId: string;
  pantryId: string;
  operatorId: string;
  operatorName: string;
  action: string;
  type: string;
  details: string;
  timestamp: FirestoreTimestamp;
}

export interface LiveStatusDoc {
  orgId: string;
  pantryId: string;
  isOpen: boolean;
  note: string;
  updatedBy: string;
  updatedAt: FirestoreTimestamp;
}

// ─── Timestamp seam ────────────────────────────────────────────────────────

/**
 * Structural stand-in for `firebase/firestore`'s `Timestamp`, so this module
 * (and anything importing it) stays free of the SDK. The real class satisfies
 * this shape; `mappers.ts` accepts either it or a plain `Date`.
 */
export interface FirestoreTimestamp {
  toDate(): Date;
  seconds?: number;
}

export function isFirestoreTimestamp(value: unknown): value is FirestoreTimestamp {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as FirestoreTimestamp).toDate === 'function'
  );
}

/** Firestore `Timestamp | Date | undefined` -> `Date`. */
export function toDate(value: unknown, fallback: Date = new Date()): Date {
  if (value instanceof Date) return value;
  if (isFirestoreTimestamp(value)) return value.toDate();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}
