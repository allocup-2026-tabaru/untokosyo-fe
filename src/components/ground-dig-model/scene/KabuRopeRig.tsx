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
  animation?: CharacterAnimationConfig;
  animationTimings?: {
    pullDurationMs: number;
    pullOutDurationMs: number;
  } | null;
  motionWindow?: RelativeMotionWindowConfig;
  startDelayMs?: number;
  startAtMs?: number;
  showDebugAxis?: boolean;
  kabuMeshOptions?: MeshOptions;
  ropeMeshOptions?: MeshOptions;
  kabuTransform?: TransformConfig;
  ropeTransform?: TransformConfig;
};

const DEFAULT_MOTION_WINDOW: RelativeMotionWindowConfig = {
  startRatio: 0.15,
  endRatio: 0.85,
};

const PIVOT_X_OFFSET = -2.5;
const PIVOT_Y_OFFSET = -2;
const DEBUG_AXIS_HALF_LENGTH = 1.25;
const DEFAULT_VIBRATION_AMPLITUDE_RAD = 0.005;
const DEFAULT_VIBRATION_INTERVAL_MS = 100;

type KabuRopeRigDebugConfig = {
  enableVibration?: boolean;
  vibrationAmplitudeRad?: number;
  vibrationIntervalMs?: number;
};

declare global {
  interface Window {
    __untokosyoKabuRopeRigDebug?: KabuRopeRigDebugConfig;
  }
}

const getVibrationAmplitudeRad = () => {
  if (typeof window === "undefined") {
    return DEFAULT_VIBRATION_AMPLITUDE_RAD;
  }

  const debugConfig = window.__untokosyoKabuRopeRigDebug;
  const vibrationAmplitudeRad =
    debugConfig?.vibrationAmplitudeRad ?? DEFAULT_VIBRATION_AMPLITUDE_RAD;

  return Math.max(0, vibrationAmplitudeRad);
};

const isVibrationEnabled = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const debugConfig = window.__untokosyoKabuRopeRigDebug;
  return debugConfig?.enableVibration ?? true;
};

const getVibrationIntervalMs = () => {
  if (typeof window === "undefined") {
    return DEFAULT_VIBRATION_INTERVAL_MS;
  }

  const debugConfig = window.__untokosyoKabuRopeRigDebug;
  const vibrationIntervalMs =
    debugConfig?.vibrationIntervalMs ?? DEFAULT_VIBRATION_INTERVAL_MS;

  return Math.max(16, vibrationIntervalMs);
};

