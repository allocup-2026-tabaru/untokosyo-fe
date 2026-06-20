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

export function KabuRopeRig({
  animation = CONFIG.characterModels[0].animation,
  animationTimings = null,
  motionWindow = CONFIG.models.rope2.motionWindow ?? DEFAULT_MOTION_WINDOW,
  startDelayMs = 0,
  showDebugAxis = false,
  kabuMeshOptions,
  ropeMeshOptions,
  kabuTransform = CONFIG.models.kabu,
  ropeTransform = CONFIG.models.rope,
}: Props) {
  const { scene: kabuScene } = useGLTF(CONFIG.models.kabu.path) as GLTF;
  const { scene: ropeScene } = useGLTF(CONFIG.models.rope.path) as GLTF;
  const rigRef = useRef<THREE.Group | null>(null);
  const phaseRef = useRef<"pull" | "pull_out" | null>(null);
  const phaseStartTimeRef = useRef(0);
  const phaseTotalDurationMsRef = useRef(0);
  const phaseMotionStartMsRef = useRef(0);
  const phaseMotionEndMsRef = useRef(0);
  const phaseStartRotationRef = useRef(0);
  const targetRotationRef = useRef(0);
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
    rigRef.current = rig;
  }, [rig]);

  useEffect(() => {
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

      const startRatio = THREE.MathUtils.clamp(motionWindow.startRatio, 0, 1);
      const endRatio = THREE.MathUtils.clamp(motionWindow.endRatio, 0, 1);
      const normalizedStartRatio = Math.min(startRatio, endRatio);
      const normalizedEndRatio = Math.max(startRatio, endRatio);

      const totalDurationMs =
        phase === "pull" ? timings.pullDurationMs : timings.pullOutDurationMs;

      phaseRef.current = phase;
      phaseStartRotationRef.current = rigRef.current?.rotation.z ?? 0;
      phaseStartTimeRef.current = performance.now();
      phaseTotalDurationMsRef.current = totalDurationMs;
      phaseMotionStartMsRef.current = totalDurationMs * normalizedStartRatio;
      phaseMotionEndMsRef.current = totalDurationMs * normalizedEndRatio;
      targetRotationRef.current = phase === "pull" ? TILT_ANGLE_RAD : 0;

      const pauseMs =
        phase === "pull"
          ? animation.pauseAfterPull * 1000
          : animation.pauseAfterPullOut * 1000;
      const nextPhase: "pull" | "pull_out" = phase === "pull" ? "pull_out" : "pull";

      timeoutRef.current = window.setTimeout(() => {
        schedulePhase(nextPhase);
      }, pauseMs + totalDurationMs);
    };

    clearTimer();
    phaseRef.current = null;
    phaseStartRotationRef.current = rigRef.current?.rotation.z ?? 0;
    phaseStartTimeRef.current = 0;
    phaseTotalDurationMsRef.current = 0;
    phaseMotionStartMsRef.current = 0;
    phaseMotionEndMsRef.current = 0;
    targetRotationRef.current = 0;

    timeoutRef.current = window.setTimeout(() => {
      schedulePhase("pull");
    }, startDelayMs);

    return clearTimer;
  }, [animation, animationTimings, motionWindow, startDelayMs]);

  useFrame(() => {
    const current = rigRef.current;
    if (!current) {
      return;
    }

    if (!phaseRef.current || phaseTotalDurationMsRef.current <= 0) {
      current.rotation.z = targetRotationRef.current;
      return;
    }

    const elapsedMs = performance.now() - phaseStartTimeRef.current;

    if (elapsedMs <= phaseMotionStartMsRef.current) {
      current.rotation.z = phaseStartRotationRef.current;
      return;
    }

    if (elapsedMs >= phaseMotionEndMsRef.current) {
      current.rotation.z = targetRotationRef.current;
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

    current.rotation.z = THREE.MathUtils.lerp(
      phaseStartRotationRef.current,
      targetRotationRef.current,
      progress
    );
  });

  return <primitive object={rig} />;
}

useGLTF.preload(CONFIG.models.kabu.path);
useGLTF.preload(CONFIG.models.rope.path);
