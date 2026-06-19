"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { roomApi } from "@/infrastructure/api/roomApi";
import type {
  EventLog,
  HostGameState,
  WsRoomStateHostPayload,
  WsServerMessage,
} from "@/features/game/types";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8080";

export function useHostGame() {
  const [roomID, setRoomID] = useState<string | null>(null);
  const [hostPlayerID, setHostPlayerID] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [gameState, setGameState] = useState<HostGameState | null>(null);
  const [events, setEvents] = useState<EventLog[]>([]);

  // sendをrefで保持してhandleMessage内のstale closureを回避
  const sendRef = useRef<(data: string) => void>(() => {});

  const addEvent = useCallback((type: string, payload: unknown) => {
    setEvents((prev) => [{ timestamp: Date.now(), type, payload }, ...prev]);
  }, []);

  const handleMessage = useCallback(
    (data: string) => {
      let msg: WsServerMessage;
      try {
        msg = JSON.parse(data) as WsServerMessage;
      } catch {
        return;
      }

      const logPayload = "payload" in msg ? msg.payload : { serverTimestamp: (msg as { type: "ping"; serverTimestamp: number }).serverTimestamp };
      addEvent(msg.type, logPayload);

      switch (msg.type) {
        case "ping":
          sendRef.current(JSON.stringify({ type: "pong", serverTimestamp: msg.serverTimestamp, clientTimestamp: Date.now() }));
          break;

        case "room_state": {
          const p = msg.payload as WsRoomStateHostPayload;
          setGameState({ status: p.status, players: p.players, turnip: p.turnip });
          break;
        }

        case "player_joined":
          setGameState((prev) =>
            prev
              ? {
                  ...prev,
                  players: [
                    ...prev.players,
                    { playerID: msg.payload.playerID, name: msg.payload.name, status: "active" as const, isPulling: false, pullAccumulation: 0 },
                  ],
                }
              : prev
          );
          break;

        case "game_start":
          setGameState((prev) => (prev ? { ...prev, status: "playing" } : prev));
          break;

        case "turnip_update":
          setGameState((prev) =>
            prev ? { ...prev, turnip: msg.payload } : prev
          );
          break;

        case "player_update": {
          const { playerID, isPulling } = msg.payload as { playerID: string; isPulling: boolean };
          setGameState((prev) =>
            prev
              ? {
                  ...prev,
                  players: prev.players.map((p) =>
                    p.playerID === playerID ? { ...p, isPulling } : p
                  ),
                }
              : prev
          );
          break;
        }

        case "extracted": {
          const { eliminatedPlayerIDs } = msg.payload;
          setGameState((prev) =>
            prev
              ? {
                  ...prev,
                  players: prev.players.map((p) =>
                    eliminatedPlayerIDs.includes(p.playerID)
                      ? { ...p, status: "eliminated" as const }
                      : p
                  ),
                }
              : prev
          );
          break;
        }

        case "game_finished":
          setGameState((prev) => (prev ? { ...prev, status: "finished" } : prev));
          break;
      }
    },
    [addEvent]
  );

  const { status: wsStatus, send } = useWebSocket({ url: wsUrl, onMessage: handleMessage });

  // sendRefを常に最新のsendで更新
  sendRef.current = send;

  // WS接続確立後に認証メッセージを送る
  const tokenRef = useRef(token);
  tokenRef.current = token;
  useEffect(() => {
    if (wsStatus === "connected" && tokenRef.current) {
      send(JSON.stringify({ type: "auth", token: tokenRef.current }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsStatus]);

  const createRoom = async () => {
    const res = await roomApi.createRoom();
    setRoomID(res.roomID);
    setHostPlayerID(res.hostPlayerID);
    setToken(res.token);
    addEvent("__createRoom", { roomID: res.roomID, hostPlayerID: res.hostPlayerID });
  };

  const connectWs = () => {
    if (!roomID) return;
    setWsUrl(`${WS_BASE_URL}/ws/rooms/${roomID}/host`);
  };

  const startGame = async () => {
    if (!roomID || !hostPlayerID) return;
    await roomApi.startGame(roomID, hostPlayerID);
    addEvent("__startGame", {});
  };

  const deleteRoom = async () => {
    if (!roomID) return;
    await roomApi.deleteRoom(roomID);
    setRoomID(null);
    setHostPlayerID(null);
    setToken(null);
    setWsUrl(null);
    setGameState(null);
    addEvent("__deleteRoom", {});
  };

  return {
    roomID,
    hostPlayerID,
    wsStatus,
    gameState,
    events,
    createRoom,
    connectWs,
    startGame,
    deleteRoom,
  };
}
