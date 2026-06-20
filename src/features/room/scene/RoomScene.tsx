"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "@/components/ground-dig-model/config/groundDigModelConfig";
import { LoadingOverlay } from "@/components/ground-dig-model/scene/LoadingOverlay";
import { RoomSceneContent } from "./RoomSceneContent";
import "@/components/ground-dig-model/GroundDigModel.css";

type Props = {
  playerCount: number;
  playerNames: string[];
  playerSlipFlags?: boolean[];
  isWaiting?: boolean;
  playerLabelHeight?: number;
};

export function RoomScene({
  playerCount,
  playerNames,
  playerSlipFlags = [],
  playerLabelHeight = 2,
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="ground-dig-root">
      <LoadingOverlay visible={!isLoaded} />
      <Canvas
        className="ground-dig-canvas"
        shadows
        dpr={[1, CONFIG.renderer.maxPixelRatio]}
        camera={{
          position: [
            CONFIG.camera.position.x,
            CONFIG.camera.position.y,
            CONFIG.camera.position.z,
          ],
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
          <RoomSceneContent
            onReady={() => setIsLoaded(true)}
            playerCount={playerCount}
            playerNames={playerNames}
            playerSlipFlags={playerSlipFlags}
            playerLabelHeight={playerLabelHeight}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
