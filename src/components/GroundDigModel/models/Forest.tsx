"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { CONFIG, type ForestPlacement } from "../config/groundDigModelConfig";
import {
  createRandom,
  prepareStaticObject,
  randomRange,
} from "../utils/groundDigModelUtils";

export function Forest() {
  const treeA = useGLTF(CONFIG.forest.paths[0]) as GLTF;
  const treeB = useGLTF(CONFIG.forest.paths[1]) as GLTF;

  const treeBases = useMemo(() => {
    return [treeA.scene, treeB.scene].map((scene) =>
      prepareStaticObject(scene, {
        castShadow: true,
        receiveShadow: true,
      })
    );
  }, [treeA.scene, treeB.scene]);

  const placements = useMemo<ForestPlacement[]>(() => {
    const rng = createRandom(CONFIG.seed + 73);

    return Array.from({ length: CONFIG.forest.count }, () => {
      const z = randomRange(
        rng,
        CONFIG.forest.area.zMin,
        CONFIG.forest.area.zMax
      );
      const depth01 = THREE.MathUtils.clamp(
        (z - CONFIG.forest.area.zMin) /
          (CONFIG.forest.area.zMax - CONFIG.forest.area.zMin),
        0,
        1
      );

      return {
        position: [
          randomRange(rng, CONFIG.forest.area.xMin, CONFIG.forest.area.xMax),
          CONFIG.forest.area.y,
          z,
        ],
        rotationY: rng() * Math.PI * 2,
        scale:
          randomRange(rng, CONFIG.forest.scale.min, CONFIG.forest.scale.max) *
          THREE.MathUtils.lerp(0.85, 1.15, depth01),
        treeIndex: rng() < 0.5 ? 0 : 1,
      };
    });
  }, []);

  return (
    <group name="ForestGroup">
      {placements.map((placement, index) => {
        const tree = prepareStaticObject(treeBases[placement.treeIndex], {
          castShadow: true,
          receiveShadow: true,
        });

        tree.position.set(...placement.position);
        tree.rotation.y = placement.rotationY;
        tree.scale.setScalar(placement.scale);

        return <primitive key={`tree-${index}`} object={tree} />;
      })}
    </group>
  );
}

useGLTF.preload(CONFIG.forest.paths[0]);
useGLTF.preload(CONFIG.forest.paths[1]);
