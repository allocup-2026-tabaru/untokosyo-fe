import { mockParticipants } from "../../constants/mockParticipants";
import { LobbyPageShell } from "../layout/LobbyPageShell";
import { LobbyPanel } from "../layout/LobbyPanel";
import { RoomActions } from "./RoomActions";
import { RoomHeader } from "./RoomHeader";
import { RoomParticipantList } from "./RoomParticipantList";
import { RoomSummaryCard } from "./RoomSummaryCard";

export function RoomLobbyView() {
  return (
    <LobbyPageShell align="end">
      <LobbyPanel className="w-full max-w-2xl">
        <div className="space-y-6">
          <RoomHeader />
          <RoomSummaryCard participantCount={mockParticipants.length} roomId="0001" />
          <RoomParticipantList participants={mockParticipants} />
          <RoomActions />
        </div>
      </LobbyPanel>
    </LobbyPageShell>
  );
}
