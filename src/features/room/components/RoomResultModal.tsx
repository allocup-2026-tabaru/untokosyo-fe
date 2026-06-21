"use client";

import { useState } from "react";
import type { Participant } from "@/shared/types/participant";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

type Props = {
  survivors: readonly Participant[];
  allParticipants: readonly Participant[];
  isVisible: boolean;
};

const rankLabel = (index: number) => `${index + 1}位`;
const formatPullPower = (pullPower?: number) => `${pullPower ?? 0} Pull Power`;

export function RoomResultModal({ survivors, allParticipants, isVisible }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const maxPull = Math.max(...allParticipants.map((p) => p.pullPower ?? 0), 1);

  return (
    <ModalOverlay isVisible={isVisible}>
      <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <section className="pointer-events-auto w-full max-w-3xl rounded-[1.75rem] border border-white/10 bg-black/[0.36] p-6 text-white shadow-[0_24px_64px_rgba(0,0,0,0.28)] backdrop-blur-lg sm:p-8">
          <div className="space-y-5 rounded-[1.5rem] border border-white/10 bg-white/4 p-6">
            <p className="text-sm font-medium tracking-[0.24em] text-white/60 uppercase">
              Result
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              リザルト
            </h2>
            <p className="text-base leading-7 text-white/70">ゲーム終了</p>

            {/* 生存者ランキング */}
            <div className="space-y-3 pt-2">
              {survivors.map((participant, index) => (
                <div
                  key={participant.id}
                  className="grid grid-cols-[4rem_1fr_auto] items-center gap-4 rounded-[1.1rem] bg-black/16 px-4 py-3 ring-1 ring-white/8"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/12 text-sm font-semibold text-white">
                    {rankLabel(index)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-white">
                      {participant.name}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-semibold text-white">
                      {formatPullPower(participant.pullPower)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 詳細トグルボタン */}
            {allParticipants.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-[0.9rem] border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10"
              >
                {showDetails ? "閉じる ▲" : "全員の記録を見る ▼"}
              </button>
            )}

            {/* 詳細：全員の棒グラフ */}
            {showDetails && (
              <div className="space-y-2 pt-1">
                {allParticipants.map((participant) => {
                  const pull = participant.pullPower ?? 0;
                  const barWidth = `${(pull / maxPull) * 100}%`;
                  return (
                    <div key={participant.id} className="flex items-center gap-3">
                      <div className="w-24 shrink-0 truncate text-right text-sm text-white/70">
                        {participant.name}
                      </div>
                      <div className="relative flex-1 overflow-hidden rounded-full bg-white/8 h-5">
                        <div
                          className={`h-full rounded-full transition-all ${participant.eliminated ? "bg-red-400/50" : "bg-white/70"}`}
                          style={{ width: barWidth }}
                        />
                      </div>
                      <div className="w-28 shrink-0 text-sm text-white/60">
                        {pull} Pull
                        {participant.eliminated && (
                          <span className="ml-1.5 text-xs text-red-400">脱落</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </ModalOverlay>
  );
}
