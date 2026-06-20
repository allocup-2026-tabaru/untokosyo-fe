"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { Panel } from "@/components/ui/Panel";

type StartCountDownProps = {
  onStart: () => void;
};

export function StartCountDown({
  onStart,
}: StartCountDownProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    console.log("カウントダウン開始");

    // 最初は3
    setCount(3);

    const timer1 = setTimeout(() => {
      console.log("2");
      setCount(2);
    }, 1000);

    const timer2 = setTimeout(() => {
      console.log("1");
      setCount(1);
    }, 2000);

    const timer3 = setTimeout(() => {
      console.log("終了");
      setCount(null);
      onStart();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onStart]);

  // count が変わるたびに確認
  useEffect(() => {
    console.log("count =", count);
  }, [count]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Canvas
        className="absolute inset-0 z-10"
        camera={{
          position: [0, 0, 10],
          fov: 45,
        }}
      />

      {count !== null && (
        <ModalOverlay>
          <div className="flex h-full w-full items-center justify-center">
            <Panel className="w-full max-w-sm">
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-8xl font-bold text-text-primary">
                  {count}
                </h2>

                <p className="text-sm text-text-secondary">
                  count = {count}
                </p>
              </div>
            </Panel>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}