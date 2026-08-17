/**
 * Whether live data is configured — answered purely from `import.meta.env`.
 *
 * Mirrors the Agency Dashboard's firebaseStatus.ts. This module deliberately
 * imports nothing from the Firebase SDK, so UI that only needs the status
 * badge doesn't drag the SDK into the entry chunk.
 */

const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export interface FirebaseStatus {
  /** True when live data has been requested AND the config is complete. */
  enabled: boolean;
  /** True when VITE_USE_FIREBASE=true, regardless of whether config is valid. */
  requested: boolean;
  /** Required env keys that were requested but missing. */
  missingKeys: string[];
  isConnected: boolean;
  mode: 'Firestore Live' | 'Demo Data';
}

export function readEnv(key: string): string | undefined {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getFirebaseStatus(): FirebaseStatus {
  const requested = readEnv('VITE_USE_FIREBASE') === 'true';
  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => readEnv(key) === undefined);
  const enabled = requested && missingKeys.length === 0;

  return {
    requested,
    missingKeys,
    enabled,
    isConnected: enabled,
    mode: enabled ? 'Firestore Live' : 'Demo Data',
  };
}

export function checkFirebaseConnectionStatus(): {
  isConnected: boolean;
  mode: FirebaseStatus['mode'];
} {
  const { isConnected, mode } = getFirebaseStatus();
  return { isConnected, mode };
}

export function isFirebaseEnabled(): boolean {
  return getFirebaseStatus().enabled;
}
