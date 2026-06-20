"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "@/components/GroundDigModel/config/groundDigModelConfig";
import { LoadingOverlay } from "@/components/GroundDigModel/scene/LoadingOverlay";
import { LobbySceneContent, type LobbySceneVariant } from "./LobbySceneContent";

type Props = {
  variant: LobbySceneVariant;
};

export function LobbyBackgroundScene({ variant }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);

  const camera = useMemo(() => CONFIG.lobbyCameraPresets[variant], [variant]);

  return (
    <div className="pointer-events-none fixed inset-0">
      <LoadingOverlay visible={!isLoaded} />
      <Canvas
        className="h-full w-full"
        shadows
        dpr={[1, CONFIG.renderer.maxPixelRatio]}
        camera={{
          position: camera.position,
          fov: CONFIG.camera.fov,
          near: CONFIG.camera.near,
          far: CONFIG.camera.far,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = CONFIG.renderer.exposure;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Suspense fallback={null}>
          <LobbySceneContent variant={variant} onReady={() => setIsLoaded(true)} />
        </Suspense>
      </Canvas>
    </div>
  );
}
