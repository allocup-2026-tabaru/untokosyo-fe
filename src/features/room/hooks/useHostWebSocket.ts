"use client";

import { useEffect, useRef, useState } from "react";
import { HostWebSocketClient } from "@/infrastructure/websocket/HostWebSocketClient";
import type { HostServerEvent } from "@/infrastructure/websocket/types";

type Player = { playerID: string; name: string };
type ConnectionStatus = "connecting" | "connected" | "disconnected";

type HostSessionData = {
  hostPlayerID: string;
  token: string;
};

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
      if (event.type === "room_state") {
        setPlayers(
          event.payload.players.map((p) => ({ playerID: p.playerID, name: p.name }))
        );
      } else if (event.type === "player_joined") {
        setPlayers((prev) => {
          if (prev.some((p) => p.playerID === event.payload.playerID)) return prev;
          return [...prev, { playerID: event.payload.playerID, name: event.payload.name }];
        });
      }
    });

    client.connect(roomID, session.token);

    return () => {
      client.disconnect();
    };
  }, [roomID]);

  return { status, players, hostPlayerID };
}
