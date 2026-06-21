"use client";

import { DogModel } from "../models/DogModel";
import type { DogPlacement } from "../utils/groundDigModelPlacements";
import { PlayerNameTag } from "./PlayerNameTag";

type Props = {
  placement: DogPlacement;
  name: string;
  slipWhenKabuEscapes?: boolean;
  playerLabelHeight: number;
  animationStartAtMs: number;
  onAnimationTimings?: (timings: {
    pullDurationMs: number;
    pullOutDurationMs: number;
  }) => void;
  isPrimary?: boolean;
};

export function CharacterPlacement({
  placement,
  name,
  slipWhenKabuEscapes = false,
  playerLabelHeight,
  animationStartAtMs,
  onAnimationTimings,
  isPrimary = false,
}: Props) {
  return (
    <group>
      <DogModel
        characterModel={placement.characterModel}
        materialColors={placement.materialColors}
        transform={placement.transform}
        startDelayMs={placement.startDelayMs}
        startAtMs={isPrimary ? animationStartAtMs : undefined}
        slipWhenKabuEscapes={slipWhenKabuEscapes}
        onAnimationTimings={onAnimationTimings}
      />
      <PlayerNameTag
        name={name}
        position={[
          placement.transform.position.x,
          placement.transform.position.y + playerLabelHeight,
          placement.transform.position.z,
        ]}
      />
    </group>
  );
}
