import { useEffect, useRef, useCallback, useState } from 'react';

export interface Alert {
  id: number;
  patientId: number;
  patientName: string;
  treatmentId?: number;
  alertType: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (alert: Alert) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
}

export function useWebSocketAlerts(options: UseWebSocketOptions) {
  const {
    url,
    onMessage,
    onConnect,
    onDisconnect,
    reconnectInterval = 5000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState<Alert | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${url}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (mountedRef.current) {
          setIsConnected(true);
          onConnect?.();
        }
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const alert = JSON.parse(event.data) as Alert;
          setLastAlert(alert);
          onMessage?.(alert);
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e);
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        onDisconnect?.();

        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connect();
          }
        }, reconnectInterval);
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('[WebSocket] Connection failed:', e);
    }
  }, [url, onMessage, onConnect, onDisconnect, reconnectInterval]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  }, []);

  return {
    isConnected,
    lastAlert,
    sendMessage,
    reconnect: connect,
  };
}