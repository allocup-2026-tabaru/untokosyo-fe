"use client";

import { useCounter } from "@/features/counter/hooks/useCounter";

const STATUS_LABEL: Record<string, string> = {
  connecting: "接続中...",
  connected: "接続済み",
  disconnected: "切断",
};

const STATUS_COLOR: Record<string, string> = {
  connecting: "text-yellow-500",
  connected: "text-green-500",
  disconnected: "text-red-500",
};

export function CounterDisplay() {
  const { count, status, increment } = useCounter();

  return (
    <div className="flex flex-col items-center gap-6 p-8 border rounded-xl shadow-md">
      <div className={`text-sm font-medium ${STATUS_COLOR[status]}`}>
        {STATUS_LABEL[status]}
      </div>

      <div className="text-6xl font-bold tabular-nums">
        {count ?? "—"}
      </div>

      <button
        onClick={increment}
        disabled={status !== "connected"}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
      >
        Increment
      </button>
    </div>
  );
}
