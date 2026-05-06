import { useEffect, useRef, useState, useCallback } from 'react';

export interface ChatMessage {
  id: string | number;
  senderName: string;
  senderAvatarUrl?: string;
  senderAvatarId?: string | number;
  messageText: string;
  sentAt: string;
  online?: boolean;
}

interface RixMessage {
  type: 'response' | 'error';
  text: string;
  timestamp: string;
}

export function useWebSocketChat() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const wsHost = window.location.hostname === 'localhost'
      ? 'localhost:8080'
      : 'api.raddix.pro';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${wsHost}/v1/ws/chat`);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, {
          id: data.id || Date.now().toString(),
          senderName: data.from || 'Unknown',
          messageText: data.text || '',
          sentAt: data.timestamp || new Date().toISOString(),
          online: true,
        }]);
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    setConnected(false);
  }, []);

  const sendMessage = useCallback((text: string, senderName: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return false;
    wsRef.current.send(JSON.stringify({ from: senderName, text }));
    return true;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { connected, messages, sendMessage, disconnect };
}

export function useWebSocketRix() {
  const [connected, setConnected] = useState(false);
  const [responses, setResponses] = useState<RixMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const wsHost = window.location.hostname === 'localhost'
      ? 'localhost:8080'
      : 'api.raddix.pro';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${wsHost}/v1/ws/rix`);

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setResponses((prev) => [...prev, {
          type: data.type || 'response',
          text: data.text || '',
          timestamp: data.timestamp || new Date().toISOString(),
        }]);
      } catch {}
    };

    ws.onclose = () => setConnected(false);

    wsRef.current = ws;
  }, []);

  const sendQuery = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return false;
    wsRef.current.send(JSON.stringify({ text, context: { time: new Date().toISOString() } }));
    return true;
  }, []);

  useEffect(() => {
    connect();
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [connect]);

  return { connected, responses, sendQuery };
}
