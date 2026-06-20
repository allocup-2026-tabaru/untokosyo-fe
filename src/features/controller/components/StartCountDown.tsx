"use client";

import { useEffect, useState } from "react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { Panel } from "@/components/ui/Panel";

type Props = {
  scheduledStartAt: number;
  onStart: () => void;
};

export function StartCountDown({ scheduledStartAt, onStart }: Props) {
  const [count, setCount] = useState(() =>
    Math.max(0, Math.ceil((scheduledStartAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const tick = () => {
      const remaining = Math.ceil((scheduledStartAt - Date.now()) / 1000);
      if (remaining <= 0) {
        setCount(0);
        onStart();
        return;
      }
      setCount(remaining);
    };

    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [scheduledStartAt, onStart]);

  if (count <= 0) return null;

  return (
    <ModalOverlay>
      <div className="flex h-full w-full items-center justify-center">
        <Panel className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-8xl font-bold text-text-primary">{count}</h2>
          </div>
        </Panel>
      </div>
    </ModalOverlay>
  );
}
