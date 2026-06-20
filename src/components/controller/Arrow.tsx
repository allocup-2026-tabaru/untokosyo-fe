"use client";

import { useEffect, useRef, useState } from "react";
import { Color, Vector3 } from "three";

const MAX_PULL = 3;

export default function PullArrowIndicator() {
  const [dragging, setDragging] =
    useState(false);

  const [dragLength, setDragLength] =
    useState(0);

  const startPos =
    useRef<Vector3 | null>(null);

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

      setDragLength(
        Math.min(
          length / 100,
          MAX_PULL
        )
      );
    };

    const onPointerUp = () => {
      setDragging(false);
      setDragLength(0);
      startPos.current = null;
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
    <group renderOrder={10}>
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