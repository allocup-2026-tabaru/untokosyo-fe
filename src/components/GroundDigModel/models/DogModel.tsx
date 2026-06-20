"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  CONFIG,
  type CharacterModelConfig,
  type TransformConfig,
} from "../config/groundDigModelConfig";
import {
  applyTransform,
  recolorNamedMaterials,
  setupMeshes,
} from "../utils/groundDigModelUtils";

type Props = {
  characterModel?: CharacterModelConfig;
  transform?: TransformConfig;
  startDelayMs?: number;
};

export function DogModel({
  characterModel = CONFIG.characterModels[0],
  transform,
  startDelayMs = 0,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(characterModel.path) as GLTF;
  const { actions, mixer } = useAnimations(animations, groupRef);

  const clonedModel = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene) as THREE.Group;
    applyTransform(cloned, transform ?? characterModel);
    recolorNamedMaterials(cloned, characterModel.materialColors);
    setupMeshes(cloned, {
      castShadow: true,
      receiveShadow: true,
    });
    return cloned;
  }, [scene, transform, characterModel]);

  useEffect(() => {
    const settings = characterModel.animation;
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
    timeoutId = window.setTimeout(playNext, startDelayMs);

    return () => {
      mixer.removeEventListener("finished", onFinished);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      mixer.stopAllAction();
    };
  }, [actions, characterModel.animation, mixer, startDelayMs]);

  return (
    <group ref={groupRef}>
      <primitive object={clonedModel} />
    </group>
  );
}

for (const characterModel of CONFIG.characterModels) {
  useGLTF.preload(characterModel.path);
}
