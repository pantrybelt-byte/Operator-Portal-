export type PantryStatus = 'open' | 'closed' | 'limited';

export interface Operator {
  id: string;
  name: string;
  email: string;
  role: 'Pantry Director' | 'Inventory Lead' | 'Volunteer Coordinator';
  avatarUrl?: string;
  pantryId: string;
  pantryName: string;
}

export interface PantryLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isOpen: boolean;
  openNote: string;
  type: 'Main Warehouse' | 'Satellite Site' | 'Mobile Distribution' | 'Drive-Thru Only';
}

export interface PantryInfo {
  id: string;
  name: string;
  organization: string;
  ein: string;
  verificationStatus: 'Verified 501(c)(3)' | 'Pending Verification' | 'Unverified';
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  isOpen: boolean;
  openNote: string;
  autoCloseEnabled: boolean;
  autoCloseTime: string;
  capacityPercentage: number;
  servedThisWeek: number;
  lastUpdated: string;
  verifiedBy: string;
  distributionType: 'Walk-in & Drive-thru' | 'Walk-in Only' | 'Drive-thru Only' | 'Appointment Only';
  locations: PantryLocation[];
  latitude?: number;
  longitude?: number;
  accessNotes?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Fresh Produce' | 'Canned Goods' | 'Dairy & Refrigerated' | 'Bakery & Grains' | 'Proteins & Meat' | 'Baby & Hygiene' | 'Prepared Meals';
  quantity: number;
  unit: 'lbs' | 'boxes' | 'crates' | 'units' | 'cans' | 'bags';
  inStock: boolean;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  minThreshold: number;
  lastUpdated: string;
  notes?: string;
}

export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  notes?: string;
}

export interface SpecialClosure {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  expiresAt: string;
  sentToApp: boolean;
  viewsCount: number;
  radiusMiles?: number;
  language?: 'English' | 'Spanish' | 'Vietnamese' | 'Arabic';
  spanishMessage?: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  operatorName: string;
  action: string;
  type: 'status' | 'inventory' | 'schedule' | 'announcement' | 'profile' | 'billing' | 'location';
  details: string;
}

export interface SubscriptionInvoice {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending';
  downloadUrl: string;
}

export interface SubscriptionInfo {
  planName: 'Free Community' | 'Community Standard' | 'Community Pro' | 'Regional Enterprise';
  price: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'Active' | 'Past Due' | 'Trial';
  renewsDate: string;
  paymentMethod: {
    type: 'Card' | 'ACH Invoice' | 'Grant Sponsored' | 'Free Tier';
    brand?: 'Visa' | 'Mastercard' | 'Amex';
    last4?: string;
    expDate?: string;
  };
  broadcastsUsed: number;
  broadcastsLimit: number;
  dailyBroadcastsUsed: number;
  dailyBroadcastsLimit: number;
  seatsUsed: number;
  seatsLimit: number;
  locationsLimit: number;
  invoices: SubscriptionInvoice[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Manager' | 'Shift Lead' | 'Volunteer';
  status: 'Active' | 'Invited';
  lastActive: string;
}
