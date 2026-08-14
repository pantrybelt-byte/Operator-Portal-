import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ShiftModePage } from './pages/ShiftModePage';
import { InventoryPage } from './pages/InventoryPage';
import { HoursPage } from './pages/HoursPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { BillingPage } from './pages/BillingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import {
  mockOperator,
  mockPantry,
  mockSubscription,
  mockTeamMembers,
  mockInventory,
  mockSchedule,
  mockClosures,
  mockAnnouncements,
  mockActivity,
} from './data/mockData';
import type { PantryInfo, InventoryItem, DaySchedule, SpecialClosure, Announcement, ActivityItem, SubscriptionInfo, TeamMember } from './types';


export function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [operator, setOperator] = useState(mockOperator);
  const [pantry, setPantry] = useState<PantryInfo>(mockPantry);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(mockSubscription);
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [schedule, setSchedule] = useState<DaySchedule[]>(mockSchedule);
  const [closures, setClosures] = useState<SpecialClosure[]>(mockClosures);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [activity, setActivity] = useState<ActivityItem[]>(mockActivity);

  const navigate = useNavigate();

  // Handlers
  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setOperator((prev) => ({ ...prev, email }));
    navigate('/');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  const handleUpdatePantryStatus = (isOpen: boolean, openNote: string) => {
    setPantry((prev) => ({ ...prev, isOpen, openNote, lastUpdated: 'Just now' }));
    
    const newAct: ActivityItem = {
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
      operatorName: operator.name,
      action: 'Updated Status',
      type: 'status',
      details: `Set Pantry status to ${isOpen ? 'OPEN' : 'CLOSED'}: "${openNote}"`,
    };
    setActivity((prev) => [newAct, ...prev]);
  };

  const handleUpdatePantry = (updatedPantry: PantryInfo) => {
    setPantry(updatedPantry);
    const newAct: ActivityItem = {
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
      operatorName: operator.name,
      action: 'Updated Pantry Info',
      type: 'profile',
      details: `Updated details for ${updatedPantry.name}`,
    };
    setActivity((prev) => [newAct, ...prev]);
  };

  const handleAddInventoryItem = (newItemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...newItemData,
      id: `inv_${Date.now()}`,
      lastUpdated: 'Just now',
    };
    setInventory((prev) => [newItem, ...prev]);

    const newAct: ActivityItem = {
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
      operatorName: operator.name,
      action: 'Inventory Restock',
      type: 'inventory',
      details: `Added ${newItem.quantity} ${newItem.unit} of "${newItem.name}"`,
    };
    setActivity((prev) => [newAct, ...prev]);
  };

  const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveSchedule = (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    const newAct: ActivityItem = {
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
      operatorName: operator.name,
      action: 'Schedule Modified',
      type: 'schedule',
      details: 'Updated weekly operating schedule',
    };
    setActivity((prev) => [newAct, ...prev]);
  };

  const handleAddClosure = (closureData: Omit<SpecialClosure, 'id'>) => {
    const newClosure: SpecialClosure = {
      ...closureData,
      id: `close_${Date.now()}`,
    };
    setClosures((prev) => [...prev, newClosure]);
  };

  const handleDeleteClosure = (id: string) => {
    setClosures((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddAnnouncement = (annData: Omit<Announcement, 'id' | 'createdAt' | 'sentToApp' | 'viewsCount'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann_${Date.now()}`,
      createdAt: 'Just now',
      sentToApp: true,
      viewsCount: 1,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    setSubscription((prev) => ({ ...prev, broadcastsUsed: prev.broadcastsUsed + 1 }));

    const newAct: ActivityItem = {
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
      operatorName: operator.name,
      action: 'Broadcasted Alert',
      type: 'announcement',
      details: `Sent push alert: "${annData.title}"`,
    };
    setActivity((prev) => [newAct, ...prev]);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout
      pantry={pantry}
      operator={operator}
      onUpdatePantryStatus={handleUpdatePantryStatus}
      onNavigateToSettings={() => navigate('/profile')}
      onSignOut={handleSignOut}
    >
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              pantry={pantry}
              inventory={inventory}
              activity={activity}
              onQuickToggleStatus={() => handleUpdatePantryStatus(!pantry.isOpen, pantry.openNote)}
            />
          }
        />
        <Route
          path="/shift"
          element={
            <ShiftModePage
              pantry={pantry}
              inventory={inventory}
              onUpdatePantryStatus={handleUpdatePantryStatus}
              onUpdateInventoryItem={handleUpdateInventoryItem}
              onSendQuickAlert={(title, message, priority) => {
                handleAddAnnouncement({
                  title,
                  message,
                  priority,
                  expiresAt: 'In 6 hours',
                });
              }}
            />
          }
        />
        <Route
          path="/inventory"
          element={
            <InventoryPage
              inventory={inventory}
              onAddInventoryItem={handleAddInventoryItem}
              onUpdateInventoryItem={handleUpdateInventoryItem}
              onDeleteInventoryItem={handleDeleteInventoryItem}
            />
          }
        />
        <Route
          path="/hours"
          element={
            <HoursPage
              schedule={schedule}
              closures={closures}
              onSaveSchedule={handleSaveSchedule}
              onAddClosure={handleAddClosure}
              onDeleteClosure={handleDeleteClosure}
            />
          }
        />
        <Route
          path="/notifications"
          element={
            <NotificationsPage
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              pantry={pantry}
              onUpdatePantry={handleUpdatePantry}
            />
          }
        />
        <Route
          path="/billing"
          element={
            <BillingPage
              subscription={subscription}
              teamMembers={teamMembers}
            />
          }
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
