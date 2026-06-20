import { CONFIG, type CharacterModelConfig } from "../config/groundDigModelConfig";
import {
  createDogMaterialColors,
  createJiji2MaterialColors,
  createRandomSource,
} from "../config/groundDigModelColorUtils";
import { pick, randomRange } from "./groundDigModelUtils";

export type DogPlacement = {
  characterModel: CharacterModelConfig;
  materialColors: Record<string, string>;
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

export const getDogPlacements = (playerCount: number): DogPlacement[] => {
  const safeCount = Math.max(0, Math.floor(playerCount));

  if (safeCount === 0) {
    return [];
  }

  const baseCharacterModel = CONFIG.characterModels[0];
  const basePosition = baseCharacterModel.position;
  const baseRotationY = baseCharacterModel.rotation.y ?? 0;
  const spacing = safeCount === 1 ? 0 : Math.min(1.0, 2.6 / (safeCount - 1));
  const centerOffset = (safeCount - 1) / 2;
  const loadHue = randomRange(createRandomSource(), 0, 360);

  return Array.from({ length: safeCount }, (_, index) => {
    const offset = index - centerOffset;
    const rng = createRandomSource();
    const characterModel = pick(rng, CONFIG.characterModels);
    const materialColors =
      characterModel.id === "jiji2"
        ? createJiji2MaterialColors(loadHue + 180, index)
        : createDogMaterialColors(loadHue, index);

    return {
      characterModel,
      materialColors,
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
