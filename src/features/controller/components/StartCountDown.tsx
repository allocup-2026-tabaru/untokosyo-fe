"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Panel } from "@/components/ui/Panel";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { ControllerScene } from "../scene/ControllerScene";
import { PullArrowIndicator } from "./PullArrowIndicator";

type StartCountDownProps = {
  onStart: () => void;
};

export function StartCountDown({
  onStart,
}: StartCountDownProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // 実行開始
    setCount(10);

    const timer1 = setTimeout(() => setCount(2), 10000);
    const timer2 = setTimeout(() => setCount(1), 20000);
    const timer3 = setTimeout(() => {
      setCount(null);
      onStart();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onStart]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      <Canvas
        className="absolute inset-0 z-10"
        camera={{
          position: [0, 0, 10],
          fov: 45,
        }}
      >
        {/* カウント表示 */}
      </Canvas>

      {count !== null && (
        <ModalOverlay>
        <div className="flex h-full w-full items-center justify-center">
            <Panel className="w-full max-w-sm">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-text-primary">
                    {count}
                </h2>
            </Panel>
        </div>
        </ModalOverlay>
      )}
    </div>
  );
}