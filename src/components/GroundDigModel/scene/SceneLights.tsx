"use client";

import { CONFIG } from "../config/groundDigModelConfig";

export function SceneLights() {
  return (
    <>
      <hemisphereLight
        args={[
          CONFIG.lights.hemisphere.skyColor,
          CONFIG.lights.hemisphere.groundColor,
          CONFIG.lights.hemisphere.intensity,
        ]}
      />
      <directionalLight
        color={CONFIG.lights.sun.color}
        intensity={CONFIG.lights.sun.intensity}
        position={[
          CONFIG.lights.sun.position.x,
          CONFIG.lights.sun.position.y,
          CONFIG.lights.sun.position.z,
        ]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.00025}
      />
      <directionalLight
        color={CONFIG.lights.fill.color}
        intensity={CONFIG.lights.fill.intensity}
        position={[
          CONFIG.lights.fill.position.x,
          CONFIG.lights.fill.position.y,
          CONFIG.lights.fill.position.z,
        ]}
      />
    </>
  );
}
