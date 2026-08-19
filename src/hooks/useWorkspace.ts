/**
 * Loads the workspace and applies every mutation optimistically, rolling the
 * UI back if the write is rejected.
 *
 * The rollback is the point. Without it an operator taps "Set closed", sees
 * the confirmation, and families keep seeing "open" — the failure is
 * invisible precisely when it matters most.
 *
 * State is mirrored into a ref that is written synchronously alongside
 * `setData`. Reading the snapshot from a ref rather than from the closed-over
 * `data` is what makes concurrent mutations safe: two writes started in the
 * same render would otherwise both capture the pre-change snapshot, and the
 * second to resolve would silently undo the first.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkspaceSnapshot } from '../data';
import type { DataRepository } from '../data';

type Status = 'loading' | 'ready' | 'error';

export interface WorkspaceState {
  status: Status;
  error: string | null;
  data: WorkspaceSnapshot | null;
  reload: () => void;
  /** Applies `optimistic` immediately, runs `commit`, reverts on failure. */
  mutate: (
    optimistic: (current: WorkspaceSnapshot) => WorkspaceSnapshot,
    commit: () => Promise<void>,
    failureMessage: string
  ) => Promise<boolean>;
  /** Local-only update — reconciling a server-assigned id, appending a log. */
  patch: (updater: (current: WorkspaceSnapshot) => WorkspaceSnapshot) => void;
  pending: number;
  writeError: string | null;
  clearWriteError: () => void;
}

export function useWorkspace(repository: DataRepository): WorkspaceState {
  const [data, setData] = useState<WorkspaceSnapshot | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [pending, setPending] = useState(0);

  const dataRef = useRef<WorkspaceSnapshot | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** Single writer for both the ref and React state, so they never diverge. */
  const apply = useCallback((next: WorkspaceSnapshot | null) => {
    dataRef.current = next;
    setData(next);
  }, []);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const snapshot = await repository.loadWorkspace();
      if (!mounted.current) return;
      apply(snapshot);
      setStatus('ready');
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : 'Could not load your pantry.');
      setStatus('error');
    }
  }, [repository, apply]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = useCallback<WorkspaceState['patch']>(
    (updater) => {
      const current = dataRef.current;
      if (!current) return;
      apply(updater(current));
    },
    [apply]
  );

  const mutate = useCallback<WorkspaceState['mutate']>(
    async (optimistic, commit, failureMessage) => {
      const previous = dataRef.current;
      if (!previous) return false;

      apply(optimistic(previous));
      setPending((n) => n + 1);
      setWriteError(null);

      try {
        await commit();
        return true;
      } catch (e) {
        // Put the UI back to the truth rather than leaving a change that
        // never reached the database.
        if (mounted.current) {
          apply(previous);
          setWriteError(e instanceof Error ? `${failureMessage} (${e.message})` : failureMessage);
        }
        return false;
      } finally {
        if (mounted.current) setPending((n) => Math.max(0, n - 1));
      }
    },
    [apply]
  );

  return {
    status,
    error,
    data,
    reload: () => void load(),
    mutate,
    patch,
    pending,
    writeError,
    clearWriteError: () => setWriteError(null),
  };
}
