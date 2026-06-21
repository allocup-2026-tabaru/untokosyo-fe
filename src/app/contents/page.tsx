import { RoomScene } from "@/features/room/scene/RoomScene";

const DEMO_PLAYERS = ["player1", "player2", "player3"];

export default function ContentsPage() {
  return (
    <RoomScene
      playerCount={DEMO_PLAYERS.length}
      playerNames={DEMO_PLAYERS}
    />
  );
}
