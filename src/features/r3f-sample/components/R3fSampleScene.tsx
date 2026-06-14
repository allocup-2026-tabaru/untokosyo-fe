"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { GltfModel } from "./GltfModel";

type Props = { modelUrl: string };

export function R3fSampleScene({ modelUrl }: Props) {
  return (
    <Canvas camera={{ position: [0, 1, 3], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 2]} intensity={1} />
      <Suspense fallback={null}>
        <GltfModel url={modelUrl} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
