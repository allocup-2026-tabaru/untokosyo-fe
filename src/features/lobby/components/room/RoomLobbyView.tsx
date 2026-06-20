"use client";

import { useRouter } from "next/navigation";
import { useCreateRoom } from "../../hooks/useCreateRoom";
import { LobbyPageShell } from "../layout/LobbyPageShell";
import { LobbyPanel } from "../layout/LobbyPanel";
import { RoomActions } from "./RoomActions";
import { RoomHowToPlay } from "./RoomHowToPlay";
import { RoomHeader } from "./RoomHeader";

export function RoomLobbyView() {
  const router = useRouter();
  const { roomId, isPending, error } = useCreateRoom();

  const handleConfirm = () => {
    if (roomId) router.push(`/${roomId}`);
  };

  return (
    <LobbyPageShell align="end">
      <LobbyPanel className="w-full max-w-2xl">
        <div className="space-y-6">
          <RoomHeader roomId={error ? "エラー" : (roomId ?? "...")} />
          <RoomHowToPlay />
          <RoomActions onConfirm={handleConfirm} disabled={isPending || !!error} />
        </div>
      </LobbyPanel>
    </LobbyPageShell>
  );
}
