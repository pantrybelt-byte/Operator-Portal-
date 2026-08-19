/**
 * Live Firestore repository.
 *
 * NOT YET VERIFIED. Written against the deployed `firestore.rules` contract but NOT yet
 * exercised against a real project — there are no credentials in this repo
 * and `VITE_USE_FIREBASE` is false. Treat the first run against a live
 * project as the real test. `docs/firestore-integration.md` lists what to
 * verify, in order.
 *
 * Two rules constraints shape everything here:
 *
 *   1. `orgUnchanged()` rejects any update whose payload contains a different
 *      `orgId` than the stored document, so updates never send `orgId` at all.
 *   2. `countyOk()` checks the county against the caller's `counties` claim,
 *      so a pantry can only be edited by someone whose token covers it.
 */
import {
  collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query,
  serverTimestamp, setDoc, updateDoc, where, addDoc, Timestamp,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getOperatorDb, getSharedDb } from '../services/firebase';
import { OPERATOR, SHARED, type ResourceDoc } from './schema';
import {
  activityDocToItem, broadcastDocToAnnouncement, closureDocToClosure,
  hoursMapToSchedule, inventoryDocToItem, itemToInventoryDoc,
  pantryToResourcePatch, resourceDocToPantry, scheduleToHoursMap,
} from './mappers';
import type { DataRepository, WorkspaceSnapshot } from './repository';
import type {
  ActivityItem, Announcement, DaySchedule, InventoryItem, Operator,
  PantryInfo, SpecialClosure, TeamMember,
} from '../types';
import { isSameDay } from '../lib/datetime';

const DAILY_BROADCAST_LIMIT = 2;
const ACTIVITY_PAGE_SIZE = 25;

export class FirestoreRepository implements DataRepository {
  readonly mode = 'Firestore Live' as const;

  private readonly operator: Operator;
  private readonly pantryId: string;

  constructor(operator: Operator, pantryId: string) {
    this.operator = operator;
    this.pantryId = pantryId;
  }

  private get orgId() {
    return this.operator.claims.orgId;
  }

  private shared(): Firestore {
    const db = getSharedDb();
    if (!db) throw new Error('Shared Firestore database unavailable');
    return db;
  }

  private opDb(): Firestore {
    const db = getOperatorDb();
    if (!db) throw new Error('Operator Firestore database unavailable');
    return db;
  }

  /** Every portal-owned collection is scoped to one org + one pantry. */
  private scoped(name: string) {
    return query(
      collection(this.opDb(), name),
      where('orgId', '==', this.orgId),
      where('pantryId', '==', this.pantryId)
    );
  }

