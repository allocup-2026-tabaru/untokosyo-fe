"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "@/components/ground-dig-model/config/groundDigModelConfig";
import { Ground } from "@/components/ground-dig-model/models/Ground";
import { StaticModel } from "@/components/ground-dig-model/models/StaticModel";
import { SceneLights } from "@/components/ground-dig-model/scene/SceneLights";
import { SkyDome } from "@/components/ground-dig-model/scene/SkyDome";
import { StartLobbyLogo } from "./StartLobbyLogo";

export type LobbySceneVariant = "start" | "room";

type Props = {
  variant: LobbySceneVariant;
  onReady?: () => void;
};

function AnimatedCamera({ variant }: { variant: LobbySceneVariant }) {
  const camera = useThree((state) => state.camera);
  const desiredPositionRef = useRef(
    new THREE.Vector3(...CONFIG.lobbyCameraPresets.start.position),
  );
  const currentTargetRef = useRef(
    new THREE.Vector3(...CONFIG.lobbyCameraPresets.start.target),
  );
  const desiredTargetRef = useRef(
    new THREE.Vector3(...CONFIG.lobbyCameraPresets.start.target),
  );

  useEffect(() => {
    const preset = CONFIG.lobbyCameraPresets[variant];
    desiredPositionRef.current.set(...preset.position);
    desiredTargetRef.current.set(...preset.target);
  }, [variant]);

  useFrame((_, delta) => {
    const easing = 1 - Math.exp(-delta * 2.4);

    camera.position.lerp(desiredPositionRef.current, easing);
    currentTargetRef.current.lerp(desiredTargetRef.current, easing);
    camera.lookAt(currentTargetRef.current);
  });

  return null;
}

export function LobbySceneContent({ variant, onReady }: Props) {
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
      <AnimatedCamera variant={variant} />
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
      <StartLobbyLogo />
    </>
  );
}
