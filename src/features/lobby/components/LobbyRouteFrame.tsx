"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LobbyBackgroundScene } from "../scene/LobbyBackgroundScene";

type Props = {
  children: ReactNode;
};

export function LobbyRouteFrame({ children }: Props) {
  const pathname = usePathname();
  const variant = pathname === "/lobby" ? "room" : "start";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#d5ebf5] text-[#1e2616]">
      <LobbyBackgroundScene variant={variant} />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
