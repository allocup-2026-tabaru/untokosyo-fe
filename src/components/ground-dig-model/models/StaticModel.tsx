"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CONFIG, type StaticModelProps } from "../config/groundDigModelConfig";
import { applyTransform, prepareStaticObject } from "../utils/groundDigModelUtils";

export function StaticModel({ url, transform, meshOptions }: StaticModelProps) {
  const { scene } = useGLTF(url) as unknown as GLTF;

  const model = useMemo(() => {
    const cloned = prepareStaticObject(scene, meshOptions);
    applyTransform(cloned, transform);
    return cloned;
  }, [meshOptions, scene, transform]);

  return <primitive object={model} />;
}

useGLTF.preload(CONFIG.models.dig.path);
useGLTF.preload(CONFIG.models.kabu.path);
useGLTF.preload(CONFIG.models.rope.path);
useGLTF.preload(CONFIG.models.rope2.path);
