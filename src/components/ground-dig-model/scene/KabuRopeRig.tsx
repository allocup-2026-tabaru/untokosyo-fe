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
const DEFAULT_KABU_ESCAPE_DISTANCE = 10;
const DEFAULT_KABU_ESCAPE_DURATION_MS = 450;
const DEFAULT_ROPE_ESCAPE_DISTANCE = 8;
const DEFAULT_ROPE_ESCAPE_DURATION_MS = 450;
const DEFAULT_SLIP_DELAY_MS = 100;

type KabuRopeRigDebugConfig = {
  enableVibration?: boolean;
  vibrationAmplitudeRad?: number;
  vibrationIntervalMs?: number;
  kabuEscape?: boolean;
  kabuEscapeDistance?: number;
  kabuEscapeDurationMs?: number;
  ropeEscapeDistance?: number;
  ropeEscapeDurationMs?: number;
  rope2EscapeDistanceX?: number;
  rope2EscapeDurationMs?: number;
  rope2EscapeDropY?: number;
  slipDelayMs?: number;
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

const isKabuEscapeEnabled = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.__untokosyoKabuRopeRigDebug?.kabuEscape ?? false;
};

const getKabuEscapeDistance = () => {
  if (typeof window === "undefined") {
    return DEFAULT_KABU_ESCAPE_DISTANCE;
  }

  const debugConfig = window.__untokosyoKabuRopeRigDebug;
  const kabuEscapeDistance =
    debugConfig?.kabuEscapeDistance ?? DEFAULT_KABU_ESCAPE_DISTANCE;

  return Math.max(0, kabuEscapeDistance);
};

const getKabuEscapeDurationMs = () => {
  if (typeof window === "undefined") {
    return DEFAULT_KABU_ESCAPE_DURATION_MS;
  }

  const debugConfig = window.__untokosyoKabuRopeRigDebug;
  const kabuEscapeDurationMs =
    debugConfig?.kabuEscapeDurationMs ?? DEFAULT_KABU_ESCAPE_DURATION_MS;

  return Math.max(16, kabuEscapeDurationMs);
};

const getRopeEscapeDistance = () => {
  if (typeof window === "undefined") {
    return DEFAULT_ROPE_ESCAPE_DISTANCE;
  }

  const debugConfig = window.__untokosyoKabuRopeRigDebug;
  const ropeEscapeDistance =
    debugConfig?.ropeEscapeDistance ?? DEFAULT_ROPE_ESCAPE_DISTANCE;

  return Math.max(0, ropeEscapeDistance);
};

