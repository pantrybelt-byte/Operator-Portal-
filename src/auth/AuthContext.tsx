/**
 * Authentication and claims.
 *
 * Two paths behind one interface:
 *
 *   demo   — no Firebase configured. Signs in as the mock operator so the
 *            portal is explorable without a project.
 *   live   — Firebase Auth. The operator's `role`, `orgId` and `counties`
 *            come from the ID token's custom claims, which is where
 *            `firestore.rules` reads them from. They are NOT read from a
 *            user document: a client can edit a document, it cannot edit a
 *            signed token.
 *
 * Claims are minted by a callable function using the Admin SDK. Nothing here
 * can grant them — see docs/firestore-integration.md.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ClaimRole, Operator } from '../types';
import { getFirebaseAuth } from '../services/firebase';
import { getFirebaseStatus } from '../services/firebaseStatus';
import { mockOperator } from '../data/mockData';
import { CLAIM_ROLE_TO_TITLE } from './permissions';

interface AuthState {
  operator: Operator | null;
  status: 'loading' | 'signed-out' | 'signed-in' | 'error';
  error: string | null;
  mode: 'Demo Data' | 'Firestore Live';
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const DEMO_SESSION_KEY = 'accessbelt.demo.session';

const MISSING_CLAIMS =
  'This account is not set up as a pantry operator yet. An administrator needs to grant it access before you can sign in.';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const live = getFirebaseStatus().enabled;
  const [operator, setOperator] = useState<Operator | null>(null);
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const [error, setError] = useState<string | null>(null);

  // Restore an existing session on load. Live mode restores from Firebase
  // Auth; demo mode keeps a session-scoped record so a page refresh behaves
  // the same way it will once auth is real, and closing the tab still ends it.
  useEffect(() => {
    if (!live) {
      try {
        const stored = sessionStorage.getItem(DEMO_SESSION_KEY);
        if (stored) {
          setOperator({ ...mockOperator, email: stored });
          setStatus('signed-in');
          return;
        }
      } catch {
        /* Private browsing can block sessionStorage; sign-in still works. */
      }
      setStatus('signed-out');
      return;
    }

    let cancelled = false;
    (async () => {
      const auth = getFirebaseAuth();
      if (!auth) {
        if (!cancelled) setStatus('signed-out');
        return;
      }

      const { onAuthStateChanged } = await import('firebase/auth');
      onAuthStateChanged(auth, async (user) => {
        if (cancelled) return;
        if (!user) {
          setOperator(null);
          setStatus('signed-out');
          return;
        }

        try {
          const token = await user.getIdTokenResult();
          const role = token.claims.role as ClaimRole | undefined;
          const orgId = token.claims.orgId as string | undefined;
          const counties = (token.claims.counties as string[] | undefined) ?? [];

          if (!role || !orgId) {
            setError(MISSING_CLAIMS);
            setStatus('error');
            return;
          }

          setOperator({
            id: user.uid,
            name: user.displayName ?? user.email ?? 'Operator',
            email: user.email ?? '',
            title: CLAIM_ROLE_TO_TITLE[role],
            claims: { role, orgId, counties },
            avatarUrl: user.photoURL ?? undefined,
            pantryId: (token.claims.pantryId as string | undefined) ?? orgId,
            pantryName: '',
          });
          setStatus('signed-in');
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Could not read your account permissions.');
          setStatus('error');
        }
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [live]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);

      if (!live) {
        const resolved = email || mockOperator.email;
        try {
          sessionStorage.setItem(DEMO_SESSION_KEY, resolved);
        } catch {
          /* Non-fatal — the session simply will not survive a refresh. */
        }
        setOperator({ ...mockOperator, email: resolved });
        setStatus('signed-in');
        return;
      }

      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Authentication is unavailable.');

      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged completes the sign-in once claims are read.
    },
    [live]
  );

  const signOut = useCallback(async () => {
    try {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      /* Nothing to clean up. */
    }

    if (live) {
      const auth = getFirebaseAuth();
      if (auth) {
        const { signOut: fbSignOut } = await import('firebase/auth');
        await fbSignOut(auth);
      }
    }
    setOperator(null);
    setStatus('signed-out');
  }, [live]);

  const value = useMemo<AuthState>(
    () => ({
      operator,
      status,
      error,
      mode: live ? 'Firestore Live' : 'Demo Data',
      signIn,
      signOut,
    }),
    [operator, status, error, live, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
