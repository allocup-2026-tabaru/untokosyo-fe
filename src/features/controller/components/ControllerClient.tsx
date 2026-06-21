"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ControllerScene } from "@/features/controller/scene/ControllerScene";
import { PullArrowIndicator } from "./PullArrowIndicator";
import { NameInputScreen } from "./NameInputScreen";
import { StartCountDown } from "./StartCountDown";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { Panel } from "@/components/ui/Panel";
import { joinRoom as joinRoomApi } from "@/infrastructure/http/roomApi";
import { PlayerWebSocketClient } from "@/infrastructure/websocket/PlayerWebSocketClient";
import type { PlayerServerEvent } from "@/infrastructure/websocket/types";
import { CONFIG } from "@/components/ground-dig-model/config/groundDigModelConfig";
import {
  createRandomSource,
  createDogMaterialColors,
  createJiji2MaterialColors,
} from "@/components/ground-dig-model/config/groundDigModelColorUtils";
import { pick, randomRange } from "@/components/ground-dig-model/utils/groundDigModelUtils";

type Phase = "name_input" | "lobby" | "countdown" | "playing" | "eliminated" | "finished";

type PlayerState = {
  status: string;
  playerStatus: string;
  isPulling: boolean;
  myPullAccumulation: number;
  myRank: number | null;
};

type Props = {
  roomId: string;
};

type PlayerSessionData = {
  playerID: string;
  token: string;
};

function getPlayerSessionData(roomId: string): PlayerSessionData | null {
  try {
    const raw = sessionStorage.getItem(`room_player_${roomId}`);
    if (!raw) return null;
    return JSON.parse(raw) as PlayerSessionData;
  } catch {
    return null;
  }
}

function setPlayerSessionData(roomId: string, session: PlayerSessionData): void {
  sessionStorage.setItem(`room_player_${roomId}`, JSON.stringify(session));
}

