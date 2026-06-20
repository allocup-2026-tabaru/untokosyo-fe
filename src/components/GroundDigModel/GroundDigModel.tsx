"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "./config/groundDigModelConfig";
import { LoadingOverlay } from "./scene/LoadingOverlay";
import { SceneContent } from "./scene/SceneContent";
import "./GroundDigModel.css";

type Props = {
  isWaiting?: boolean;
  playerCount?: number;
};

const TEMP_PLAYER_COUNT = 3;

export default function GroundDigModel({ isWaiting, playerCount }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedPlayerCount = playerCount ?? TEMP_PLAYER_COUNT;
  void isWaiting;

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
          <SceneContent
            onReady={() => setIsLoaded(true)}
            playerCount={resolvedPlayerCount}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
