"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ControllerScene } from "@/features/controller/scene/ControllerScene";
import { PullArrowIndicator } from "./PullArrowIndicator";
import { NameInputScreen } from "./NameInputScreen";
import { StartCountDown } from "./StartCountDown";
import { usePlayerController } from "@/features/game/hooks/usePlayerController";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { Panel } from "@/components/ui/Panel";

type Phase = "name_input" | "lobby" | "countdown" | "playing" | "eliminated" | "finished";

type Props = {
  roomId: string;
};

export function ControllerClient({ roomId }: Props) {
  const [phase, setPhase] = useState<Phase>("name_input");
  const [connectPending, setConnectPending] = useState(false);
  const { playerID, playerState, scheduledStartAt, joinRoom, connectWs, pull, release } =
    usePlayerController();

  // joinRoom 完了後に playerID が確定してから WS 接続する
  useEffect(() => {
    if (playerID && connectPending) {
      connectWs(roomId);
      setConnectPending(false);
    }
  }, [playerID, connectPending, connectWs, roomId]);

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
      await joinRoom(roomId, name);
      setConnectPending(true);
      setPhase("lobby");
    },
    [roomId, joinRoom]
  );

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
