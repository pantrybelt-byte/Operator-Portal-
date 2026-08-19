/**
 * The seam between the UI and its data source.
 *
 * Pages never import Firestore, mock data, or the SDK — they call this
 * interface. Going live means returning `FirestoreRepository` instead of
 * `MockRepository` from `src/data/index.ts`; no component changes.
 *
 * Every method is async and may throw. Callers are expected to surface
 * loading and error states rather than assuming success — see `useAsyncData`.
 */
import type {
  ActivityItem,
  Announcement,
  BroadcastQuota,
  DaySchedule,
  InventoryItem,
  Operator,
  PantryInfo,
  SpecialClosure,
  TeamMember,
} from '../types';

/** Everything the shell needs before it can render a pantry's workspace. */
export interface WorkspaceSnapshot {
  operator: Operator;
  pantry: PantryInfo;
  inventory: InventoryItem[];
  schedule: DaySchedule[];
  closures: SpecialClosure[];
  announcements: Announcement[];
  activity: ActivityItem[];
  team: TeamMember[];
  quota: BroadcastQuota;
}

export interface DataRepository {
  /** Identifies which implementation is active, for the status indicator. */
  readonly mode: 'Demo Data' | 'Firestore Live';

  loadWorkspace(): Promise<WorkspaceSnapshot>;

  /** Writes to `resources.liveStatus` and the operator `liveStatus` doc. */
  setLiveStatus(input: { isOpen: boolean; note: string }): Promise<void>;

  /** Patches the shared `resources` document. */
  savePantry(pantry: PantryInfo, schedule: DaySchedule[]): Promise<void>;

  saveSchedule(schedule: DaySchedule[]): Promise<void>;

  addInventoryItem(input: Omit<InventoryItem, 'id' | 'orgId' | 'pantryId' | 'updatedAt'>): Promise<InventoryItem>;
  updateInventoryItem(item: InventoryItem): Promise<void>;
  deleteInventoryItem(id: string): Promise<void>;

  addClosure(input: Omit<SpecialClosure, 'id' | 'orgId' | 'pantryId'>): Promise<SpecialClosure>;
  deleteClosure(id: string): Promise<void>;

  sendBroadcast(
    input: Pick<Announcement, 'title' | 'message' | 'priority' | 'language' | 'radiusMiles'> & {
      expiresInHours: number;
    }
  ): Promise<Announcement>;
  deleteBroadcast(id: string): Promise<void>;

  inviteTeamMember(input: Pick<TeamMember, 'email' | 'title'>): Promise<TeamMember>;

  /** Appended on every mutation so the activity feed reflects real writes. */
  recordActivity(input: Omit<ActivityItem, 'id' | 'orgId' | 'pantryId' | 'timestamp'>): Promise<ActivityItem>;
}

/** Client-side id for optimistic inserts, replaced by Firestore's on commit. */
export function newId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${random}`;
}
