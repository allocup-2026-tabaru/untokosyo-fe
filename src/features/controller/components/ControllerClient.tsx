"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { ControllerScene } from "@/features/controller/scene/ControllerScene";
import { PullArrowIndicator } from "./PullArrowIndicator";
import { NameInputScreen } from "./NameInputScreen";
import { StartCountDown } from "./StartCountDown";

type Props = {
  roomId: string;
};

export function ControllerClient({ roomId }: Props) {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const gameUIFlag=false;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <ControllerScene />

      <Canvas
        className="absolute inset-0 z-10"
        camera={{
          position: [0, 0, 10],
          fov: 45,
        }}
      >
        <Suspense fallback={null}>
          <group position={[0, 0.8, 0]}>
            <PullArrowIndicator operate={playerName !== null} />
          </group>
        </Suspense>
      </Canvas>

      {playerName === null && (
        <NameInputScreen onStart={setPlayerName} />
      )}

      {/* StartCountDownの挙動を確認するための部分 */}
      <StartCountDown
        onStart={() => {
          console.log("カウントダウン終了！");
      }}
      />
    </div>
  );
}
