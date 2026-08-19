/**
 * Firebase initialisation.
 *
 * Mirrors the Agency Dashboard's services/firebase.ts: lazy and defensive so
 * the portal runs with no Firebase project at all (the demo path, which is
 * the only mode this app currently ships in), a partially filled `.env`, or
 * a live project — without any of those three crashing the other two.
 *
 * A note on the API key: `VITE_FIREBASE_API_KEY` is **not** a secret. Firebase
 * web API keys are public identifiers that ship in every client bundle. Access
 * control comes from Firestore security rules and App Check, never from
 * keeping this value hidden.
 *
 * This file only sets up the SDK connection. It does not define any Firestore
 * collections or queries — every page still reads from src/data/mockData.ts.
 * Wiring real reads/writes needs a schema decision (collections for
 * inventory, shifts, announcements, multi-operator/pantry access control)
 * the same way the Agency Dashboard's Phase 3 was scoped before being built.
 */
import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { isFirebaseEnabled, readEnv } from './firebaseStatus';

export {
  getFirebaseStatus,
  checkFirebaseConnectionStatus,
  isFirebaseEnabled,
  type FirebaseStatus,
} from './firebaseStatus';

function buildConfig(): FirebaseOptions {
  return {
    apiKey: readEnv('VITE_FIREBASE_API_KEY'),
    authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnv('VITE_FIREBASE_APP_ID'),
    measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID'),
  };
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let initialisationError: Error | null = null;

/**
 * Initialise (once) and return the Firebase app, or null when live data is
 * not enabled or initialisation failed. Callers fall back to demo data.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseEnabled()) return null;
  if (initialisationError) return null;
  if (cachedApp) return cachedApp;

  try {
    cachedApp = getApps()[0] ?? initializeApp(buildConfig());
    return cachedApp;
  } catch (error) {
    initialisationError = error instanceof Error ? error : new Error(String(error));
    console.error('[firebase] initialisation failed, falling back to demo data:', initialisationError);
    return null;
  }
}

/**
 * Two databases, on purpose.
 *
 * `(default)` is shared with the consumer Expo app and holds `resources` —
 * the collection the phone app reads. Pantry identity, address, hours and
 * coordinates are written straight there so an operator's edit is visible to
 * families with no sync step in between.
 *
 * `accessbelt-operator` is portal-owned and holds the concepts `resources`
 * has no field for: inventory, broadcasts, closures, activity.
 *
 * See src/data/schema.ts for which collection lives where.
 */
const OPERATOR_DATABASE_ID = 'accessbelt-operator';

const dbCache = new Map<string, Firestore>();

function firestoreFor(databaseId?: string): Firestore | null {
  const key = databaseId ?? '(default)';
  const cached = dbCache.get(key);
  if (cached) return cached;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    dbCache.set(key, db);
    return db;
  } catch (error) {
    console.error(`[firebase] Firestore "${key}" unavailable:`, error);
    return null;
  }
}

/** `(default)` — shared with the consumer app. Contains `resources`. */
export function getSharedDb(): Firestore | null {
  return firestoreFor();
}

/** `accessbelt-operator` — portal-owned collections. */
export function getOperatorDb(): Firestore | null {
  return firestoreFor(OPERATOR_DATABASE_ID);
}

export function getFirebaseAuth(): Auth | null {
  if (cachedAuth) return cachedAuth;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    cachedAuth = getAuth(app);
    return cachedAuth;
  } catch (error) {
    console.error('[firebase] Auth unavailable:', error);
    return null;
  }
}

/** Test seam — clears the memoised handles. */
export function resetFirebaseForTests(): void {
  cachedApp = null;
  cachedAuth = null;
  initialisationError = null;
  dbCache.clear();
}
