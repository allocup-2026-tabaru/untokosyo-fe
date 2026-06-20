type Props = {
  accentClassName: string;
};

export function ParticipantAvatar({ accentClassName }: Props) {
  return (
    <div
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${accentClassName} text-xs font-semibold tracking-[0.16em] text-white uppercase`}
    >
      model
    </div>
  );
}
