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
};

const ROPE2_SHIFT_X = 0.18;

export function Rope2Model({
  transform,
  meshOptions,
  animation = CONFIG.characterModels[0].animation,
  startDelayMs = 0,
  animationTimings = null,
}: Props) {
  const { scene } = useGLTF(CONFIG.models.rope2.path) as GLTF;
  const modelRef = useRef<THREE.Object3D | null>(null);
  const targetXRef = useRef(transform.position?.x ?? CONFIG.models.rope2.position.x);
  const phaseStartXRef = useRef(targetXRef.current);
  const phaseStartTimeRef = useRef(0);
  const phaseDurationMsRef = useRef(0);
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

      phaseRef.current = phase;
      phaseStartXRef.current = modelRef.current?.position.x ?? baseX;
      phaseStartTimeRef.current = performance.now();
      phaseDurationMsRef.current =
        phase === "pull" ? timings.pullDurationMs : timings.pullOutDurationMs;
      targetXRef.current = phase === "pull" ? pullX : pullOutX;

      const pauseMs =
        phase === "pull"
          ? animation.pauseAfterPull * 1000
          : animation.pauseAfterPullOut * 1000;
      const nextPhase: "pull" | "pull_out" = phase === "pull" ? "pull_out" : "pull";

      timeoutRef.current = window.setTimeout(() => {
        schedulePhase(nextPhase);
      }, pauseMs + phaseDurationMsRef.current);
    };

    clearTimer();
    targetXRef.current = baseX;
    phaseRef.current = null;
    phaseStartXRef.current = baseX;
    phaseStartTimeRef.current = 0;
    phaseDurationMsRef.current = 0;
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

    if (!phaseRef.current || phaseDurationMsRef.current <= 0) {
      current.position.x = targetXRef.current;
      return;
    }

    const elapsedMs = performance.now() - phaseStartTimeRef.current;
    const progress = THREE.MathUtils.clamp(elapsedMs / phaseDurationMsRef.current, 0, 1);
    current.position.x = THREE.MathUtils.lerp(phaseStartXRef.current, targetXRef.current, progress);
  });

  return <primitive object={model} />;
}

useGLTF.preload(CONFIG.models.rope2.path);
