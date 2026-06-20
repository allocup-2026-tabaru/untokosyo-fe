"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Vector3 } from "three";

const MAX_PULL = 3;

export default function PullArrowIndicator() {
  const [dragging, setDragging] =
    useState(false);

  const [dragLength, setDragLength] =
    useState(0);

  const [shake, setShake] =
    useState(0);

  const startPos =
    useRef<Vector3 | null>(null);

  const vibratedLevel =
    useRef(0);

  useEffect(() => {
    const onPointerDown = (
      e: PointerEvent
    ) => {
      startPos.current =
        new Vector3(
          e.clientX,
          e.clientY,
          0
        );

      setDragLength(0);
      setDragging(true);
      vibratedLevel.current = 0;
    };

    const onPointerMove = (
      e: PointerEvent
    ) => {
      if (
        !dragging ||
        !startPos.current
      ) {
        return;
      }

      const current =
        new Vector3(
          e.clientX,
          e.clientY,
          0
        );

      const length =
        current.distanceTo(
          startPos.current
        );

      const nextDragLength =
        Math.min(
          length / 100,
          MAX_PULL
        );

      setDragLength(
        nextDragLength
      );

      const charge =
        Math.min(
          nextDragLength /
            MAX_PULL,
          1
        );

      if (
        "vibrate" in navigator &&
        charge > 0.3 &&
        vibratedLevel.current < 1
      ) {
        navigator.vibrate(10);
        vibratedLevel.current = 1;
      }

      if (
        "vibrate" in navigator &&
        charge > 0.6 &&
        vibratedLevel.current < 2
      ) {
        navigator.vibrate([
          15,
          20,
          15,
        ]);
        vibratedLevel.current = 2;
      }

      if (
        "vibrate" in navigator &&
        charge > 0.95 &&
        vibratedLevel.current < 3
      ) {
        navigator.vibrate(40);
        vibratedLevel.current = 3;
      }
    };

    const onPointerUp = () => {
      setDragging(false);
      setDragLength(0);
      startPos.current = null;
      vibratedLevel.current = 0;
    };

    window.addEventListener(
      "pointerdown",
      onPointerDown
    );

    window.addEventListener(
      "pointermove",
      onPointerMove
    );

    window.addEventListener(
      "pointerup",
      onPointerUp
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      window.removeEventListener(
        "pointermove",
        onPointerMove
      );

      window.removeEventListener(
        "pointerup",
        onPointerUp
      );
    };
  }, [dragging]);

  useFrame(({ clock }) => {
    if (
      !dragging ||
      dragLength <= 0.05
    ) {
      setShake(0);
      return;
    }

    const charge = Math.min(
      dragLength / MAX_PULL,
      1
    );

    const frequency =
      10 + charge * 40;

    const amplitude =
      0.02 +
      charge * 0.05;

    const nextShake =
      Math.sin(
        clock.elapsedTime *
          frequency
      ) * amplitude;

    setShake(nextShake);
  });

  if (
    !dragging ||
    dragLength <= 0.05
  ) {
    return null;
  }

  const charge = Math.min(
    dragLength / MAX_PULL,
    1
  );

  const arrowColor =
    new Color().lerpColors(
      new Color("#38bdf8"),
      new Color("#ef4444"),
      charge
    );

  const shaftRadius =
    0.08 +
    dragLength * 0.045;

  const headRadius =
    0.54 +
    charge * 0.04;

  const headLength =
    0.25 +
    charge * 0.5;

  const shaftCenter =
    new Vector3(
      0,
      -dragLength / 2,
      0.3
    );

  const shaftTip =
    new Vector3(
      0,
      -dragLength,
      0.3
    );

  return (
    <group
      renderOrder={10}
      position={[
        shake,
        0,
        0,
      ]}
    >
      <mesh
        position={[
          shaftCenter.x,
          shaftCenter.y,
          shaftCenter.z,
        ]}
        rotation={[
          0,
          0,
          Math.PI,
        ]}
      >
        <cylinderGeometry
          args={[
            shaftRadius,
            0.005,
            dragLength,
            32,
          ]}
        />

        <meshBasicMaterial
          color={arrowColor}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>

      <mesh
        position={[
          shaftTip.x,
          shaftTip.y,
          shaftTip.z,
        ]}
        rotation={[
          0,
          0,
          Math.PI,
        ]}
      >
        <coneGeometry
          args={[
            headRadius,
            headLength,
            32,
          ]}
        />

        <meshBasicMaterial
          color={arrowColor}
          transparent
          opacity={0.98}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}