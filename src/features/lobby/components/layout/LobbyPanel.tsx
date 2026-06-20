import type { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

export function LobbyPanel({ className = "", children }: Props) {
  return (
    <section
      className={`rounded-[2rem] border border-white/60 bg-[rgba(255,250,242,0.82)] p-6 shadow-[0_30px_80px_rgba(40,56,28,0.18)] backdrop-blur-md sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}
