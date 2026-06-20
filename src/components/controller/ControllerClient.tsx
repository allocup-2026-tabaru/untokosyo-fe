"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import BackGroundModel from "@/features/controller/BackGroundModel";
import JellyButton from "@/components/controller/Arrow";
import NameInputScreen from "@/features/controller/NameInputScreen";

type Props = {
  roomId: string;
};

export default function ControllerClient({
  roomId,
}: Props) {
  const [isNameEntered, setIsNameEntered] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 必要なら roomId を表示 */}
      <BackGroundModel />

      <Canvas
        className="absolute inset-0 z-10"
        camera={{
          position: [0, 0, 10],
          fov: 45,
        }}
      >
        <Suspense fallback={null}>
          <group position={[0, 0.8, 0]}>
            <JellyButton operate={isNameEntered} />
          </group>
        </Suspense>
      </Canvas>

      {!isNameEntered && (
        <div className="absolute inset-0 z-20">
          <NameInputScreen onStart={() => setIsNameEntered(true)} />
        </div>
      )}
    </div>
  );
}