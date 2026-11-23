import { useCallback, useEffect, useRef } from 'react';

export interface RealtimeSyncEvent {
  source: 'websocket' | 'poll' | 'reconnect';
  domain?: string;
  action?: string;
  version?: string;
}

interface UseRealtimeSyncOptions {
  enabled?: boolean;
  pollIntervalMs?: number;
  onSync: (event: RealtimeSyncEvent) => void | Promise<void>;
}

export function useRealtimeSync({
  enabled = true,
  pollIntervalMs = 15000,
  onSync,
}: UseRealtimeSyncOptions) {
  const lastVersionRef = useRef<string>('');
  const onSyncRef = useRef(onSync);
  const lastVersionCheckAtRef = useRef<number>(0);

  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  const markVersionSynced = useCallback((version?: string | null) => {
    if (typeof version === 'string' && version.trim()) {
      lastVersionRef.current = version.trim();
    }
  }, []);

  const checkServerVersion = useCallback(
    async (source: 'poll' | 'reconnect') => {
      if (!enabled) return;
      const now = Date.now();
      if (source === 'poll' && now - lastVersionCheckAtRef.current < 2500) {
        return;
      }
      lastVersionCheckAtRef.current = now;

      try {
        const res = await fetch('/api/public/version', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; version?: string };
        const nextVersion = typeof data.version === 'string' ? data.version.trim() : '';
        if (!data.ok || !nextVersion) return;

        if (!lastVersionRef.current) {
          lastVersionRef.current = nextVersion;
          return;
        }

        if (nextVersion !== lastVersionRef.current) {
          lastVersionRef.current = nextVersion;
          await onSyncRef.current({ source, version: nextVersion });
        }
      } catch {
        // Ignore transient network errors during background version checks
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let reconnectDelay = 1500;

    const clearReconnectTimer = () => {
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const connectWebSocket = () => {
      if (disposed) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/realtime`;

      try {
        ws = new WebSocket(wsUrl);
      } catch {
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        reconnectDelay = 1500;
      };

      ws.onmessage = (event) => {
        if (disposed || typeof event.data !== 'string') return;
        try {
          const payload = JSON.parse(event.data) as {
            type?: string;
            domain?: string;
            action?: string;
            version?: string;
          };
          const incomingVersion =
            typeof payload.version === 'string' ? payload.version.trim() : '';

          if (payload.type === 'realtime:connected') {
            if (!lastVersionRef.current && incomingVersion) {
              lastVersionRef.current = incomingVersion;
            } else if (
              incomingVersion &&
              lastVersionRef.current &&
              incomingVersion !== lastVersionRef.current
            ) {
              lastVersionRef.current = incomingVersion;
              void onSyncRef.current({
                source: 'reconnect',
                version: incomingVersion,
              });
            }
            return;
          }

          if (payload.type === 'cms:committed') {
            if (incomingVersion && incomingVersion === lastVersionRef.current) {
              return;
            }
            if (incomingVersion) {
              lastVersionRef.current = incomingVersion;
            }
            void onSyncRef.current({
              source: 'websocket',
              domain: payload.domain,
              action: payload.action,
              version: incomingVersion || undefined,
            });
          }
        } catch {
          // Ignore malformed frames
        }
      };

      ws.onclose = () => {
        ws = null;
        if (!disposed) {
          scheduleReconnect();
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    const scheduleReconnect = () => {
      clearReconnectTimer();
      if (disposed) return;
      const delay = reconnectDelay;
      reconnectDelay = Math.min(reconnectDelay * 2, 15000);
      reconnectTimer = window.setTimeout(() => {
        connectWebSocket();
      }, delay);
    };

    connectWebSocket();

    const pollTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void checkServerVersion('poll');
      }
    }, pollIntervalMs);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        void checkServerVersion('poll');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      disposed = true;
      clearReconnectTimer();
      window.clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, [enabled, pollIntervalMs, checkServerVersion]);

  return { markVersionSynced };
}
