import { useRef, useState } from "react";

interface WebSocketStatus {
  connected: boolean;
  message?: string;
}

export function useWebSocketConnection(wsUrl: string) {
  const [status, setStatus] = useState<WebSocketStatus>({ connected: false });
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("📡 WebSocket connected");
      setStatus({ connected: true, message: "Connected" });
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setStatus({ connected: false, message: "Disconnected" });
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
      setStatus({ connected: false, message: "Error occurred" });
    };
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, "Closed by user");
      wsRef.current = null;
      setStatus({ connected: false, message: "Disconnected manually" });
    }
  };

  return {
    connect,
    disconnect,
    status,
  };
}
