"use client";

import { useHostGame } from "@/features/game/hooks/useHostGame";

export default function HostGamePage() {
  const { roomID, hostPlayerID, wsStatus, gameState, events, createRoom, connectWs, startGame, deleteRoom } =
    useHostGame();

  return (
    <main className="min-h-screen p-6 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">ホスト デバッグ画面</h1>

      <section className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={createRoom}
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-40"
          disabled={!!roomID}
        >
          ルーム作成
        </button>
        <button
          onClick={connectWs}
          className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-40"
          disabled={!roomID || wsStatus !== "disconnected"}
        >
          WS接続
        </button>
        <button
          onClick={startGame}
          className="px-3 py-1 bg-yellow-600 text-white rounded disabled:opacity-40"
          disabled={!roomID || wsStatus !== "connected" || gameState?.status !== "waiting"}
        >
          ゲーム開始
        </button>
        <button
          onClick={deleteRoom}
          className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-40"
          disabled={!roomID}
        >
          ルーム削除
        </button>
      </section>

      <section className="mb-4 space-y-1 text-xs">
        <div>roomID: <span className="text-green-400">{roomID ?? "—"}</span></div>
        <div>hostPlayerID: <span className="text-green-400">{hostPlayerID ?? "—"}</span></div>
        <div>WS: <span className={wsStatus === "connected" ? "text-green-400" : "text-gray-400"}>{wsStatus}</span></div>
        <div>ゲーム状態: <span className="text-yellow-400">{gameState?.status ?? "—"}</span></div>
      </section>

      {gameState && (
        <section className="mb-4">
          <div className="text-xs text-gray-400 mb-1">プレイヤー一覧</div>
          <table className="text-xs border-collapse">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pr-4">名前</th>
                <th className="pr-4">状態</th>
                <th className="pr-4">pull中</th>
                <th className="pr-4">累積pull</th>
              </tr>
            </thead>
            <tbody>
              {gameState.players.map((p) => (
                <tr key={p.playerID}>
                  <td className="pr-4">{p.name}</td>
                  <td className="pr-4">{p.status}</td>
                  <td className="pr-4">{p.isPulling ? "✓" : "—"}</td>
                  <td className="pr-4">{p.pullAccumulation.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs mt-2 text-gray-400">
            totalPull: {gameState.turnip.totalPullAccumulation.toFixed(2)} / prob: {(gameState.turnip.extractionProbability * 100).toFixed(1)}%
          </div>
        </section>
      )}

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
