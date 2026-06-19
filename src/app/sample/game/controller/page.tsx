"use client";

import { useState } from "react";
import { usePlayerController } from "@/features/game/hooks/usePlayerController";

export default function ControllerPage() {
  const [roomIDInput, setRoomIDInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const { playerID, wsStatus, playerState, events, joinRoom, connectWs, pull, release } =
    usePlayerController();

  const handleJoin = async () => {
    if (!roomIDInput || !nameInput) return;
    await joinRoom(roomIDInput, nameInput);
  };

  const handleConnectWs = () => {
    connectWs(roomIDInput);
  };

  return (
    <main className="min-h-screen p-6 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">コントローラー デバッグ画面</h1>

      <section className="mb-4 flex flex-col gap-2 max-w-sm">
        <input
          type="text"
          placeholder="roomID"
          value={roomIDInput}
          onChange={(e) => setRoomIDInput(e.target.value)}
          className="px-2 py-1 bg-gray-800 text-white rounded border border-gray-600 text-xs"
          disabled={!!playerID}
        />
        <input
          type="text"
          placeholder="プレイヤー名"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="px-2 py-1 bg-gray-800 text-white rounded border border-gray-600 text-xs"
          disabled={!!playerID}
        />
        <div className="flex gap-2">
          <button
            onClick={handleJoin}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-40"
            disabled={!!playerID || !roomIDInput || !nameInput}
          >
            参加
          </button>
          <button
            onClick={handleConnectWs}
            className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-40"
            disabled={!playerID || wsStatus !== "disconnected"}
          >
            WS接続
          </button>
        </div>
      </section>

      <section className="mb-4 flex gap-3">
        <button
          onPointerDown={pull}
          onPointerUp={release}
          onPointerLeave={release}
          className="px-6 py-3 bg-orange-600 text-white rounded text-base font-bold select-none disabled:opacity-40"
          disabled={wsStatus !== "connected" || playerState?.status !== "playing" || playerState?.playerStatus === "eliminated"}
        >
          PULL（長押し）
        </button>
      </section>

      <section className="mb-4 space-y-1 text-xs">
        <div>playerID: <span className="text-green-400">{playerID ?? "—"}</span></div>
        <div>WS: <span className={wsStatus === "connected" ? "text-green-400" : "text-gray-400"}>{wsStatus}</span></div>
        {playerState && (
          <>
            <div>ゲーム状態: <span className="text-yellow-400">{playerState.status}</span></div>
            <div>プレイヤー状態: <span className={playerState.playerStatus === "eliminated" ? "text-red-400" : "text-green-400"}>{playerState.playerStatus}</span></div>
            <div>isPulling: <span className="text-yellow-400">{playerState.isPulling ? "true" : "false"}</span></div>
            <div>累積pull: <span className="text-yellow-400">{playerState.myPullAccumulation.toFixed(2)}</span></div>
          </>
        )}
      </section>

      <section>
        <div className="text-xs text-gray-400 mb-1">イベントログ（新着順）</div>
        <div className="h-64 overflow-y-auto bg-gray-900 rounded p-2 space-y-1">
          {events.map((e, i) => (
            <div key={i} className="text-xs">
              <span className="text-gray-500">{new Date(e.timestamp).toISOString().slice(11, 23)}</span>{" "}
              <span className={e.type.startsWith("__") ? "text-blue-400" : "text-green-400"}>[{e.type}]</span>{" "}
              <span className="text-gray-300">{JSON.stringify(e.payload)}</span>
            </div>
          ))}
          {events.length === 0 && <div className="text-gray-600">イベントなし</div>}
        </div>
      </section>
    </main>
  );
}
