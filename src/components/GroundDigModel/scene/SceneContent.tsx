"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { CONFIG } from "../config/groundDigModelConfig";
import { DogModel } from "../models/DogModel";
import { FenceField } from "../models/FenceField";
import { Forest } from "../models/Forest";
import { Ground } from "../models/Ground";
import { StaticModel } from "../models/StaticModel";
import { SceneLights } from "./SceneLights";
import { SkyDome } from "./SkyDome";

type Props = {
  onReady?: () => void;
};

export function SceneContent({ onReady }: Props) {
  const hasNotifiedReadyRef = useRef(false);

  useEffect(() => {
    if (hasNotifiedReadyRef.current) {
      return;
    }

    hasNotifiedReadyRef.current = true;
    onReady?.();
  }, [onReady]);

  return (
    <>
      <color
        attach="background"
        args={[`#${CONFIG.scene.backgroundColor.toString(16).padStart(6, "0")}`]}
      />
      <fog
        attach="fog"
        args={[CONFIG.scene.backgroundColor, CONFIG.scene.fogNear, CONFIG.scene.fogFar]}
      />
      <SkyDome />
      <SceneLights />
      <Ground />
      <StaticModel
        url={CONFIG.models.dig.path}
        transform={CONFIG.models.dig}
        meshOptions={{ castShadow: false, receiveShadow: true }}
      />
      <StaticModel
        url={CONFIG.models.kabu.path}
        transform={CONFIG.models.kabu}
        meshOptions={{ castShadow: true, receiveShadow: true }}
      />
      <StaticModel
        url={CONFIG.models.rope.path}
        transform={CONFIG.models.rope}
        meshOptions={{ castShadow: true, receiveShadow: true }}
      />
      <StaticModel
        url={CONFIG.models.rope2.path}
        transform={CONFIG.models.rope2}
        meshOptions={{ castShadow: true, receiveShadow: true }}
      />
      <DogModel />
      <FenceField />
      <Forest />
      <OrbitControls
        makeDefault
        target={[
          CONFIG.camera.target.x,
          CONFIG.camera.target.y,
          CONFIG.camera.target.z,
        ]}
        enableDamping
        dampingFactor={0.07}
        enablePan={false}
        minDistance={4.5}
        maxDistance={15}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.48}
      />
    </>
  );
}
