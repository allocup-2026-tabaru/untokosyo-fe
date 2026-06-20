"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { CONFIG } from "../config/groundDigModelConfig";
import { DogModel } from "../models/DogModel";
import { FenceField } from "../models/FenceField";
import { Forest } from "../models/Forest";
import { Ground } from "../models/Ground";
import { KabuRopeRig } from "./KabuRopeRig";
import { Rope2Model } from "../models/Rope2Model";
import { StaticModel } from "../models/StaticModel";
import { createRandom, pick, randomRange } from "../utils/groundDigModelUtils";
import { SceneLights } from "./SceneLights";
import { SkyDome } from "./SkyDome";

type Props = {
  onReady?: () => void;
  playerCount?: number;
  playerNames?: string[];
  playerLabelHeight?: number;
};

type DogPlacement = {
  characterModel: (typeof CONFIG.characterModels)[number];
  transform: {
    position: {
      x: number;
      y: number;
      z: number;
    };
    rotation: {
      y: number;
    };
    scale: number;
  };
  startDelayMs: number;
};

type PlayerNameTagProps = {
  name: string;
  position: [number, number, number];
};

function PlayerNameTag({ name, position }: PlayerNameTagProps) {
  const textWidth = Math.max(0.96, 0.36 + name.length * 0.092);
  const backgroundWidth = textWidth;
  const backgroundHeight = 0.26;

  return (
    <Billboard position={position} follow>
      <group>
        <mesh>
          <boxGeometry args={[backgroundWidth, backgroundHeight, 0.04]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.38} />
        </mesh>
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.155}
          fontWeight={300}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.005}
        >
          {name}
        </Text>
      </group>
    </Billboard>
  );
}

const getDogPlacements = (playerCount: number): DogPlacement[] => {
  const safeCount = Math.max(0, Math.floor(playerCount));

  if (safeCount === 0) {
    return [];
  }

  const baseCharacterModel = CONFIG.characterModels[0];
  const basePosition = baseCharacterModel.position;
  const baseRotationY = baseCharacterModel.rotation.y ?? 0;
  const spacing = safeCount === 1 ? 0 : Math.min(1.0, 2.6 / (safeCount - 1));
  const centerOffset = (safeCount - 1) / 2;

  return Array.from({ length: safeCount }, (_, index) => {
    const offset = index - centerOffset;
    const rng = createRandom(CONFIG.seed + safeCount * 97 + index * 53);

    return {
      characterModel: pick(rng, CONFIG.characterModels),
      transform: {
        position: {
          x: basePosition.x + offset * spacing,
          y: basePosition.y,
          z: basePosition.z + Math.abs(offset) * 0.12,
        },
        rotation: {
          y: baseRotationY + offset * 0.06,
        },
        scale: baseCharacterModel.scale,
      },
      startDelayMs: randomRange(rng, 0, 650),
    };
  });
};

export function SceneContent({
  onReady,
  playerCount = 1,
  playerNames = [],
  playerLabelHeight = 1.45,
}: Props) {
  const hasNotifiedReadyRef = useRef(false);
  const [rope2AnimationTimings, setRope2AnimationTimings] = useState<{
    pullDurationMs: number;
    pullOutDurationMs: number;
  } | null>(null);
  const characterPlacements = useMemo(() => getDogPlacements(playerCount), [playerCount]);
  const activeCharacterPlacement = characterPlacements[0];
  const animationStartDelayMs = activeCharacterPlacement?.startDelayMs ?? 0;
  const animationStartAtMs = useMemo(
    () => performance.now() + animationStartDelayMs,
    [animationStartDelayMs]
  );
  const resolvedPlayerNames = useMemo(
    () =>
      characterPlacements.map(
        (_, index) => playerNames[index] ?? `player${index + 1}`
      ),
    [characterPlacements, playerNames]
  );

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
      <KabuRopeRig
        animation={activeCharacterPlacement?.characterModel.animation}
        animationTimings={rope2AnimationTimings}
        startDelayMs={activeCharacterPlacement?.startDelayMs ?? 0}
        startAtMs={animationStartAtMs}
        motionWindow={CONFIG.models.rope2.motionWindow}
        kabuMeshOptions={{ castShadow: true, receiveShadow: true }}
        ropeMeshOptions={{ castShadow: true, receiveShadow: true }}
      />
      <Rope2Model
        transform={CONFIG.models.rope2}
        meshOptions={{ castShadow: true, receiveShadow: true }}
        animation={activeCharacterPlacement?.characterModel.animation}
        animationTimings={rope2AnimationTimings}
        startDelayMs={activeCharacterPlacement?.startDelayMs ?? 0}
        startAtMs={animationStartAtMs}
      />
      {characterPlacements.map((placement, index) => (
        <group key={`${index}-${playerCount}`}>
          <DogModel
            characterModel={placement.characterModel}
            transform={placement.transform}
            startDelayMs={placement.startDelayMs}
            startAtMs={index === 0 ? animationStartAtMs : undefined}
            onAnimationTimings={index === 0 ? setRope2AnimationTimings : undefined}
          />
          <PlayerNameTag
            name={resolvedPlayerNames[index]}
            position={[
              placement.transform.position.x,
              placement.transform.position.y + playerLabelHeight,
              placement.transform.position.z,
            ]}
          />
        </group>
      ))}
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
