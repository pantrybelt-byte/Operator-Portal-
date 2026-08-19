/**
 * Domain types — the shape pages and components consume.
 *
 * These are deliberately NOT the Firestore document shapes. The wire format
 * lives in `src/data/schema.ts` and the two are bridged by `src/data/mappers.ts`.
 * Keeping them apart is what lets the consumer app's `resources` contract
 * (nested address map, `verified` boolean, weekday-keyed hours) stay stable
 * while the portal presents whatever is easiest to render.
 *
 * Rules of the domain model:
 *   - Instants are `Date`. Never a pre-formatted string.
 *   - Calendar dates (no time) are ISO `YYYY-MM-DD` strings.
 *   - Derived values are functions, not stored fields.
 */

// ─── Access control ────────────────────────────────────────────────────────

/**
 * Roles as `firestore.rules` understands them, read from the auth token's
 * custom claims. See `src/auth/permissions.ts` for how portal-facing job
 * titles map onto these.
 */
export type ClaimRole =
  | 'state_admin'
  | 'org_admin'
  | 'org_staff'
  | 'read_only_partner'
  | 'field_worker';

/** Custom claims the security rules expect on every operator token. */
export interface OperatorClaims {
  role: ClaimRole;
  orgId: string;
  counties: string[];
}

export type OperatorTitle = 'Manager' | 'Shift Lead' | 'Volunteer';

export interface Operator {
  id: string;
  name: string;
  email: string;
  title: OperatorTitle;
  claims: OperatorClaims;
  avatarUrl?: string;
  pantryId: string;
  pantryName: string;
}

// ─── Pantry ────────────────────────────────────────────────────────────────

/**
 * Whether the pantry is listed in the consumer app at all. This is the
 * `status` field the phone app filters on (`where('status','==','active')`)
 * and is NOT the same thing as being open right now — see `isOpen`.
 */
export type ListingStatus = 'unopened' | 'pending' | 'active' | 'inactive' | 'closed';

export type LocationKind =
  | 'Main Warehouse'
  | 'Satellite Site'
  | 'Mobile Distribution'
  | 'Drive-Thru Only';

export interface PantryLocation {
  id: string;
  name: string;
  kind: LocationKind;
}

export interface PantryInfo {
  id: string;

  /** Owning organisation. Required by every write rule (`ownsOrg`). */
  orgId: string;
  /** Required by `countyOk()` — must be in the caller's `counties` claim. */
  county: string;
  /** Required by `validGeohash()`. Recomputed whenever coordinates move. */
  geohash: string;
  /** Required by `validResourceStatus()`. */
  listingStatus: ListingStatus;

  name: string;
  organization: string;
  ein: string;
  verified: boolean;
  verifiedBy: string;

  street: string;
  city: string;
  state: string;
  zip: string;
  coordinates: { lat: number; lng: number };

  phone: string;
  email: string;
  website: string;
  description: string;
  eligibilityNotes: string;
  docsRequired: string[];
  accessNotes?: string;

  /** Live status. Portal-owned; has no field in the consumer `resources` doc yet. */
  isOpen: boolean;
  openNote: string;
  autoCloseEnabled: boolean;
  autoCloseTime: string;

  capacityPercentage: number;
  servedThisWeek: number;
  updatedAt: Date;

  distributionType: 'Walk-in & Drive-thru' | 'Walk-in Only' | 'Drive-thru Only' | 'Appointment Only';
  locations: PantryLocation[];
}

// ─── Inventory ─────────────────────────────────────────────────────────────

export type InventoryCategory =
  | 'Fresh Produce'
  | 'Canned Goods'
  | 'Dairy & Refrigerated'
  | 'Bakery & Grains'
  | 'Proteins & Meat'
  | 'Baby & Hygiene'
  | 'Prepared Meals';

export type InventoryUnit = 'lbs' | 'boxes' | 'crates' | 'units' | 'cans' | 'bags';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
  id: string;
  orgId: string;
  pantryId: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: InventoryUnit;
  minThreshold: number;
  updatedAt: Date;
  notes?: string;
}

/**
 * Stock state is derived, never stored. The previous model persisted
 * `quantity`, `inStock` and `status` as three independent fields, which drift
 * apart the moment any one of them is written on its own.
 */
export function stockStatus(item: Pick<InventoryItem, 'quantity' | 'minThreshold'>): StockStatus {
  if (item.quantity <= 0) return 'Out of Stock';
  if (item.quantity <= item.minThreshold) return 'Low Stock';
  return 'In Stock';
}

export function isInStock(item: Pick<InventoryItem, 'quantity'>): boolean {
  return item.quantity > 0;
}

// ─── Schedule ──────────────────────────────────────────────────────────────

export type Weekday =
  | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface DaySchedule {
  day: Weekday;
  isOpen: boolean;
  /** 24-hour "HH:MM" — matches the consumer app's `hours.{day}.open`. */
  openTime: string;
  closeTime: string;
  notes?: string;
}

export interface SpecialClosure {
  id: string;
  orgId: string;
  pantryId: string;
  title: string;
  /** Calendar dates, ISO `YYYY-MM-DD`. */
  startDate: string;
  endDate: string;
  reason: string;
}

// ─── Broadcasts ────────────────────────────────────────────────────────────

export type BroadcastPriority = 'normal' | 'important' | 'urgent';

export interface Announcement {
  id: string;
  orgId: string;
  pantryId: string;
  title: string;
  message: string;
  priority: BroadcastPriority;
  createdAt: Date;
  expiresAt: Date;
  sentToApp: boolean;
  viewsCount: number;
  radiusMiles: number;
  language: 'English' | 'Spanish' | 'Bilingual';
  spanishMessage?: string;
}

// ─── Activity ──────────────────────────────────────────────────────────────

export type ActivityType =
  | 'status' | 'inventory' | 'schedule' | 'announcement' | 'profile' | 'location' | 'team';

export interface ActivityItem {
  id: string;
  orgId: string;
  pantryId: string;
  timestamp: Date;
  operatorName: string;
  action: string;
  type: ActivityType;
  details: string;
}

// ─── Team ──────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  orgId: string;
  name: string;
  email: string;
  title: OperatorTitle;
  status: 'Active' | 'Invited';
  lastActive: Date;
}

// ─── Broadcast quota ───────────────────────────────────────────────────────

/** Derived from the day's announcements rather than stored on a plan record. */
export interface BroadcastQuota {
  usedToday: number;
  dailyLimit: number;
}
