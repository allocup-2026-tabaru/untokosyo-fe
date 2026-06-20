"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Vector3 } from "three";

const MAX_PULL = 2;

export default function PullArrowIndicator() {
  const [dragging, setDragging] =
    useState(false);

  const [dragLength, setDragLength] =
    useState(0);

  const [shake, setShake] =
    useState({
      x: 0,
      y: 0,
      r: 0,
    });

  const startPos =
    useRef<Vector3 | null>(null);

  const vibratedLevel =
    useRef(0);

  const pulse =
    useRef(0);

  useEffect(() => {
    const onPointerDown = (
      e: PointerEvent
    ) => {
      e.preventDefault();

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
      e.preventDefault();

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

      // ここからバイブレーション周りの実装→実機で振動が確認できないが、
      // 解決策も見つからないため一度放置している。

      if (
        "vibrate" in navigator &&
        charge > 0.3 &&
        vibratedLevel.current < 1
      ) {
        navigator.vibrate(100);
        vibratedLevel.current = 1;
      }

      if (
        "vibrate" in navigator &&
        charge > 0.6 &&
        vibratedLevel.current < 2
      ) {
        navigator.vibrate([
          55,
          40,
          55,
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

    // ここまでバイブレーション周りの設定

    const onPointerUp = () => {
      setDragging(false);
      setDragLength(0);

      setShake({
        x: 0,
        y: 0,
        r: 0,
      });

      pulse.current = 0;

      startPos.current = null;
      vibratedLevel.current = 0;
    };

    const onTouchMove = (
      e: TouchEvent
    ) => {
      if (dragging) {
        e.preventDefault();
      }
    };

    window.addEventListener(
      "pointerdown",
      onPointerDown,
      {
        passive: false,
      }
    );

    window.addEventListener(
      "pointermove",
      onPointerMove,
      {
        passive: false,
      }
    );

    window.addEventListener(
      "pointerup",
      onPointerUp
    );

    window.addEventListener(
      "touchmove",
      onTouchMove,
      {
        passive: false,
      }
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

      window.removeEventListener(
        "touchmove",
        onTouchMove
      );
    };
  }, [dragging]);

  useFrame(({ clock }) => {
    if (
      !dragging ||
      dragLength <= 0.05
    ) {
      setShake({
        x: 0,
        y: 0,
        r: 0,
      });

      pulse.current = 0;
      return;
    }

    const charge = Math.min(
      dragLength / MAX_PULL,
      1
    );

    const intensity =
      charge * charge;

    const t =
      clock.elapsedTime;

    let frequency =
      10 +
      intensity * 35;

    let amplitude =
      0.003 +
      intensity * 0.03;

    if (charge > 0.6) {
      frequency += 15;
      amplitude += 0.008;
    }

    const x =
      Math.sin(
        t * frequency
      ) * amplitude;

    const y =
      Math.cos(
        t *
          frequency *
          1.37
      ) *
      amplitude *
      0.6;

    const r =
      Math.sin(
        t *
          frequency *
          1.81
      ) *
      amplitude *
      0.5;

    let noiseX = 0;
    let noiseY = 0;
    let noiseR = 0;

    if (charge > 0.85) {
      const n =
        (charge - 0.85) /
        0.15;

      noiseX =
        (Math.random() -
          0.5) *
        n *
        0.02;

      noiseY =
        (Math.random() -
          0.5) *
        n *
        0.012;

      noiseR =
        (Math.random() -
          0.5) *
        n *
        0.02;
    }

    setShake({
      x: x + noiseX,
      y: y + noiseY,
      r: r + noiseR,
    });

    pulse.current =
      charge > 0.95
        ? (Math.sin(
            t * 120
          ) +
            1) *
          0.5
        : 0;
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

  const pulseScale =
    pulse.current * 0.03;

  const glow =
    pulse.current;

  const arrowColor =
    new Color().lerpColors(
      new Color("#38bdf8"),
      new Color(
        `rgb(
          255,
          ${
            68 +
            glow * 100
          },
          ${
            68 +
            glow * 30
          }
        )`
      ),
      charge
    );

  const shaftRadius =
    0.08 +
    dragLength * 0.045 +
    pulseScale;

  const headRadius =
    0.54 +
    charge * 0.04 +
    pulseScale;

  const headLength =
    0.25 +
    charge * 0.5 +
    pulseScale;

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
        shake.x,
        shake.y,
        0,
      ]}
      rotation={[
        0,
        0,
        shake.r,
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