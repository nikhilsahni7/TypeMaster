import { useCallback, useEffect, useRef, useState } from 'react';

type WSEventType =
  | 'join_lobby'
  | 'leave_lobby'
  | 'chat_message'
  | 'typing_update'
  | 'game_start'
  | 'game_end'
  | 'error';

interface WSEvent {
  type: WSEventType;
  payload: any;
}

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSEvent | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    socket.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const message: WSEvent = JSON.parse(event.data);
        setLastMessage(message);
      } catch (e) {
        console.error('Failed to parse WS message:', event.data);
      }
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = useCallback((type: WSEventType, payload: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  return { isConnected, lastMessage, sendMessage };
};
