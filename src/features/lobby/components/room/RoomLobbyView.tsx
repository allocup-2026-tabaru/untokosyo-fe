import { mockParticipants } from "../../constants/mockParticipants";
import { LOBBY_ROOM_ID } from "../../constants/lobbyRoom";
import { LobbyPageShell } from "../layout/LobbyPageShell";
import { LobbyPanel } from "../layout/LobbyPanel";
import { RoomActions } from "./RoomActions";
import { RoomHeader } from "./RoomHeader";
import { RoomSummaryCard } from "./RoomSummaryCard";

export function RoomLobbyView() {
  return (
    <LobbyPageShell align="end">
      <LobbyPanel className="w-full max-w-2xl">
        <div className="space-y-6">
          <RoomHeader />
          <RoomSummaryCard participantCount={mockParticipants.length} roomId={LOBBY_ROOM_ID} />
          <RoomActions roomId={LOBBY_ROOM_ID} />
        </div>
      </LobbyPanel>
    </LobbyPageShell>
  );
}
