"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import BackGroundModel from "@/features/controller/BackGroundModel";
import JellyButton from "@/components/controller/Arrow";

type Props = {
  roomId: string;
};

export default function ControllerClient({
  roomId,
}: Props) {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 必要なら roomId を表示 */}
      <div className="absolute top-4 left-4 z-20 text-white">
        コントローラー画面 {roomId}
      </div>

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
            <JellyButton />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}