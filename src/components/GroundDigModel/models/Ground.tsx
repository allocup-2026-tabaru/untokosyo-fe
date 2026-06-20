"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CONFIG } from "../config/groundDigModelConfig";
import {
  applyTransform,
  createGroundTexture,
  prepareStaticObject,
} from "../utils/groundDigModelUtils";

export function Ground() {
  const { scene } = useGLTF(CONFIG.models.ground.path) as unknown as GLTF;
  const texture = useMemo(() => createGroundTexture(CONFIG.seed), []);

  const model = useMemo(() => {
    const cloned = prepareStaticObject(scene, {
      castShadow: false,
      receiveShadow: true,
    });

    applyTransform(cloned, CONFIG.models.ground);

    cloned.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) {
        return;
      }

      obj.material = new THREE.MeshStandardMaterial({
        map: texture ?? null,
        color: texture ? 0xffffff : new THREE.Color("#5f934b"),
        roughness: 0.94,
        metalness: 0,
        side: THREE.DoubleSide,
      });
    });

    return cloned;
  }, [scene, texture]);

  useEffect(() => {
    return () => {
      model.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) {
          return;
        }

        const material = obj.material;
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else {
          material.dispose();
        }
      });

      texture?.dispose();
    };
  }, [model, texture]);

  return <primitive object={model} />;
}

useGLTF.preload(CONFIG.models.ground.path);
