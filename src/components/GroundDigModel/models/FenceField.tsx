"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CONFIG, type Placement } from "../config/groundDigModelConfig";
import {
  createRandom,
  prepareStaticObject,
  randomRange,
} from "../utils/groundDigModelUtils";

export function FenceField() {
  const { scene } = useGLTF(CONFIG.fence.path) as GLTF;

  const baseModel = useMemo(() => {
    return prepareStaticObject(scene, {
      castShadow: true,
      receiveShadow: true,
    });
  }, [scene]);

  const placements = useMemo<Placement[]>(() => {
    const rng = createRandom(CONFIG.seed + 41);
    const result: Placement[] = [];
    let currentX = CONFIG.fence.startX;

    for (let index = 0; index < CONFIG.fence.count; index += 1) {
      const flipped = CONFIG.fence.randomFlip && rng() < 0.5;

      result.push({
        position: [currentX, CONFIG.fence.y, CONFIG.fence.z],
        rotationY: CONFIG.fence.rotationY + (flipped ? Math.PI : 0),
        scale: CONFIG.fence.scale,
      });

      currentX += randomRange(rng, CONFIG.fence.spacingMin, CONFIG.fence.spacingMax);
    }

    return result;
  }, []);

  return (
    <group name="FenceGroup">
      {placements.map((placement, index) => {
        const fence = prepareStaticObject(baseModel, {
          castShadow: true,
          receiveShadow: true,
        });

        fence.position.set(...placement.position);
        fence.rotation.y = placement.rotationY;
        fence.scale.setScalar(placement.scale);

        return <primitive key={`fence-${index}`} object={fence} />;
      })}
    </group>
  );
}

useGLTF.preload(CONFIG.fence.path);