export function ControllerClient({ roomId }: Props) {
  const [phase, setPhase] = useState<Phase>("name_input");
  const [playerID, setPlayerID] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [scheduledStartAt, setScheduledStartAt] = useState<number | null>(null);
  const clientRef = useRef<PlayerWebSocketClient | null>(null);

  useEffect(() => {
    const session = getPlayerSessionData(roomId);
    if (!session) return;

    setPlayerID(session.playerID);
    setToken(session.token);
    setPhase("lobby");
  }, [roomId]);

  // playerIDとtokenが確定したらWS接続
  useEffect(() => {
    if (!playerID || !token) return;

    const client = new PlayerWebSocketClient();
    clientRef.current = client;

    client.onEvent((event: PlayerServerEvent) => {
      if (event.type === "room_state") {
        setPlayerState({
          status: event.payload.status,
          playerStatus: "active",
          isPulling: false,
          myPullAccumulation: event.payload.myPullAccumulation,
          myRank: null,
        });
        if (event.payload.status === "waiting") {
          setPhase("lobby");
        }
      } else if (event.type === "game_countdown") {
        setScheduledStartAt(event.payload.scheduledStartAt);
      } else if (event.type === "game_start") {
        setPlayerState((prev) => (prev ? { ...prev, status: "playing" } : null));
      } else if (event.type === "player_update") {
        setPlayerState((prev) => {
          if (!prev) return prev;
          return event.payload.playerID === playerID
            ? { ...prev, isPulling: event.payload.isPulling }
            : prev;
        });
      } else if (event.type === "eliminated") {
        setPlayerState((prev) => (prev ? { ...prev, playerStatus: "eliminated" } : null));
      } else if (event.type === "game_finished") {
        setPlayerState((prev) =>
          prev
            ? {
                ...prev,
                status: "finished",
                myPullAccumulation: event.payload.myPullAccumulation,
                myRank: event.payload.myRank,
              }
            : null
        );
      }
    });

    client.connect(roomId, playerID, token);

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [playerID, token, roomId]);

  // phase遷移
  useEffect(() => {
    if (scheduledStartAt !== null && phase === "lobby") {
      setPhase("countdown");
    }
  }, [scheduledStartAt, phase]);

  useEffect(() => {
    if (playerState?.status === "playing" && (phase === "countdown" || phase === "lobby")) {
      setPhase("playing");
    }
  }, [playerState?.status, phase]);

  useEffect(() => {
    if (playerState?.playerStatus === "eliminated" && phase === "playing") {
      setPhase("eliminated");
    }
  }, [playerState?.playerStatus, phase]);

  useEffect(() => {
    if (playerState?.status === "finished" && phase !== "finished") {
      setPhase("finished");
    }
  }, [playerState?.status, phase]);

  const handleNameSubmit = useCallback(
    async (name: string) => {
      const characterModel = pick(createRandomSource(), CONFIG.characterModels);
      const baseHue = randomRange(createRandomSource(), 0, 360);
      const playerIndex = Math.floor(randomRange(createRandomSource(), 0, 20));
      const materialColors =
        characterModel.id === "jiji2"
          ? createJiji2MaterialColors(baseHue, playerIndex)
          : createDogMaterialColors(baseHue, playerIndex);

      const res = await joinRoomApi(roomId, name, characterModel.id, materialColors);
      setPlayerSessionData(roomId, { playerID: res.playerID, token: res.token });
      setPlayerID(res.playerID);
      setToken(res.token);
      setPhase("lobby");
    },
    [roomId]
  );

  const pull = useCallback(() => {
    if (!playerID || !clientRef.current) return;
    clientRef.current.send({ type: "pull", playerID, clientTimestamp: Date.now() });
    setPlayerState((prev) => (prev ? { ...prev, isPulling: true } : prev));
  }, [playerID]);

  const release = useCallback(() => {
    if (!playerID || !clientRef.current) return;
    clientRef.current.send({ type: "release", playerID, clientTimestamp: Date.now() });
    setPlayerState((prev) => (prev ? { ...prev, isPulling: false } : prev));
  }, [playerID]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <ControllerScene />

      <Canvas
        className="absolute inset-0 z-10"
        camera={{ position: [0, 0, 10], fov: 45 }}
      >
        <Suspense fallback={null}>
          <group position={[0, 0.8, 0]}>
            <PullArrowIndicator
              operate={phase === "playing"}
              onPullStart={pull}
              onPullEnd={release}
            />
          </group>
        </Suspense>
      </Canvas>

      {phase === "name_input" && <NameInputScreen onStart={handleNameSubmit} />}

      {phase === "lobby" && (
        <ModalOverlay>
          <div className="flex h-full w-full items-center justify-center">
            <Panel className="w-full max-w-sm">
              <p className="text-center text-text-primary">ゲーム開始を待っています...</p>
            </Panel>
          </div>
        </ModalOverlay>
      )}

      {phase === "countdown" && scheduledStartAt !== null && (
        <StartCountDown
          scheduledStartAt={scheduledStartAt}
          onStart={() => setPhase("playing")}
        />
      )}

      {phase === "eliminated" && (
        <ModalOverlay>
          <div className="flex h-full w-full items-center justify-center">
            <Panel className="w-full max-w-sm">
              <div className="flex flex-col items-center gap-4">
                <p className="text-2xl font-bold text-text-primary">脱落...</p>
                <p className="text-sm text-text-secondary">ゲーム終了をお待ちください</p>
              </div>
            </Panel>
          </div>
        </ModalOverlay>
      )}

      {phase === "finished" && (
        <ModalOverlay>
          <div className="flex h-full w-full items-center justify-center">
            <Panel className="w-full max-w-sm">
              <div className="flex flex-col items-center gap-6">
                <p className="text-2xl font-bold text-text-primary">ゲーム終了！</p>
                {playerState && (
                  <>
                    <p className="text-4xl font-bold text-text-primary">
                      {playerState.myRank !== null ? `${playerState.myRank}位` : "—"}
                    </p>
                    <p className="text-sm text-text-secondary">
                      累積pull: {playerState.myPullAccumulation.toFixed(1)}
                    </p>
                  </>
                )}
              </div>
            </Panel>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
