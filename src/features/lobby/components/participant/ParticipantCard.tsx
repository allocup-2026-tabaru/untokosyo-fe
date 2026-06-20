import { ParticipantAvatar } from "./ParticipantAvatar";
import { ParticipantStatusPill } from "./ParticipantStatusPill";

type Props = {
  name: string;
  character: string;
  status: string;
  accentClassName: string;
};

export function ParticipantCard({
  name,
  character,
  status,
  accentClassName,
}: Props) {
  return (
    <article className="rounded-[1.5rem] border border-white/70 bg-white/88 p-4 shadow-[0_18px_48px_rgba(54,63,38,0.12)] backdrop-blur">
      <div className="flex items-center gap-4">
        <ParticipantAvatar accentClassName={accentClassName} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-[-0.02em] text-[#25301b]">
              {name}
            </h3>
            <ParticipantStatusPill status={status} />
          </div>
          <p className="mt-1 text-sm text-[#647059]">{character}</p>
        </div>
      </div>
    </article>
  );
}
