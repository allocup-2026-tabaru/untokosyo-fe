"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  CONFIG,
  type CharacterAnimationConfig,
  type MeshOptions,
  type RelativeMotionWindowConfig,
  type TransformConfig,
} from "../config/groundDigModelConfig";
import {
  applyTransform,
  prepareStaticObject,
} from "../utils/groundDigModelUtils";

type Props = {
  transform: TransformConfig;
  meshOptions?: MeshOptions;
  animation?: CharacterAnimationConfig;
  startDelayMs?: number;
  animationTimings?: {
    pullDurationMs: number;
    pullOutDurationMs: number;
  } | null;
  motionWindow?: RelativeMotionWindowConfig;
};

const ROPE2_SHIFT_X = 0.18;
const DEFAULT_MOTION_WINDOW: RelativeMotionWindowConfig = {
  startRatio: 0,
  endRatio: 1,
};

export function Rope2Model({
  transform,
  meshOptions,
  animation = CONFIG.characterModels[0].animation,
  startDelayMs = 0,
  animationTimings = null,
  motionWindow = CONFIG.models.rope2.motionWindow ?? DEFAULT_MOTION_WINDOW,
}: Props) {
  const { scene } = useGLTF(CONFIG.models.rope2.path) as GLTF;
  const modelRef = useRef<THREE.Object3D | null>(null);
  const targetXRef = useRef(transform.position?.x ?? CONFIG.models.rope2.position.x);
  const phaseStartXRef = useRef(targetXRef.current);
  const phaseStartTimeRef = useRef(0);
  const phaseTotalDurationMsRef = useRef(0);
  const phaseMotionStartMsRef = useRef(0);
  const phaseMotionEndMsRef = useRef(0);
  const phaseRef = useRef<"pull" | "pull_out" | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const model = useMemo(() => {
    const cloned = prepareStaticObject(scene, meshOptions);
    applyTransform(cloned, transform);
    return cloned;
  }, [meshOptions, scene, transform]);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    const baseX = transform.position?.x ?? CONFIG.models.rope2.position.x;
    const pullX = baseX + ROPE2_SHIFT_X;
    const pullOutX = baseX - ROPE2_SHIFT_X;

    const clearTimer = () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };

    const schedulePhase = (phase: "pull" | "pull_out") => {
      const timings = animationTimings;
      if (!timings) {
        return;
      }

      const windowStartRatio = THREE.MathUtils.clamp(motionWindow.startRatio, 0, 1);
      const windowEndRatio = THREE.MathUtils.clamp(motionWindow.endRatio, 0, 1);
      const normalizedStartRatio = Math.min(windowStartRatio, windowEndRatio);
      const normalizedEndRatio = Math.max(windowStartRatio, windowEndRatio);

      phaseRef.current = phase;
      phaseStartXRef.current = modelRef.current?.position.x ?? baseX;
      phaseStartTimeRef.current = performance.now();
      phaseTotalDurationMsRef.current =
        phase === "pull" ? timings.pullDurationMs : timings.pullOutDurationMs;
      phaseMotionStartMsRef.current = phaseTotalDurationMsRef.current * normalizedStartRatio;
      phaseMotionEndMsRef.current = phaseTotalDurationMsRef.current * normalizedEndRatio;
      targetXRef.current = phase === "pull" ? pullX : pullOutX;

      const pauseMs =
        phase === "pull"
          ? animation.pauseAfterPull * 1000
          : animation.pauseAfterPullOut * 1000;
      const nextPhase: "pull" | "pull_out" = phase === "pull" ? "pull_out" : "pull";

      timeoutRef.current = window.setTimeout(() => {
        schedulePhase(nextPhase);
      }, pauseMs + phaseTotalDurationMsRef.current);
    };

    clearTimer();
    targetXRef.current = baseX;
    phaseRef.current = null;
    phaseStartXRef.current = baseX;
    phaseStartTimeRef.current = 0;
    phaseTotalDurationMsRef.current = 0;
    phaseMotionStartMsRef.current = 0;
    phaseMotionEndMsRef.current = 0;
    timeoutRef.current = window.setTimeout(() => {
      schedulePhase("pull");
    }, startDelayMs);

    return clearTimer;
  }, [animation, animationTimings, startDelayMs, transform.position?.x]);

  useFrame(() => {
    const current = modelRef.current;
    if (!current) {
      return;
    }

    if (!phaseRef.current || phaseTotalDurationMsRef.current <= 0) {
      current.position.x = targetXRef.current;
      return;
    }

    const elapsedMs = performance.now() - phaseStartTimeRef.current;
    if (elapsedMs <= phaseMotionStartMsRef.current) {
      current.position.x = phaseStartXRef.current;
      return;
    }

    if (elapsedMs >= phaseMotionEndMsRef.current) {
      current.position.x = targetXRef.current;
      return;
    }

    const motionDurationMs = Math.max(
      phaseMotionEndMsRef.current - phaseMotionStartMsRef.current,
      1
    );
    const progress = THREE.MathUtils.clamp(
      (elapsedMs - phaseMotionStartMsRef.current) / motionDurationMs,
      0,
      1
    );
    current.position.x = THREE.MathUtils.lerp(
      phaseStartXRef.current,
      targetXRef.current,
      progress
    );
  });

  return <primitive object={model} />;
}

useGLTF.preload(CONFIG.models.rope2.path);
