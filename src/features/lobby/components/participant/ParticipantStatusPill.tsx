type Props = {
  status: string;
};

export function ParticipantStatusPill({ status }: Props) {
  const isReady = status === "準備完了";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isReady ? "bg-[#e2f3db] text-[#2d6b21]" : "bg-[#efe7d5] text-[#8d6e2f]"
      }`}
    >
      {status}
    </span>
  );
}
