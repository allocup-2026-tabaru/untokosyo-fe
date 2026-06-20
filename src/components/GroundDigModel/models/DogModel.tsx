"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { CONFIG } from "../config/groundDigModelConfig";
import {
  applyTransform,
  recolorNamedMaterials,
  setupMeshes,
} from "../utils/groundDigModelUtils";

export function DogModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(CONFIG.dog.path) as unknown as GLTF;
  const { actions, mixer } = useAnimations(animations, groupRef);

  const model = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene) as THREE.Group;
    applyTransform(cloned, CONFIG.dog);
    recolorNamedMaterials(cloned, CONFIG.dog.materialColors);
    setupMeshes(cloned, {
      castShadow: true,
      receiveShadow: true,
    });
    return cloned;
  }, [scene]);

  useEffect(() => {
    const settings = CONFIG.dog.animation;
    const pullAction = actions[settings.pullName];
    const pullOutAction = actions[settings.pullOutName];

    if (!pullAction || !pullOutAction) {
      return;
    }

    pullAction.setLoop(THREE.LoopOnce, 1);
    pullOutAction.setLoop(THREE.LoopOnce, 1);
    pullAction.clampWhenFinished = true;
    pullOutAction.clampWhenFinished = true;
    pullAction.timeScale = settings.pullSpeed;
    pullOutAction.timeScale = settings.pullOutSpeed;

    let currentAction: THREE.AnimationAction | null = null;
    let shouldPlayPull = true;
    let timeoutId: number | undefined;

    const playAction = (action: THREE.AnimationAction) => {
      if (currentAction) {
        currentAction.fadeOut(settings.fadeDuration);
      }

      action.reset();
      action.fadeIn(settings.fadeDuration);
      action.play();
      currentAction = action;
    };

    const playNext = () => {
      playAction(shouldPlayPull ? pullAction : pullOutAction);
    };

    const onFinished = () => {
      const pause = shouldPlayPull
        ? settings.pauseAfterPull
        : settings.pauseAfterPullOut;

      shouldPlayPull = !shouldPlayPull;
      timeoutId = window.setTimeout(playNext, pause * 1000);
    };

    mixer.addEventListener("finished", onFinished);
    playNext();

    return () => {
      mixer.removeEventListener("finished", onFinished);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(CONFIG.dog.path);
