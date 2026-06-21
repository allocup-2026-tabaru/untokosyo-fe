"use client";

import { useCallback, useState } from "react";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
type CounterMessage = { count: number };

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";

export function useCounter() {
  const [count, setCount] = useState<number | null>(null);

  const handleMessage = useCallback((data: string) => {
    try {
      const parsed: CounterMessage = JSON.parse(data);
      setCount(parsed.count);
    } catch {
      // 不正なメッセージは無視
    }
  }, []);

  const { status, send } = useWebSocket({ url: WS_URL, onMessage: handleMessage });

  const increment = () => send("increment");

  return { count, status, increment };
}
