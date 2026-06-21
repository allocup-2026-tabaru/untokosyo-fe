import type { Participant } from "@/shared/types/participant";
import { StatusPill } from "./StatusPill";

type Props = {
  participant: Participant;
  variant: "light" | "dark";
};

const cardStyles = {
  light: "rounded-[1.5rem] border border-white/70 bg-white/88 p-4 shadow-[0_18px_48px_rgba(54,63,38,0.12)] backdrop-blur",
  dark: "rounded-[1.4rem] border border-white/10 bg-white/4 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.16)]",
} as const;

const nameStyles = {
  light: "text-[#25301b]",
  dark: "text-white",
} as const;

const subTextStyles = {
  light: "text-[#647059]",
  dark: "text-white/68",
} as const;

export function ParticipantCard({ participant, variant }: Props) {
  return (
    <article className={cardStyles[variant]}>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${participant.accentClassName} text-[0.65rem] font-semibold tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(0,0,0,0.25)]`}
        >
          model
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`truncate text-base font-semibold tracking-[-0.02em] ${nameStyles[variant]}`}>
              {participant.name}
            </h3>
            <StatusPill status={participant.status} variant={variant} />
          </div>
          <p className={`mt-1 text-sm ${subTextStyles[variant]}`}>
            {participant.characterModel}
          </p>
        </div>
      </div>
    </article>
  );
}
