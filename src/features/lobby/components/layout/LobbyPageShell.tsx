import type { ReactNode } from "react";

type Props = {
  align?: "start" | "end" | "center";
  children: ReactNode;
};

const alignClassName: Record<NonNullable<Props["align"]>, string> = {
  start: "items-center justify-start",
  end: "items-center justify-end",
  center: "items-center justify-center",
};

export function LobbyPageShell({ align = "center", children }: Props) {
  return (
    <main
      className={`mx-auto flex min-h-screen w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-16 ${alignClassName[align]}`}
    >
      {children}
    </main>
  );
}
