import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className = "" }: Props) {
  return (
    <section
      className={`rounded-[2rem] border border-panel-border bg-panel-bg p-6 shadow-[0_30px_80px_rgba(40,56,28,0.18)] backdrop-blur-md sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}
