"use client";

import { useEffect, useRef, useState } from "react";
import { HostWebSocketClient } from "@/infrastructure/websocket/HostWebSocketClient";
import type { HostServerEvent } from "@/infrastructure/websocket/types";
import { getRoom } from "@/infrastructure/http/roomApi";

type Player = {
  playerID: string;
  name: string;
  avatarModel?: string;
  materialColors?: Record<string, string>;
};
type ConnectionStatus = "connecting" | "connected" | "disconnected";

type GameStatus = "waiting" | "playing" | "finished";

type GameResult = {
  winnerPlayerID: string;
  winnerName: string;
  standings: Array<{
    playerID: string;
    name: string;
    pullAccumulation: number;
    rank: number;
  }>;
};

type HostSessionData = {
  hostPlayerID: string;
  token: string;
};

async function fetchPlayers(roomID: string): Promise<Player[]> {
  const room = await getRoom(roomID);
  return Object.values(room.Players).map((p) => ({
    playerID: p.ID,
    name: p.Name,
    avatarModel: p.AvatarModel,
    materialColors: p.MaterialColors,
  }));
}

function getHostSessionData(roomID: string): HostSessionData | null {
  try {
    const raw = sessionStorage.getItem(`room_host_${roomID}`);
    if (!raw) return null;
    return JSON.parse(raw) as HostSessionData;
  } catch {
    return null;
  }
}

export function useHostWebSocket(roomID: string) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [players, setPlayers] = useState<Player[]>([]);
  const [hostPlayerID, setHostPlayerID] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [pullingPlayerIDs, setPullingPlayerIDs] = useState<string[]>([]);
  const [eliminatedPlayerIDs, setEliminatedPlayerIDs] = useState<string[]>([]);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const clientRef = useRef<HostWebSocketClient | null>(null);

  useEffect(() => {
    const session = getHostSessionData(roomID);
    if (!session) {
      setStatus("disconnected");
      return;
    }

    setHostPlayerID(session.hostPlayerID);

    const client = new HostWebSocketClient();
    clientRef.current = client;

    client.onOpen(() => setStatus("connected"));
    client.onClose(() => setStatus("disconnected"));

    client.onEvent((event: HostServerEvent) => {
      if (event.type === "room_state" || event.type === "player_joined") {
        fetchPlayers(roomID).then(setPlayers).catch(console.error);
      } else if (event.type === "game_start") {
        setGameStatus("playing");
      } else if (event.type === "player_update") {
        const { playerID, isPulling } = event.payload;
        setPullingPlayerIDs((prev) =>
          isPulling ? [...prev.filter((id) => id !== playerID), playerID] : prev.filter((id) => id !== playerID)
        );
      } else if (event.type === "extracted") {
        setEliminatedPlayerIDs((prev) => [...prev, ...event.payload.eliminatedPlayerIDs]);
      } else if (event.type === "game_finished") {
        setGameStatus("finished");
        setGameResult(event.payload);
      }
    });

    client.connect(roomID, session.token);

    return () => {
      client.disconnect();
    };
  }, [roomID]);

  return { status, players, hostPlayerID, gameStatus, pullingPlayerIDs, eliminatedPlayerIDs, gameResult };
}
