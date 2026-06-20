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

const TILT_ANGLE_RAD = -0.1;
const PIVOT_X_OFFSET = -2.5;
const PIVOT_Y_OFFSET = -2;
const DEBUG_AXIS_HALF_LENGTH = 1.25;
const DEFAULT_TILT_SCALE = 1;

type KabuRopeRigDebugConfig = {
  tiltScale?: number;
};

declare global {
  interface Window {
    __untokosyoKabuRopeRigDebug?: KabuRopeRigDebugConfig;
  }
}

const getTiltScale = () => {
  if (typeof window === "undefined") {
    return DEFAULT_TILT_SCALE;
  }

  const debugConfig = window.__untokosyoKabuRopeRigDebug;
  const tiltScale = debugConfig?.tiltScale ?? DEFAULT_TILT_SCALE;

  return Math.max(0, tiltScale);
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
      // DevTools から `window.__untokosyoKabuRopeRigDebug.tiltScale = 1.5` のように変更する。
      window.__untokosyoKabuRopeRigDebug = {
        tiltScale: DEFAULT_TILT_SCALE,
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
    };

    clearTimer();
    phaseRef.current = null;
    phaseTotalDurationMsRef.current = 0;

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
      current.rotation.z = 0;
      return;
    }

    current.rotation.z = TILT_ANGLE_RAD * getTiltScale();
  });

  return <primitive object={rig} />;
}

useGLTF.preload(CONFIG.models.kabu.path);
useGLTF.preload(CONFIG.models.rope.path);
