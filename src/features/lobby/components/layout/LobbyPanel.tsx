import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";

type Props = {
  className?: string;
  children: ReactNode;
};

export function LobbyPanel({ className, children }: Props) {
  return <Panel className={className}>{children}</Panel>;
}
