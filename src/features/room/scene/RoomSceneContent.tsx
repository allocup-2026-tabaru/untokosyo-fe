"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { CONFIG } from "@/components/GroundDigModel/config/groundDigModelConfig";
import { FenceField } from "@/components/GroundDigModel/models/FenceField";
import { Forest } from "@/components/GroundDigModel/models/Forest";
import { Ground } from "@/components/GroundDigModel/models/Ground";
import { KabuRopeRig } from "@/components/GroundDigModel/scene/KabuRopeRig";
import { Rope2Model } from "@/components/GroundDigModel/models/Rope2Model";
import { StaticModel } from "@/components/GroundDigModel/models/StaticModel";
import { getDogPlacements } from "@/components/GroundDigModel/utils/groundDigModelPlacements";
import { CharacterPlacement } from "@/components/GroundDigModel/scene/CharacterPlacement";
import { SceneLights } from "@/components/GroundDigModel/scene/SceneLights";
import { SkyDome } from "@/components/GroundDigModel/scene/SkyDome";
import { ROOM_PLACEMENT_CONFIG } from "../config/roomPlacementConfig";

type Props = {
  onReady?: () => void;
  playerCount?: number;
  playerNames?: string[];
  playerLabelHeight?: number;
};

export function RoomSceneContent({
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
  const characterPlacements = useMemo(
    () => getDogPlacements(playerCount, ROOM_PLACEMENT_CONFIG),
    [playerCount]
  );
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
        <CharacterPlacement
          key={`${index}-${playerCount}`}
          placement={placement}
          name={resolvedPlayerNames[index]}
          playerLabelHeight={playerLabelHeight}
          animationStartAtMs={animationStartAtMs}
          onAnimationTimings={index === 0 ? setRope2AnimationTimings : undefined}
          isPrimary={index === 0}
        />
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
