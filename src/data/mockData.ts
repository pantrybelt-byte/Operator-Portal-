/**
 * Demonstration data.
 *
 * Shaped exactly like what the repository returns from Firestore, so the two
 * implementations are interchangeable. Timestamps are built relative to load
 * time rather than frozen strings — a demo that always says "10 mins ago" is
 * indistinguishable from a clock that has stopped.
 */
import type {
  ActivityItem,
  Announcement,
  DaySchedule,
  InventoryItem,
  Operator,
  PantryInfo,
  PantryLocation,
  SpecialClosure,
  TeamMember,
} from '../types';
import { encodeGeohash } from '../lib/geohash';

const ORG_ID = 'org_hope_community';
const PANTRY_ID = 'pantry_hope_main';

const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000);
const hoursAgo = (n: number) => minutesAgo(n * 60);
const hoursFromNow = (n: number) => new Date(Date.now() + n * 3_600_000);

export const mockOperator: Operator = {
  id: 'op_10293',
  name: 'Sarah Jenkins',
  email: 'sarah.j@hopecommunitypantry.org',
  title: 'Manager',
  claims: {
    role: 'org_admin',
    orgId: ORG_ID,
    counties: ['Dallas', 'Marengo', 'Perry', 'Wilcox'],
  },
  pantryId: PANTRY_ID,
  pantryName: 'Hope Community Food Pantry',
  avatarUrl:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
};

export const mockLocations: PantryLocation[] = [
  { id: 'loc_01', name: 'Hope Main Campus', kind: 'Main Warehouse' },
  { id: 'loc_02', name: 'Hope Eastside Satellite', kind: 'Satellite Site' },
  { id: 'loc_03', name: 'Hope Mobile Unit 1', kind: 'Mobile Distribution' },
];

const COORDS = { lat: 32.3792, lng: -86.3077 };

export const mockPantry: PantryInfo = {
  id: PANTRY_ID,
  orgId: ORG_ID,
  county: 'Dallas',
  geohash: encodeGeohash(COORDS.lat, COORDS.lng),
  listingStatus: 'active',

  name: 'Hope Community Food Pantry',
  organization: 'AccessBelt Network — Region 4',
  ein: '36-4829102',
  verified: true,
  verifiedBy: 'Sarah Jenkins (Director)',

  street: '1428 Elmwood Drive',
  city: 'Selma',
  state: 'AL',
  zip: '36701',
  coordinates: COORDS,

  phone: '(334) 555-0192',
  email: 'contact@hopecommunitypantry.org',
  website: 'https://hopecommunitypantry.org',
  description:
    'Providing fresh produce, staples, and emergency nutritional assistance to families in Dallas County.',
  eligibilityNotes: 'Dallas County residents',
  docsRequired: ['Photo ID', 'Proof of residency'],
  accessNotes: 'Distribution takes place around back at the Fellowship Hall door near the blue awning.',

  isOpen: true,
  openNote: 'Walk-ins welcome until 4:00 PM today. Drive-thru lane active.',
  autoCloseEnabled: true,
  autoCloseTime: '16:00',

  capacityPercentage: 78,
  servedThisWeek: 342,
  updatedAt: minutesAgo(10),

  distributionType: 'Walk-in & Drive-thru',
  locations: mockLocations,
};

export const mockTeamMembers: TeamMember[] = [
  { id: 'team_01', orgId: ORG_ID, name: 'Sarah Jenkins', email: 'sarah.j@hopecommunitypantry.org', title: 'Manager', status: 'Active', lastActive: minutesAgo(1) },
  { id: 'team_02', orgId: ORG_ID, name: 'Mark Ramirez', email: 'mark.r@hopecommunitypantry.org', title: 'Shift Lead', status: 'Active', lastActive: hoursAgo(2) },
  { id: 'team_03', orgId: ORG_ID, name: 'Elena Rostova', email: 'elena.v@hopecommunitypantry.org', title: 'Volunteer', status: 'Active', lastActive: hoursAgo(26) },
];

const item = (
  id: string,
  name: string,
  category: InventoryItem['category'],
  quantity: number,
  unit: InventoryItem['unit'],
  minThreshold: number,
  updatedAt: Date,
  notes?: string
): InventoryItem => ({
  id, orgId: ORG_ID, pantryId: PANTRY_ID, name, category, quantity, unit, minThreshold, updatedAt, notes,
});

export const mockInventory: InventoryItem[] = [
  item('inv_01', 'Fresh Apples & Pears', 'Fresh Produce', 350, 'lbs', 100, hoursAgo(6), 'Donated by Orchard Valley Farms'),
  item('inv_02', 'Whole Milk (Gallons)', 'Dairy & Refrigerated', 18, 'units', 30, hoursAgo(4), 'High demand today'),
  item('inv_03', 'Canned Black Beans (15 oz)', 'Canned Goods', 420, 'cans', 150, hoursAgo(20)),
  item('inv_04', 'Artisan Whole Wheat Bread', 'Bakery & Grains', 65, 'boxes', 20, hoursAgo(7)),
  item('inv_05', 'Frozen Chicken Breasts', 'Proteins & Meat', 0, 'lbs', 50, hoursAgo(1), 'Expected delivery tomorrow morning'),
  item('inv_06', 'Infant Formula (Stage 1)', 'Baby & Hygiene', 45, 'units', 15, hoursAgo(50)),
  item('inv_07', 'Hot Prepared Soup Kits', 'Prepared Meals', 80, 'boxes', 25, hoursAgo(5)),
  item('inv_08', 'Peanut Butter (16 oz)', 'Canned Goods', 12, 'units', 40, minutesAgo(90)),
];

