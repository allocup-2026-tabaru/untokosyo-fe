type Props = {
  status: string;
  variant: "light" | "dark";
};

const lightStyles = {
  ready: "bg-[#e2f3db] text-[#2d6b21]",
  waiting: "bg-[#efe7d5] text-[#8d6e2f]",
} as const;

const darkStyles = {
  ready: "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/20",
  waiting: "bg-amber-400/15 text-amber-100 ring-1 ring-amber-300/20",
} as const;

export function StatusPill({ status, variant }: Props) {
  const isReady = status === "準備完了";
  const styles = variant === "light" ? lightStyles : darkStyles;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isReady ? styles.ready : styles.waiting}`}>
      {status}
    </span>
  );
}
