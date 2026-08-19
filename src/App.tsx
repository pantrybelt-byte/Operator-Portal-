/**
 * Application shell.
 *
 * Responsibilities, in order:
 *   1. Gate on authentication — no route renders without a signed-in operator.
 *   2. Build the repository for that operator (mock or Firestore).
 *   3. Load the workspace once, then apply every mutation optimistically
 *      with rollback on failure.
 *
 * Pages receive plain data and callbacks. None of them know whether the data
 * came from Firestore or from `mockData.ts`.
 */
import { useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ShiftModePage } from './pages/ShiftModePage';
import { InventoryPage } from './pages/InventoryPage';
import { HoursPage } from './pages/HoursPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { TeamPage } from './pages/TeamPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { useAuth } from './auth/AuthContext';
import { createRepository } from './data';
import { useWorkspace } from './hooks/useWorkspace';
import { ErrorState, PageSkeleton } from './components/states';
import type {
  ActivityItem, Announcement, DaySchedule, InventoryItem, Operator,
  PantryInfo, SpecialClosure,
} from './types';

export default function App() {
  const { operator, status, error } = useAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-canvas p-8">
        <PageSkeleton />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <ErrorState title="Cannot sign you in" message={error ?? 'Unknown error.'} />
      </div>
    );
  }

  if (!operator) return <LoginPage />;

  return <Workspace operator={operator} />;
}

