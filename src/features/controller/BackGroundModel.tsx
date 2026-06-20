"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../../components/GroundDigModel/config/groundDigModelConfigController";
import { LoadingOverlay } from "../../components/GroundDigModel/scene/LoadingOverlay";
import { SceneContent } from "../../components/GroundDigModel/scene/SceneContentController";
import "./BackGroundModel.css";

export default function BackGroundModel() {
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
          <SceneContent onReady={() => setIsLoaded(true)} />
        </Suspense>
      </Canvas>
    </div>
  );

}