const getRopeEscapeDurationMs = () => {
  if (typeof window === "undefined") {
    return DEFAULT_ROPE_ESCAPE_DURATION_MS;
  }

  const debugConfig = window.__untokosyoKabuRopeRigDebug;
  const ropeEscapeDurationMs =
    debugConfig?.ropeEscapeDurationMs ?? DEFAULT_ROPE_ESCAPE_DURATION_MS;

  return Math.max(16, ropeEscapeDurationMs);
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
  const kabuRef = useRef<THREE.Object3D | null>(null);
  const ropeRef = useRef<THREE.Object3D | null>(null);
  const kabuBasePositionRef = useRef(new THREE.Vector3());
  const ropeBasePositionRef = useRef(new THREE.Vector3());
  const kabuEscapeStartAtMsRef = useRef<number | null>(null);
  const ropeEscapeStartAtMsRef = useRef<number | null>(null);
  const kabuEscapeStartPositionRef = useRef(new THREE.Vector3());
  const ropeEscapeStartPositionRef = useRef(new THREE.Vector3());
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

    return {
      rigGroup,
      kabu,
      rope,
      kabuBasePosition: kabu.position.clone(),
      ropeBasePosition: rope.position.clone(),
    };
  }, [kabuMeshOptions, kabuScene, kabuTransform, ropeMeshOptions, ropeScene, ropeTransform, showDebugAxis]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.__untokosyoKabuRopeRigDebug) {
      // DevTools から `window.__untokosyoKabuRopeRigDebug.kabuEscape = true` のように変更する。
      window.__untokosyoKabuRopeRigDebug = {
        enableVibration: true,
        vibrationAmplitudeRad: DEFAULT_VIBRATION_AMPLITUDE_RAD,
        vibrationIntervalMs: DEFAULT_VIBRATION_INTERVAL_MS,
        kabuEscape: false,
        kabuEscapeDistance: DEFAULT_KABU_ESCAPE_DISTANCE,
        kabuEscapeDurationMs: DEFAULT_KABU_ESCAPE_DURATION_MS,
        ropeEscapeDistance: DEFAULT_ROPE_ESCAPE_DISTANCE,
        ropeEscapeDurationMs: DEFAULT_ROPE_ESCAPE_DURATION_MS,
        rope2EscapeDistanceX: 4,
        rope2EscapeDurationMs: DEFAULT_KABU_ESCAPE_DURATION_MS,
        rope2EscapeDropY: -1,
        slipDelayMs: DEFAULT_SLIP_DELAY_MS,
      };
      console.info(
        "[KabuRopeRig] debug controls: window.__untokosyoKabuRopeRigDebug.kabuEscape = true"
      );
    }

    rigRef.current = rig.rigGroup;
    kabuRef.current = rig.kabu;
    ropeRef.current = rig.rope;
    kabuBasePositionRef.current.copy(rig.kabuBasePosition);
    ropeBasePositionRef.current.copy(rig.ropeBasePosition);
    kabuEscapeStartAtMsRef.current = null;
    ropeEscapeStartAtMsRef.current = null;
    rig.kabu.position.copy(rig.kabuBasePosition);
    rig.rope.position.copy(rig.ropeBasePosition);
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

    const now = performance.now();
    const kabu = kabuRef.current;
    if (kabu) {
      if (!isKabuEscapeEnabled()) {
        kabu.visible = true;
        kabu.position.copy(kabuBasePositionRef.current);
        kabuEscapeStartAtMsRef.current = null;
        kabuEscapeStartPositionRef.current.copy(kabuBasePositionRef.current);
      } else {
        if (kabuEscapeStartAtMsRef.current === null) {
          kabuEscapeStartAtMsRef.current = now;
          kabuEscapeStartPositionRef.current.copy(kabu.position);
        }

        const escapeDurationMs = getKabuEscapeDurationMs();
        const escapeDistance = getKabuEscapeDistance();
        const elapsedMs = now - kabuEscapeStartAtMsRef.current;
        const progress = THREE.MathUtils.clamp(elapsedMs / escapeDurationMs, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        kabu.position.copy(kabuEscapeStartPositionRef.current);
        kabu.position.y = kabuEscapeStartPositionRef.current.y + escapeDistance * eased;
        kabu.visible = progress < 1;
      }
    }

    const rope = ropeRef.current;
    if (rope) {
      if (!isKabuEscapeEnabled()) {
        rope.visible = true;
        rope.position.copy(ropeBasePositionRef.current);
        ropeEscapeStartAtMsRef.current = null;
        ropeEscapeStartPositionRef.current.copy(ropeBasePositionRef.current);
      } else {
        if (ropeEscapeStartAtMsRef.current === null) {
          ropeEscapeStartAtMsRef.current = now;
          ropeEscapeStartPositionRef.current.copy(rope.position);
        }

        const escapeDurationMs = getRopeEscapeDurationMs();
        const escapeDistance = getRopeEscapeDistance();
        const elapsedMs = now - ropeEscapeStartAtMsRef.current;
        const progress = THREE.MathUtils.clamp(elapsedMs / escapeDurationMs, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        rope.position.copy(ropeEscapeStartPositionRef.current);
        rope.position.y = ropeEscapeStartPositionRef.current.y + escapeDistance * eased;
        rope.visible = progress < 1;
      }
    }

    if (!phaseRef.current || phaseTotalDurationMsRef.current <= 0) {
      current.rotation.set(0, 0, 0);
      return;
    }

    if (!isVibrationEnabled()) {
      current.rotation.set(0, 0, 0);
      return;
    }

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

  return <primitive object={rig.rigGroup} />;
}

useGLTF.preload(CONFIG.models.kabu.path);
useGLTF.preload(CONFIG.models.rope.path);
