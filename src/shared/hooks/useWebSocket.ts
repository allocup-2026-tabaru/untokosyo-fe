"use client";

import { useEffect, useRef, useState } from "react";
import { WebSocketClient } from "@/infrastructure/websocket/WebSocketClient";

type UseWebSocketOptions = {
  url: string | null;
  onMessage: (data: string) => void;
};

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export function useWebSocket({ url, onMessage }: UseWebSocketOptions) {
  const clientRef = useRef<WebSocketClient | null>(null);
  const onMessageRef = useRef(onMessage);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  // refを最新のコールバックに更新（再接続なしで最新のハンドラを使用）
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (url === null) return;

    setStatus("connecting");
    const client = new WebSocketClient();
    clientRef.current = client;

    client.onOpen(() => setStatus("connected"));
    client.onClose(() => setStatus("disconnected"));
    client.onMessage((data) => onMessageRef.current(data));

    client.connect(url);

    return () => {
      client.disconnect();
    };
  }, [url]);

  const send = (data: string) => {
    clientRef.current?.send(data);
  };

  return { status, send };
}
