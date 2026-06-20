"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { CONFIG } from "../config/groundDigModelConfig_controller";
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
  const { camera, size } = useThree();

  const aspect = size.width / size.height;
  const isPortrait = aspect < 1.0;
  const cameraConfig = isPortrait ? CONFIG.camera.portrait : CONFIG.camera.landscape;

  useEffect(() => {
    if (hasNotifiedReadyRef.current) {
      return;
    }

    hasNotifiedReadyRef.current = true;
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    camera.position.set(cameraConfig.position.x, cameraConfig.position.y, cameraConfig.position.z);
    camera.lookAt(cameraConfig.target.x, cameraConfig.target.y, cameraConfig.target.z);
    camera.updateProjectionMatrix();
  }, [isPortrait, camera, cameraConfig]);

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
      <FenceField />
      <Forest />
      {/* <OrbitControls
        makeDefault
        target={[
          cameraConfig.target.x,
          cameraConfig.target.y,
          cameraConfig.target.z,
        ]}
        enableDamping
        dampingFactor={0.07}
        enablePan={false}
        minDistance={4.5}
        maxDistance={15}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.48}
      /> */}
    </>
  );
}
