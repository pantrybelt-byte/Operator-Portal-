/**
 * Domain <-> Firestore translation.
 *
 * Every shape difference between the portal's view model and the consumer
 * app's `resources` contract is resolved here and nowhere else:
 *
 *   flat street/city/state/zip   <->  address: { street, city, state, zip }
 *   verified: boolean            <->  verified (portal renders a label)
 *   DaySchedule[]                <->  hours: { monday: { open, close, closed } }
 *   Date                         <->  Timestamp
 *   coordinates                  ->   geohash (recomputed, never trusted)
 */
import { encodeGeohash } from '../lib/geohash';
import type {
  ActivityItem,
  Announcement,
  DaySchedule,
  InventoryItem,
  PantryInfo,
  SpecialClosure,
  Weekday,
} from '../types';
import {
  toDate,
  type ActivityDoc,
  type BroadcastDoc,
  type ClosureDoc,
  type HoursMapDoc,
  type InventoryDoc,
  type ResourceDoc,
} from './schema';

const WEEKDAYS: Weekday[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

// ─── Hours ─────────────────────────────────────────────────────────────────

export function scheduleToHoursMap(schedule: DaySchedule[]): HoursMapDoc {
  const map: HoursMapDoc = {};
  for (const day of schedule) {
    map[day.day.toLowerCase()] = {
      open: day.openTime,
      close: day.closeTime,
      closed: !day.isOpen,
      ...(day.notes ? { notes: day.notes } : {}),
    };
  }
  return map;
}

export function hoursMapToSchedule(hours: HoursMapDoc | undefined): DaySchedule[] {
  return WEEKDAYS.map((day) => {
    const entry = hours?.[day.toLowerCase()];
    return {
      day,
      isOpen: entry ? !entry.closed : false,
      openTime: entry?.open ?? '09:00',
      closeTime: entry?.close ?? '17:00',
      notes: entry?.notes,
    };
  });
}

// ─── Pantry <-> resource ───────────────────────────────────────────────────

export function resourceDocToPantry(
  id: string,
  doc: ResourceDoc,
  locations: PantryInfo['locations'] = []
): PantryInfo {
  return {
    id,
    orgId: doc.orgId,
    county: doc.county,
    geohash: doc.geohash,
    listingStatus: doc.status,

    name: doc.name,
    organization: doc.organization ?? '',
    ein: doc.ein ?? '',
    verified: doc.verified,
    verifiedBy: doc.verifiedBy ?? '',

    street: doc.address?.street ?? '',
    city: doc.address?.city ?? '',
    state: doc.address?.state ?? '',
    zip: doc.address?.zip ?? '',
    coordinates: doc.coordinates,

    phone: doc.phone ?? '',
    email: doc.email ?? '',
    website: doc.website ?? '',
    description: doc.description ?? '',
    eligibilityNotes: doc.eligibilityNotes ?? '',
    docsRequired: doc.docsRequired ?? [],
    accessNotes: doc.accessNotes,

    isOpen: doc.liveStatus?.isOpen ?? false,
    openNote: doc.liveStatus?.note ?? '',
    autoCloseEnabled: false,
    autoCloseTime: '16:00',

    capacityPercentage: 0,
    servedThisWeek: 0,
    updatedAt: toDate(doc.updatedAt),

    distributionType: 'Walk-in & Drive-thru',
    locations,
  };
}

/**
 * Fields of `resources` this portal is allowed to write.
 *
 * `orgId` is omitted on purpose: `orgUnchanged()` rejects any update that
 * moves a resource between organisations, so it must never appear in an
 * update payload. Include it only on create, via `resourceCreatePayload`.
 */
export function pantryToResourcePatch(
  pantry: PantryInfo,
  schedule?: DaySchedule[]
): Omit<ResourceDoc, 'orgId' | 'updatedAt' | 'type'> {
  return {
    county: pantry.county,
    status: pantry.listingStatus,
    // Never trust a stored geohash — recompute from the coordinates being written.
    geohash: encodeGeohash(pantry.coordinates.lat, pantry.coordinates.lng),
    coordinates: pantry.coordinates,

    name: pantry.name,
    address: {
      street: pantry.street,
      city: pantry.city,
      state: pantry.state,
      zip: pantry.zip,
    },
    phone: pantry.phone,
    email: pantry.email,
    website: pantry.website,
    verified: pantry.verified,
    verifiedBy: pantry.verifiedBy,
    ein: pantry.ein,
    organization: pantry.organization,
    description: pantry.description,
    eligibilityNotes: pantry.eligibilityNotes,
    docsRequired: pantry.docsRequired,
    accessNotes: pantry.accessNotes,
    hours: scheduleToHoursMap(schedule ?? []),
  };
}

// ─── Inventory ─────────────────────────────────────────────────────────────

export function inventoryDocToItem(id: string, doc: InventoryDoc): InventoryItem {
  return {
    id,
    orgId: doc.orgId,
    pantryId: doc.pantryId,
    name: doc.name,
    category: doc.category as InventoryItem['category'],
    quantity: doc.quantity,
    unit: doc.unit as InventoryItem['unit'],
    minThreshold: doc.minThreshold,
    notes: doc.notes,
    updatedAt: toDate(doc.updatedAt),
  };
}

export function itemToInventoryDoc(item: InventoryItem): Omit<InventoryDoc, 'updatedAt'> {
  return {
    orgId: item.orgId,
    pantryId: item.pantryId,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    minThreshold: item.minThreshold,
    ...(item.notes ? { notes: item.notes } : {}),
  };
}

// ─── Broadcasts ────────────────────────────────────────────────────────────

export function broadcastDocToAnnouncement(id: string, doc: BroadcastDoc): Announcement {
  return {
    id,
    orgId: doc.orgId,
    pantryId: doc.pantryId,
    title: doc.title,
    message: doc.message,
    spanishMessage: doc.spanishMessage,
    language: doc.language as Announcement['language'],
    priority: doc.priority,
    radiusMiles: doc.radiusMiles,
    sentToApp: doc.sentToApp,
    viewsCount: doc.viewsCount,
    createdAt: toDate(doc.createdAt),
    expiresAt: toDate(doc.expiresAt),
  };
}

// ─── Closures ──────────────────────────────────────────────────────────────

export function closureDocToClosure(id: string, doc: ClosureDoc): SpecialClosure {
  return {
    id,
    orgId: doc.orgId,
    pantryId: doc.pantryId,
    title: doc.title,
    startDate: doc.startDate,
    endDate: doc.endDate,
    reason: doc.reason,
  };
}

// ─── Activity ──────────────────────────────────────────────────────────────

export function activityDocToItem(id: string, doc: ActivityDoc): ActivityItem {
  return {
    id,
    orgId: doc.orgId,
    pantryId: doc.pantryId,
    operatorName: doc.operatorName,
    action: doc.action,
    type: doc.type as ActivityItem['type'],
    details: doc.details,
    timestamp: toDate(doc.timestamp),
  };
}