export const mockSchedule: DaySchedule[] = [
  { day: 'Monday', isOpen: true, openTime: '08:00', closeTime: '16:00', notes: 'Senior hours 8am-9am' },
  { day: 'Tuesday', isOpen: true, openTime: '08:00', closeTime: '16:00' },
  { day: 'Wednesday', isOpen: true, openTime: '08:00', closeTime: '18:00', notes: 'Extended evening shift' },
  { day: 'Thursday', isOpen: true, openTime: '08:00', closeTime: '16:00' },
  { day: 'Friday', isOpen: true, openTime: '08:00', closeTime: '15:00', notes: 'Weekend distribution prep' },
  { day: 'Saturday', isOpen: true, openTime: '09:00', closeTime: '13:00', notes: 'First & third Sat of month' },
  { day: 'Sunday', isOpen: false, openTime: '09:00', closeTime: '12:00', notes: 'Closed for restocking' },
];

export const mockClosures: SpecialClosure[] = [
  {
    id: 'close_01', orgId: ORG_ID, pantryId: PANTRY_ID,
    title: 'Labor Day Holiday',
    startDate: '2026-09-07', endDate: '2026-09-07',
    reason: 'National holiday. Emergency pantry box pickups available on request.',
  },
  {
    id: 'close_02', orgId: ORG_ID, pantryId: PANTRY_ID,
    title: 'Facility maintenance and deep cleaning',
    startDate: '2026-09-21', endDate: '2026-09-21',
    reason: 'Annual freezer unit servicing and sanitation.',
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann_01', orgId: ORG_ID, pantryId: PANTRY_ID,
    title: 'Fresh produce arriving at 2:00 PM',
    message: 'We have 500 lbs of fresh sweet corn, tomatoes, and peaches donated by local growers, available to all app users today.',
    spanishMessage: 'Tenemos 500 libras de maíz dulce, tomates y duraznos frescos donados por agricultores locales, disponibles hoy a las 2:00 PM.',
    priority: 'important',
    createdAt: hoursAgo(3), expiresAt: hoursFromNow(4),
    sentToApp: true, viewsCount: 142, radiusMiles: 15, language: 'Bilingual',
  },
  {
    id: 'ann_02', orgId: ORG_ID, pantryId: PANTRY_ID,
    title: 'Drive-thru lane open today',
    message: 'Drive-thru food package collection is active at the North Entrance lane due to rain.',
    priority: 'urgent',
    createdAt: hoursAgo(6), expiresAt: hoursFromNow(2),
    sentToApp: true, viewsCount: 289, radiusMiles: 15, language: 'English',
  },
  {
    id: 'ann_03', orgId: ORG_ID, pantryId: PANTRY_ID,
    title: 'New infant formula guidelines',
    message: 'Families with infants under 12 months can now request up to 3 cans of formula per week.',
    priority: 'normal',
    createdAt: hoursAgo(60), expiresAt: hoursFromNow(240),
    sentToApp: true, viewsCount: 410, radiusMiles: 25, language: 'English',
  },
];

const act = (
  id: string, timestamp: Date, operatorName: string,
  action: string, type: ActivityItem['type'], details: string
): ActivityItem => ({ id, orgId: ORG_ID, pantryId: PANTRY_ID, timestamp, operatorName, action, type, details });

export const mockActivity: ActivityItem[] = [
  act('act_01', minutesAgo(10), 'Sarah Jenkins', 'Status updated', 'status', 'Set status to open with note: "Walk-ins welcome until 4:00 PM today."'),
  act('act_02', minutesAgo(45), 'Mark Ramirez', 'Stock adjusted', 'inventory', 'Marked "Frozen Chicken Breasts" as out of stock'),
  act('act_03', hoursAgo(2), 'Sarah Jenkins', 'Broadcast sent', 'announcement', 'Sent broadcast: "Fresh produce arriving at 2:00 PM"'),
  act('act_04', hoursAgo(3), 'Sarah Jenkins', 'Inventory restocked', 'inventory', 'Added 350 lbs of "Fresh Apples & Pears"'),
  act('act_05', hoursAgo(26), 'Sarah Jenkins', 'Schedule updated', 'schedule', 'Updated Wednesday operating hours to 8:00 AM – 6:00 PM'),
];

export const DEMO_ORG_ID = ORG_ID;
export const DEMO_PANTRY_ID = PANTRY_ID;