function Workspace({ operator }: { operator: Operator }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Rebuilt only when the operator changes, so the workspace is not reloaded
  // on every render.
  const repository = useMemo(() => createRepository(operator), [operator]);
  const workspace = useWorkspace(repository);
  const { data, mutate, patch } = workspace;

  const logActivity = (
    entry: Omit<ActivityItem, 'id' | 'orgId' | 'pantryId' | 'timestamp'>
  ) => {
    // Appending after the write keeps the feed a record of what happened,
    // not of what was attempted.
    void repository
      .recordActivity(entry)
      .then((created) => patch((s) => ({ ...s, activity: [created, ...s.activity] })))
      .catch(() => {
        /* A missing log line must never fail the action it describes. */
      });
  };

  if (workspace.status === 'loading' || !data) {
    return (
      <div className="min-h-screen bg-canvas p-8">
        <PageSkeleton />
      </div>
    );
  }

  if (workspace.status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <ErrorState
          message={workspace.error ?? 'Could not load your pantry.'}
          onRetry={workspace.reload}
        />
      </div>
    );
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  const setLiveStatus = async (isOpen: boolean, note: string) => {
    const ok = await mutate(
      (s) => ({ ...s, pantry: { ...s.pantry, isOpen, openNote: note, updatedAt: new Date() } }),
      () => repository.setLiveStatus({ isOpen, note }),
      'Your status was not saved and families still see the previous status.'
    );
    if (ok) {
      logActivity({
        operatorName: operator.name,
        action: 'Status updated',
        type: 'status',
        details: `Set status to ${isOpen ? 'open' : 'closed'}: "${note}"`,
      });
    }
  };

  const savePantry = async (updated: PantryInfo) => {
    const ok = await mutate(
      (s) => ({ ...s, pantry: updated }),
      () => repository.savePantry(updated, data.schedule),
      'Your profile changes were not saved.'
    );
    if (ok) {
      logActivity({
        operatorName: operator.name,
        action: 'Profile updated',
        type: 'profile',
        details: `Updated details for ${updated.name}`,
      });
    }
  };

  const saveSchedule = async (schedule: DaySchedule[]) => {
    const ok = await mutate(
      (s) => ({ ...s, schedule }),
      () => repository.saveSchedule(schedule),
      'Your schedule changes were not saved.'
    );
    if (ok) {
      logActivity({
        operatorName: operator.name,
        action: 'Schedule updated',
        type: 'schedule',
        details: 'Updated the weekly operating schedule',
      });
    }
  };

  const addInventoryItem = async (
    input: Omit<InventoryItem, 'id' | 'orgId' | 'pantryId' | 'updatedAt'>
  ) => {
    const optimistic: InventoryItem = {
      ...input,
      id: `pending_${Date.now()}`,
      orgId: operator.claims.orgId,
      pantryId: operator.pantryId,
      updatedAt: new Date(),
    };
    const ok = await mutate(
      (s) => ({ ...s, inventory: [optimistic, ...s.inventory] }),
      async () => {
        const created = await repository.addInventoryItem(input);
        // Swap the placeholder id for the one the database assigned.
        patch((s) => ({
          ...s,
          inventory: s.inventory.map((i) => (i.id === optimistic.id ? created : i)),
        }));
      },
      'The item was not added.'
    );
    if (ok) {
      logActivity({
        operatorName: operator.name,
        action: 'Inventory restocked',
        type: 'inventory',
        details: `Added ${input.quantity} ${input.unit} of "${input.name}"`,
      });
    }
  };

  const updateInventoryItem = (updated: InventoryItem) =>
    mutate(
      (s) => ({ ...s, inventory: s.inventory.map((i) => (i.id === updated.id ? updated : i)) }),
      () => repository.updateInventoryItem(updated),
      'The stock change was not saved.'
    );

  const deleteInventoryItem = (id: string) =>
    mutate(
      (s) => ({ ...s, inventory: s.inventory.filter((i) => i.id !== id) }),
      () => repository.deleteInventoryItem(id),
      'The item was not removed.'
    );

  const addClosure = (input: Omit<SpecialClosure, 'id' | 'orgId' | 'pantryId'>) =>
    mutate(
      (s) => ({
        ...s,
        closures: [
          ...s.closures,
          { ...input, id: `pending_${Date.now()}`, orgId: operator.claims.orgId, pantryId: operator.pantryId },
        ],
      }),
      async () => {
        await repository.addClosure(input);
      },
      'The closure was not saved.'
    );

  const deleteClosure = (id: string) =>
    mutate(
      (s) => ({ ...s, closures: s.closures.filter((c) => c.id !== id) }),
      () => repository.deleteClosure(id),
      'The closure was not removed.'
    );

  const sendBroadcast = async (
    input: Pick<Announcement, 'title' | 'message' | 'priority' | 'language' | 'radiusMiles'> & {
      expiresInHours: number;
    }
  ) => {
    const ok = await mutate(
      (s) => s,
      async () => {
        const created = await repository.sendBroadcast(input);
        patch((s) => ({
          ...s,
          announcements: [created, ...s.announcements],
          quota: { ...s.quota, usedToday: s.quota.usedToday + 1 },
        }));
      },
      'The broadcast was not sent.'
    );
    if (ok) {
      logActivity({
        operatorName: operator.name,
        action: 'Broadcast sent',
        type: 'announcement',
        details: `Sent broadcast: "${input.title}"`,
      });
    }
  };

  const deleteBroadcast = (id: string) =>
    mutate(
      (s) => ({ ...s, announcements: s.announcements.filter((a) => a.id !== id) }),
      () => repository.deleteBroadcast(id),
      'The broadcast was not removed.'
    );

  const inviteTeamMember = async (email: string, title: Operator['title']) => {
    await mutate(
      (s) => s,
      async () => {
        const created = await repository.inviteTeamMember({ email, title });
        patch((s) => ({ ...s, team: [...s.team, created] }));
      },
      'The invitation was not sent.'
    );
  };

  return (
    <DashboardLayout
      pantry={data.pantry}
      operator={operator}
      mode={repository.mode}
      pending={workspace.pending}
      writeError={workspace.writeError}
      onDismissWriteError={workspace.clearWriteError}
      onUpdatePantryStatus={setLiveStatus}
      onNavigateToSettings={() => navigate('/profile')}
      onSignOut={() => void signOut()}
    >
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              pantry={data.pantry}
              operator={operator}
              inventory={data.inventory}
              activity={data.activity}
              onQuickToggleStatus={() => setLiveStatus(!data.pantry.isOpen, data.pantry.openNote)}
            />
          }
        />
        <Route
          path="/shift"
          element={
            <ShiftModePage
              pantry={data.pantry}
              inventory={data.inventory}
              onUpdatePantryStatus={setLiveStatus}
              onUpdateInventoryItem={updateInventoryItem}
              onSendQuickAlert={(title, message, priority) =>
                sendBroadcast({
                  title, message, priority,
                  language: 'English', radiusMiles: 15, expiresInHours: 6,
                })
              }
            />
          }
        />
        <Route
          path="/inventory"
          element={
            <InventoryPage
              inventory={data.inventory}
              onAddInventoryItem={addInventoryItem}
              onUpdateInventoryItem={updateInventoryItem}
              onDeleteInventoryItem={deleteInventoryItem}
            />
          }
        />
        <Route
          path="/hours"
          element={
            <HoursPage
              schedule={data.schedule}
              closures={data.closures}
              onSaveSchedule={saveSchedule}
              onAddClosure={addClosure}
              onDeleteClosure={deleteClosure}
            />
          }
        />
        <Route
          path="/notifications"
          element={
            <NotificationsPage
              announcements={data.announcements}
              quota={data.quota}
              onSendBroadcast={sendBroadcast}
              onDeleteAnnouncement={deleteBroadcast}
            />
          }
        />
        <Route
          path="/profile"
          element={<ProfilePage pantry={data.pantry} operator={operator} onUpdatePantry={savePantry} />}
        />
        <Route
          path="/team"
          element={<TeamPage teamMembers={data.team} operator={operator} onInvite={inviteTeamMember} />}
        />
        <Route path="/billing" element={<Navigate to="/team" replace />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
