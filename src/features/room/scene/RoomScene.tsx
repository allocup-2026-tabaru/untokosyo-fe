"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "@/components/ground-dig-model/config/groundDigModelConfig";
import { LoadingOverlay } from "@/components/ground-dig-model/scene/LoadingOverlay";
import { RoomSceneContent } from "./RoomSceneContent";
import "@/components/ground-dig-model/GroundDigModel.css";

import type { PlayerAvatarInfo } from "@/components/ground-dig-model/utils/groundDigModelPlacements";

type Props = {
  playerCount: number;
  playerNames: string[];
  playerAvatars?: PlayerAvatarInfo[];
  isWaiting?: boolean;
  playerSlipFlags?: boolean[];
  onKabuEscapeStart?: () => void;
  playerLabelHeight?: number;
  kabuEscapeTriggered?: boolean;
};

export function RoomScene({
  playerCount,
  playerNames,
  playerAvatars,
  playerSlipFlags = [],
  onKabuEscapeStart,
  playerLabelHeight = 2,
  kabuEscapeTriggered = false,
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
            onKabuEscapeStart={onKabuEscapeStart}
            playerCount={playerCount}
            playerNames={playerNames}
            playerAvatars={playerAvatars}
            playerSlipFlags={playerSlipFlags}
            playerLabelHeight={playerLabelHeight}
            kabuEscapeTriggered={kabuEscapeTriggered}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
