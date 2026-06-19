"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { roomApi } from "@/infrastructure/api/roomApi";
import type {
  EventLog,
  PlayerState,
  WsRoomStatePlayerPayload,
  WsPlayerUpdatePlayerPayload,
  WsServerMessage,
} from "@/features/game/types";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8080";

export function usePlayerController() {
  const [playerID, setPlayerID] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [events, setEvents] = useState<EventLog[]>([]);

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
          const p = msg.payload as WsRoomStatePlayerPayload;
          setPlayerState({
            status: p.status,
            myPlayerID: p.myPlayerID,
            myPullAccumulation: p.myPullAccumulation,
            isPulling: false,
            playerStatus: "active",
          });
          break;
        }

        case "game_start":
          setPlayerState((prev) => (prev ? { ...prev, status: "playing" } : prev));
          break;

        case "player_update": {
          const p = msg.payload as WsPlayerUpdatePlayerPayload;
          setPlayerState((prev) =>
            prev ? { ...prev, isPulling: p.isPulling, playerStatus: p.status } : prev
          );
          break;
        }

        case "eliminated":
          setPlayerState((prev) =>
            prev ? { ...prev, playerStatus: "eliminated" } : prev
          );
          break;

        case "game_finished":
          setPlayerState((prev) => (prev ? { ...prev, status: "finished" } : prev));
          break;
      }
    },
    [addEvent]
  );

  const { status: wsStatus, send } = useWebSocket({ url: wsUrl, onMessage: handleMessage });

  sendRef.current = send;

  const tokenRef = useRef(token);
  tokenRef.current = token;
  useEffect(() => {
    if (wsStatus === "connected" && tokenRef.current) {
      send(JSON.stringify({ type: "auth", token: tokenRef.current }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsStatus]);

  const joinRoom = async (roomID: string, name: string) => {
    const res = await roomApi.joinRoom(roomID, name);
    setPlayerID(res.playerID);
    setToken(res.token);
    addEvent("__joinRoom", { roomID, playerID: res.playerID, name: res.name });
  };

  const connectWs = (roomID: string) => {
    if (!playerID) return;
    setWsUrl(`${WS_BASE_URL}/ws/rooms/${roomID}/player?playerID=${playerID}`);
  };

  const pull = () => {
    if (!playerID) return;
    send(JSON.stringify({ type: "pull", playerID, clientTimestamp: Date.now() }));
    addEvent("__pull", { playerID });
  };

  const release = () => {
    if (!playerID) return;
    send(JSON.stringify({ type: "release", playerID, clientTimestamp: Date.now() }));
    addEvent("__release", { playerID });
  };

  return {
    playerID,
    wsStatus,
    playerState,
    events,
    joinRoom,
    connectWs,
    pull,
    release,
  };
}
