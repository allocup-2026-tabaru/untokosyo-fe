import { LobbyRouteFrame } from "@/features/lobby/components/LobbyRouteFrame";

export default function LobbyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LobbyRouteFrame>{children}</LobbyRouteFrame>;
}
