"use client";

import { useState } from "react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { Panel } from "@/components/ui/Panel";

type Props = {
  onStart: (playerName: string) => void;
};

export function NameInputScreen({ onStart }: Props) {
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = () => {
    onStart(playerName);
  };

  return (
    <ModalOverlay>
      <div className="flex h-full w-full items-center justify-center">
        <Panel className="w-full max-w-sm">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-text-primary">
            名前を入力してください
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={12}
              placeholder="名前を入力"
              className="w-full rounded-xl border-2 border-panel-border bg-white px-4 py-3 text-center text-lg text-text-primary outline-none placeholder:text-text-muted focus:border-accent-green"
            />
            <button
              onClick={handleSubmit}
              className="w-full rounded-xl bg-accent-green py-3 text-base font-semibold text-white transition-colors hover:bg-accent-green-dark active:scale-[0.97]"
            >
              Start
            </button>
          </div>
        </Panel>
      </div>
    </ModalOverlay>
  );
}
