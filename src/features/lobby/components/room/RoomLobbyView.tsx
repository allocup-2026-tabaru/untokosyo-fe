import { LOBBY_ROOM_ID } from "../../constants/lobbyRoom";
import { LobbyPageShell } from "../layout/LobbyPageShell";
import { LobbyPanel } from "../layout/LobbyPanel";
import { RoomActions } from "./RoomActions";
import { RoomHowToPlay } from "./RoomHowToPlay";
import { RoomHeader } from "./RoomHeader";

export function RoomLobbyView() {
  return (
    <LobbyPageShell align="end">
      <LobbyPanel className="w-full max-w-2xl">
        <div className="space-y-6">
          <RoomHeader roomId={LOBBY_ROOM_ID} />
          <RoomHowToPlay />
          <RoomActions roomId={LOBBY_ROOM_ID} />
        </div>
      </LobbyPanel>
    </LobbyPageShell>
  );
}