  async loadWorkspace(): Promise<WorkspaceSnapshot> {
    const resourceRef = doc(this.shared(), SHARED.resources, this.pantryId);

    const [resourceSnap, inventorySnap, closuresSnap, broadcastsSnap, activitySnap, teamSnap] =
      await Promise.all([
        getDoc(resourceRef),
        getDocs(this.scoped(OPERATOR.inventory)),
        getDocs(this.scoped(OPERATOR.closures)),
        getDocs(query(this.scoped(OPERATOR.broadcasts), orderBy('createdAt', 'desc'), limit(50))),
        getDocs(query(this.scoped(OPERATOR.activity), orderBy('timestamp', 'desc'), limit(ACTIVITY_PAGE_SIZE))),
        getDocs(query(collection(this.shared(), SHARED.users), where('orgId', '==', this.orgId))),
      ]);

    if (!resourceSnap.exists()) {
      throw new Error(`Pantry ${this.pantryId} not found in ${SHARED.resources}`);
    }

    const resource = resourceSnap.data() as ResourceDoc;
    const pantry = resourceDocToPantry(resourceSnap.id, resource);
    const announcements = broadcastsSnap.docs.map((d) =>
      broadcastDocToAnnouncement(d.id, d.data() as never)
    );

    return {
      operator: this.operator,
      pantry,
      schedule: hoursMapToSchedule(resource.hours),
      inventory: inventorySnap.docs.map((d) => inventoryDocToItem(d.id, d.data() as never)),
      closures: closuresSnap.docs.map((d) => closureDocToClosure(d.id, d.data() as never)),
      announcements,
      activity: activitySnap.docs.map((d) => activityDocToItem(d.id, d.data() as never)),
      team: teamSnap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          orgId: this.orgId,
          name: String(data.name ?? ''),
          email: String(data.email ?? ''),
          title: (data.title as TeamMember['title']) ?? 'Volunteer',
          status: (data.status as TeamMember['status']) ?? 'Active',
          lastActive: (data.lastActive as Timestamp | undefined)?.toDate() ?? new Date(0),
        };
      }),
      quota: {
        usedToday: announcements.filter((a) => isSameDay(a.createdAt, new Date())).length,
        dailyLimit: DAILY_BROADCAST_LIMIT,
      },
    };
  }

  /**
   * Live status is written twice: an operator-database record (the source of
   * truth, with who changed it) and a mirror onto the resource so the
   * consumer app can read it without a second query once its read path
   * includes `liveStatus`.
   */
  async setLiveStatus({ isOpen, note }: { isOpen: boolean; note: string }): Promise<void> {
    const statusRef = doc(this.opDb(), OPERATOR.liveStatus, this.pantryId);
    await setDoc(
      statusRef,
      {
        orgId: this.orgId,
        pantryId: this.pantryId,
        isOpen,
        note,
        updatedBy: this.operator.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await updateDoc(doc(this.shared(), SHARED.resources, this.pantryId), {
      'liveStatus.isOpen': isOpen,
      'liveStatus.note': note,
      'liveStatus.updatedAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async savePantry(pantry: PantryInfo, schedule: DaySchedule[]): Promise<void> {
    // No orgId in the payload — `orgUnchanged()` rejects updates that carry one.
    await updateDoc(doc(this.shared(), SHARED.resources, this.pantryId), {
      ...pantryToResourcePatch(pantry, schedule),
      updatedAt: serverTimestamp(),
    });
  }

  async saveSchedule(schedule: DaySchedule[]): Promise<void> {
    await updateDoc(doc(this.shared(), SHARED.resources, this.pantryId), {
      hours: scheduleToHoursMap(schedule),
      updatedAt: serverTimestamp(),
    });
  }

  async addInventoryItem(
    input: Omit<InventoryItem, 'id' | 'orgId' | 'pantryId' | 'updatedAt'>
  ): Promise<InventoryItem> {
    const payload = {
      ...itemToInventoryDoc({
        ...input,
        id: '',
        orgId: this.orgId,
        pantryId: this.pantryId,
        updatedAt: new Date(),
      }),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(this.opDb(), OPERATOR.inventory), payload);
    return { ...input, id: ref.id, orgId: this.orgId, pantryId: this.pantryId, updatedAt: new Date() };
  }

  async updateInventoryItem(item: InventoryItem): Promise<void> {
    await updateDoc(doc(this.opDb(), OPERATOR.inventory, item.id), {
      ...itemToInventoryDoc(item),
      updatedAt: serverTimestamp(),
    });
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await deleteDoc(doc(this.opDb(), OPERATOR.inventory, id));
  }

  async addClosure(
    input: Omit<SpecialClosure, 'id' | 'orgId' | 'pantryId'>
  ): Promise<SpecialClosure> {
    const ref = await addDoc(collection(this.opDb(), OPERATOR.closures), {
      ...input,
      orgId: this.orgId,
      pantryId: this.pantryId,
    });
    return { ...input, id: ref.id, orgId: this.orgId, pantryId: this.pantryId };
  }

  async deleteClosure(id: string): Promise<void> {
    await deleteDoc(doc(this.opDb(), OPERATOR.closures, id));
  }

  /**
   * Writes the broadcast record only. `sentToApp` stays false until a
   * delivery function fans out to devices — the client must never claim a
   * push was delivered when no push infrastructure has run.
   */
  async sendBroadcast(
    input: Pick<Announcement, 'title' | 'message' | 'priority' | 'language' | 'radiusMiles'> & {
      expiresInHours: number;
    }
  ): Promise<Announcement> {
    const expiresAt = new Date(Date.now() + input.expiresInHours * 3_600_000);
    const ref = await addDoc(collection(this.opDb(), OPERATOR.broadcasts), {
      orgId: this.orgId,
      pantryId: this.pantryId,
      title: input.title,
      message: input.message,
      language: input.language,
      priority: input.priority,
      radiusMiles: input.radiusMiles,
      sentToApp: false,
      viewsCount: 0,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    return {
      ...input,
      id: ref.id,
      orgId: this.orgId,
      pantryId: this.pantryId,
      createdAt: new Date(),
      expiresAt,
      sentToApp: false,
      viewsCount: 0,
    };
  }

  async deleteBroadcast(id: string): Promise<void> {
    await deleteDoc(doc(this.opDb(), OPERATOR.broadcasts, id));
  }

  /**
   * Creating the invitation record is all the client may do. Granting the
   * `role`/`orgId`/`counties` claims requires the Admin SDK, so a callable
   * function has to pick this up — see docs/firestore-integration.md.
   */
  async inviteTeamMember(input: Pick<TeamMember, 'email' | 'title'>): Promise<TeamMember> {
    const ref = await addDoc(collection(this.shared(), SHARED.users), {
      orgId: this.orgId,
      email: input.email,
      title: input.title,
      status: 'Invited',
      invitedBy: this.operator.id,
      invitedAt: serverTimestamp(),
    });

    return {
      id: ref.id,
      orgId: this.orgId,
      name: input.email.split('@')[0],
      email: input.email,
      title: input.title,
      status: 'Invited',
      lastActive: new Date(),
    };
  }

  async recordActivity(
    input: Omit<ActivityItem, 'id' | 'orgId' | 'pantryId' | 'timestamp'>
  ): Promise<ActivityItem> {
    const ref = await addDoc(collection(this.opDb(), OPERATOR.activity), {
      orgId: this.orgId,
      pantryId: this.pantryId,
      operatorId: this.operator.id,
      operatorName: input.operatorName,
      action: input.action,
      type: input.type,
      details: input.details,
      timestamp: serverTimestamp(),
    });

    return {
      ...input,
      id: ref.id,
      orgId: this.orgId,
      pantryId: this.pantryId,
      timestamp: new Date(),
    };
  }
}
