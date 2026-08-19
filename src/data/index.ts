/**
 * Repository selection — the single place the app decides where data comes
 * from. Going live is this file plus `VITE_USE_FIREBASE=true`.
 */
import { getFirebaseStatus } from '../services/firebaseStatus';
import { MockRepository } from './mockRepository';
import { FirestoreRepository } from './firestoreRepository';
import type { DataRepository } from './repository';
import type { Operator } from '../types';

export type { DataRepository, WorkspaceSnapshot } from './repository';

export function createRepository(operator: Operator): DataRepository {
  if (getFirebaseStatus().enabled) {
    return new FirestoreRepository(operator, operator.pantryId);
  }
  return new MockRepository();
}
