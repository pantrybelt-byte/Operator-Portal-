/**
 * In-memory repository backed by `mockData.ts`.
 *
 * Deliberately asynchronous with a small artificial latency: it is the only
 * way loading states, disabled buttons and optimistic rollback get exercised
 * before a real network is involved. A synchronous mock hides exactly the
 * bugs that appear on the first slow connection.
 */
import type {
  ActivityItem, Announcement, DaySchedule, InventoryItem,
  SpecialClosure, TeamMember,
} from '../types';
import {
  mockActivity, mockAnnouncements, mockClosures, mockInventory, mockOperator,
  mockPantry, mockSchedule, mockTeamMembers, DEMO_ORG_ID, DEMO_PANTRY_ID,
} from './mockData';
import { newId, type DataRepository, type WorkspaceSnapshot } from './repository';
import { isSameDay } from '../lib/datetime';

const LATENCY_MS = 220;
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS));

const DAILY_BROADCAST_LIMIT = 2;

export class MockRepository implements DataRepository {
  readonly mode = 'Demo Data' as const;

  private pantry = { ...mockPantry };
  private inventory = [...mockInventory];
  private schedule = [...mockSchedule];
  private closures = [...mockClosures];
  private announcements = [...mockAnnouncements];
  private activity = [...mockActivity];
  private team = [...mockTeamMembers];

  async loadWorkspace(): Promise<WorkspaceSnapshot> {
    await delay();
    return {
      operator: mockOperator,
      pantry: this.pantry,
      inventory: this.inventory,
      schedule: this.schedule,
      closures: this.closures,
      announcements: this.announcements,
      activity: this.activity,
      team: this.team,
      quota: {
        usedToday: this.announcements.filter((a) => isSameDay(a.createdAt, new Date())).length,
        dailyLimit: DAILY_BROADCAST_LIMIT,
      },
    };
  }

  async setLiveStatus({ isOpen, note }: { isOpen: boolean; note: string }): Promise<void> {
    await delay();
    this.pantry = { ...this.pantry, isOpen, openNote: note, updatedAt: new Date() };
  }

  async savePantry(pantry: import('../types').PantryInfo, schedule: DaySchedule[]): Promise<void> {
    await delay();
    this.pantry = { ...pantry, updatedAt: new Date() };
    this.schedule = schedule;
  }

  async saveSchedule(schedule: DaySchedule[]): Promise<void> {
    await delay();
    this.schedule = schedule;
  }

  async addInventoryItem(
    input: Omit<InventoryItem, 'id' | 'orgId' | 'pantryId' | 'updatedAt'>
  ): Promise<InventoryItem> {
    await delay();
    const created: InventoryItem = {
      ...input,
      id: newId('inv'),
      orgId: DEMO_ORG_ID,
      pantryId: DEMO_PANTRY_ID,
      updatedAt: new Date(),
    };
    this.inventory = [created, ...this.inventory];
    return created;
  }

  async updateInventoryItem(updated: InventoryItem): Promise<void> {
    await delay();
    this.inventory = this.inventory.map((i) => (i.id === updated.id ? updated : i));
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await delay();
    this.inventory = this.inventory.filter((i) => i.id !== id);
  }

  async addClosure(
    input: Omit<SpecialClosure, 'id' | 'orgId' | 'pantryId'>
  ): Promise<SpecialClosure> {
    await delay();
    const created: SpecialClosure = {
      ...input, id: newId('close'), orgId: DEMO_ORG_ID, pantryId: DEMO_PANTRY_ID,
    };
    this.closures = [...this.closures, created];
    return created;
  }

  async deleteClosure(id: string): Promise<void> {
    await delay();
    this.closures = this.closures.filter((c) => c.id !== id);
  }

  async sendBroadcast(
    input: Pick<Announcement, 'title' | 'message' | 'priority' | 'language' | 'radiusMiles'> & {
      expiresInHours: number;
    }
  ): Promise<Announcement> {
    await delay();
    const created: Announcement = {
      id: newId('ann'),
      orgId: DEMO_ORG_ID,
      pantryId: DEMO_PANTRY_ID,
      title: input.title,
      message: input.message,
      priority: input.priority,
      language: input.language,
      radiusMiles: input.radiusMiles,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + input.expiresInHours * 3_600_000),
      // False until a delivery function actually fans out to devices. The
      // demo does not pretend a push was sent.
      sentToApp: false,
      viewsCount: 0,
    };
    this.announcements = [created, ...this.announcements];
    return created;
  }

  async deleteBroadcast(id: string): Promise<void> {
    await delay();
    this.announcements = this.announcements.filter((a) => a.id !== id);
  }

  async inviteTeamMember(input: Pick<TeamMember, 'email' | 'title'>): Promise<TeamMember> {
    await delay();
    const created: TeamMember = {
      id: newId('team'),
      orgId: DEMO_ORG_ID,
      name: input.email.split('@')[0],
      email: input.email,
      title: input.title,
      status: 'Invited',
      lastActive: new Date(),
    };
    this.team = [...this.team, created];
    return created;
  }

  async recordActivity(
    input: Omit<ActivityItem, 'id' | 'orgId' | 'pantryId' | 'timestamp'>
  ): Promise<ActivityItem> {
    const created: ActivityItem = {
      ...input,
      id: newId('act'),
      orgId: DEMO_ORG_ID,
      pantryId: DEMO_PANTRY_ID,
      timestamp: new Date(),
    };
    this.activity = [created, ...this.activity];
    return created;
  }
}
