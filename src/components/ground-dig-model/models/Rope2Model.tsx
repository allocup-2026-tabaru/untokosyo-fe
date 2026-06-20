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
  startAtMs?: number;
  animationTimings?: {
    pullDurationMs: number;
    pullOutDurationMs: number;
  } | null;
  motionWindow?: RelativeMotionWindowConfig;
};

const ROPE2_SHIFT_X = 0.18;
const DEFAULT_ROPE2_ESCAPE_DISTANCE_X = 400;
const DEFAULT_ROPE2_ESCAPE_DURATION_MS = 450;
const DEFAULT_ROPE2_ESCAPE_DROP_Y = -1;
const DEFAULT_MOTION_WINDOW: RelativeMotionWindowConfig = {
  startRatio: 0,
  endRatio: 1,
};

export function Rope2Model({
  transform,
  meshOptions,
  animation = CONFIG.characterModels[0].animation,
  startDelayMs = 0,
  startAtMs,
  animationTimings = null,
  motionWindow = CONFIG.models.rope2.motionWindow ?? DEFAULT_MOTION_WINDOW,
}: Props) {
  const { scene } = useGLTF(CONFIG.models.rope2.path) as unknown as GLTF;
  const modelRef = useRef<THREE.Object3D | null>(null);
  const targetXRef = useRef(transform.position?.x ?? CONFIG.models.rope2.position.x);
  const phaseStartXRef = useRef(targetXRef.current);
  const phaseStartTimeRef = useRef(0);
  const phaseTotalDurationMsRef = useRef(0);
  const phaseMotionStartMsRef = useRef(0);
  const phaseMotionEndMsRef = useRef(0);
  const phaseRef = useRef<"pull" | "pull_out" | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);
  const rope2EscapeStartAtMsRef = useRef<number | null>(null);
  const rope2EscapeStartXRef = useRef(targetXRef.current);
  const rope2EscapeStartYRef = useRef(transform.position?.y ?? CONFIG.models.rope2.position.y);

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
    rope2EscapeStartXRef.current = baseX;
    rope2EscapeStartYRef.current = transform.position?.y ?? CONFIG.models.rope2.position.y;
    phaseRef.current = null;
    phaseStartXRef.current = baseX;
    phaseStartTimeRef.current = 0;
    phaseTotalDurationMsRef.current = 0;
    phaseMotionStartMsRef.current = 0;
    phaseMotionEndMsRef.current = 0;
    timeoutRef.current = window.setTimeout(() => {
      schedulePhase("pull");
    }, startAtMs !== undefined ? Math.max(0, startAtMs - performance.now()) : startDelayMs);

    return clearTimer;
  }, [animation, animationTimings, startAtMs, startDelayMs, transform.position?.x]);

  useFrame(() => {
    const current = modelRef.current;
    if (!current) {
      return;
    }

    const now = performance.now();

    if (!phaseRef.current || phaseTotalDurationMsRef.current <= 0) {
      current.position.x = targetXRef.current;
    } else {
      const elapsedMs = performance.now() - phaseStartTimeRef.current;
      if (elapsedMs <= phaseMotionStartMsRef.current) {
        current.position.x = phaseStartXRef.current;
      } else if (elapsedMs >= phaseMotionEndMsRef.current) {
        current.position.x = targetXRef.current;
      } else {
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
      }
    }

    const debugConfig = window.__untokosyoKabuRopeRigDebug;
    if (!debugConfig?.kabuEscape) {
      rope2EscapeStartAtMsRef.current = null;
      rope2EscapeStartXRef.current = current.position.x;
      rope2EscapeStartYRef.current = current.position.y;
      return;
    }

    if (rope2EscapeStartAtMsRef.current === null) {
      rope2EscapeStartAtMsRef.current = now;
      rope2EscapeStartXRef.current = current.position.x;
      rope2EscapeStartYRef.current = current.position.y;
    }

    const escapeDurationMs = Math.max(
      16,
      debugConfig.rope2EscapeDurationMs ?? DEFAULT_ROPE2_ESCAPE_DURATION_MS
    );
    const escapeDistanceX = Math.max(
      0,
      debugConfig.rope2EscapeDistanceX ?? DEFAULT_ROPE2_ESCAPE_DISTANCE_X
    );
    const escapeDropY = debugConfig.rope2EscapeDropY ?? DEFAULT_ROPE2_ESCAPE_DROP_Y;
    const escapeElapsedMs = now - rope2EscapeStartAtMsRef.current;
    const escapeProgress = THREE.MathUtils.clamp(escapeElapsedMs / escapeDurationMs, 0, 1);
    const escapeEased = 1 - Math.pow(1 - escapeProgress, 3);
    current.position.x = rope2EscapeStartXRef.current + escapeDistanceX * escapeEased;
    current.position.y = THREE.MathUtils.lerp(
      rope2EscapeStartYRef.current,
      escapeDropY,
      escapeEased
    );
  });

  return <primitive object={model} />;
}

useGLTF.preload(CONFIG.models.rope2.path);
