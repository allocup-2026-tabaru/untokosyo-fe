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
  materialColors?: Record<string, string>;
  transform?: TransformConfig;
  startDelayMs?: number;
  startAtMs?: number;
  onAnimationTimings?: (timings: {
    pullDurationMs: number;
    pullOutDurationMs: number;
  }) => void;
};

export function DogModel({
  characterModel = CONFIG.characterModels[0],
  materialColors,
  transform,
  startDelayMs = 0,
  startAtMs,
  onAnimationTimings,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const reportedTimingsRef = useRef<{
    pullDurationMs: number;
    pullOutDurationMs: number;
  } | null>(null);
  const { scene, animations } = useGLTF(characterModel.path) as unknown as GLTF;
  const { actions, mixer } = useAnimations(animations, groupRef);

  const clonedModel = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene) as THREE.Group;
    applyTransform(cloned, transform ?? characterModel);
    recolorNamedMaterials(cloned, materialColors ?? characterModel.materialColors);
    setupMeshes(cloned, {
      castShadow: true,
      receiveShadow: true,
    });
    return cloned;
  }, [characterModel, materialColors, scene, transform]);

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

    const nextTimings = {
      pullDurationMs:
        (pullAction.getClip().duration / Math.max(settings.pullSpeed, 0.01)) * 1000,
      pullOutDurationMs:
        (pullOutAction.getClip().duration / Math.max(settings.pullOutSpeed, 0.01)) * 1000,
    };

    const previousTimings = reportedTimingsRef.current;
    const hasChanged =
      !previousTimings ||
      previousTimings.pullDurationMs !== nextTimings.pullDurationMs ||
      previousTimings.pullOutDurationMs !== nextTimings.pullOutDurationMs;

    if (hasChanged) {
      reportedTimingsRef.current = nextTimings;
      onAnimationTimings?.(nextTimings);
    }

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
    const initialDelayMs =
      startAtMs !== undefined
        ? Math.max(0, startAtMs - performance.now())
        : startDelayMs;
    timeoutId = window.setTimeout(playNext, initialDelayMs);

    return () => {
      mixer.removeEventListener("finished", onFinished);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      mixer.stopAllAction();
    };
  }, [
    actions,
    characterModel.animation,
    mixer,
    onAnimationTimings,
    startAtMs,
    startDelayMs,
  ]);

  return (
    <group ref={groupRef}>
      <primitive object={clonedModel} />
    </group>
  );
}

for (const characterModel of CONFIG.characterModels) {
  useGLTF.preload(characterModel.path);
}