export function KabuRopeRig({
  animation = CONFIG.characterModels[0].animation,
  animationTimings = null,
  motionWindow = CONFIG.models.rope2.motionWindow ?? DEFAULT_MOTION_WINDOW,
  startDelayMs = 0,
  startAtMs,
  showDebugAxis = false,
  kabuMeshOptions,
  ropeMeshOptions,
  kabuTransform = CONFIG.models.kabu,
  ropeTransform = CONFIG.models.rope,
}: Props) {
  const { scene: kabuScene } = useGLTF(CONFIG.models.kabu.path) as unknown as GLTF;
  const { scene: ropeScene } = useGLTF(CONFIG.models.rope.path) as unknown as GLTF;
  const rigRef = useRef<THREE.Group | null>(null);
  const phaseRef = useRef<"pull" | "pull_out" | null>(null);
  const phaseTotalDurationMsRef = useRef(0);
  const phaseStartAtMsRef = useRef(0);
  const vibrationCurrentRef = useRef(new THREE.Vector3());
  const vibrationTargetRef = useRef(new THREE.Vector3());
  const vibrationNextUpdateAtMsRef = useRef(0);
  const timeoutRef = useRef<number | undefined>(undefined);

  const rig = useMemo(() => {
    const kabu = prepareStaticObject(kabuScene, kabuMeshOptions);
    const rope = prepareStaticObject(ropeScene, ropeMeshOptions);

    applyTransform(kabu, kabuTransform);
    applyTransform(rope, ropeTransform);

    kabu.updateMatrixWorld(true);

    const kabuBounds = new THREE.Box3().setFromObject(kabu);
    const pivot = new THREE.Vector3(
      kabuBounds.max.x + PIVOT_X_OFFSET,
      (kabuBounds.min.y + kabuBounds.max.y) / 2 + PIVOT_Y_OFFSET,
      (kabuBounds.min.z + kabuBounds.max.z) / 2
    );

    const rigGroup = new THREE.Group();
    rigGroup.name = "KabuRopeRig";
    rigGroup.position.copy(pivot);

    kabu.position.sub(pivot);
    rope.position.sub(pivot);

    rigGroup.add(kabu);
    rigGroup.add(rope);

    if (showDebugAxis) {
      const axisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -DEBUG_AXIS_HALF_LENGTH),
        new THREE.Vector3(0, 0, DEBUG_AXIS_HALF_LENGTH),
      ]);
      const axisMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.9,
      });
      const axisLine = new THREE.Line(axisGeometry, axisMaterial);
      axisLine.name = "KabuRopeRigAxis";
      rigGroup.add(axisLine);
    }

    return rigGroup;
  }, [kabuMeshOptions, kabuScene, kabuTransform, ropeMeshOptions, ropeScene, ropeTransform, showDebugAxis]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.__untokosyoKabuRopeRigDebug) {
      // DevTools から `window.__untokosyoKabuRopeRigDebug.enableVibration = false` のように変更する。
      window.__untokosyoKabuRopeRigDebug = {
        enableVibration: true,
        vibrationAmplitudeRad: DEFAULT_VIBRATION_AMPLITUDE_RAD,
        vibrationIntervalMs: DEFAULT_VIBRATION_INTERVAL_MS,
      };
    }

    rigRef.current = rig;
  }, [rig]);

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };

    const schedulePull = () => {
      const timings = animationTimings;
      if (!timings) {
        return;
      }

      phaseRef.current = "pull";
      phaseTotalDurationMsRef.current = timings.pullDurationMs;
      phaseStartAtMsRef.current = performance.now();
      vibrationCurrentRef.current.set(0, 0, 0);
      vibrationTargetRef.current.set(0, 0, 0);
      vibrationNextUpdateAtMsRef.current = phaseStartAtMsRef.current;
    };

    clearTimer();
    phaseRef.current = null;
    phaseTotalDurationMsRef.current = 0;
    phaseStartAtMsRef.current = 0;
    vibrationCurrentRef.current.set(0, 0, 0);
    vibrationTargetRef.current.set(0, 0, 0);
    vibrationNextUpdateAtMsRef.current = 0;

    const initialDelayMs =
      startAtMs !== undefined
        ? Math.max(0, startAtMs - performance.now())
        : startDelayMs;
    timeoutRef.current = window.setTimeout(() => {
      schedulePull();
    }, initialDelayMs);

    return clearTimer;
  }, [animation, animationTimings, motionWindow, startAtMs, startDelayMs]);

  useFrame(() => {
    const current = rigRef.current;
    if (!current) {
      return;
    }

    if (!phaseRef.current || phaseTotalDurationMsRef.current <= 0) {
      current.rotation.set(0, 0, 0);
      return;
    }

    if (!isVibrationEnabled()) {
      current.rotation.set(0, 0, 0);
      return;
    }

    const now = performance.now();
    if (now >= vibrationNextUpdateAtMsRef.current) {
      vibrationCurrentRef.current.copy(vibrationTargetRef.current);

      const amplitude = getVibrationAmplitudeRad();
      vibrationTargetRef.current.set(
        THREE.MathUtils.randFloatSpread(amplitude * 2),
        THREE.MathUtils.randFloatSpread(amplitude * 2),
        THREE.MathUtils.randFloatSpread(amplitude * 2)
      );
      vibrationNextUpdateAtMsRef.current = now + getVibrationIntervalMs();
    }

    const intervalMs = getVibrationIntervalMs();
    const progress = THREE.MathUtils.clamp(
      (now - (vibrationNextUpdateAtMsRef.current - intervalMs)) / intervalMs,
      0,
      1
    );
    const eased = progress * progress * (3 - 2 * progress);

    current.rotation.x =
      vibrationCurrentRef.current.x +
      (vibrationTargetRef.current.x - vibrationCurrentRef.current.x) * eased;
    current.rotation.y =
      vibrationCurrentRef.current.y +
      (vibrationTargetRef.current.y - vibrationCurrentRef.current.y) * eased;
    current.rotation.z =
      vibrationCurrentRef.current.z +
      (vibrationTargetRef.current.z - vibrationCurrentRef.current.z) * eased;
  });

  return <primitive object={rig} />;
}

useGLTF.preload(CONFIG.models.kabu.path);
useGLTF.preload(CONFIG.models.rope.path);
