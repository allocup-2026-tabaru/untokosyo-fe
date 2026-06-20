export type RoomParticipantStatus = "準備中" | "準備完了";

export type RoomParticipant = {
  id: string;
  name: string;
  characterModel: string;
  status: RoomParticipantStatus;
  accentClassName: string;
};

export const mockRoomParticipants: readonly RoomParticipant[] = [
  {
    id: "host",
    name: "Player 1",
    characterModel: "Shiba",
    status: "準備完了",
    accentClassName: "from-[#f0b36a] to-[#bf5f24]",
  },
  {
    id: "guest-1",
    name: "Player 2",
    characterModel: "Mole",
    status: "準備中",
    accentClassName: "from-[#8abf63] to-[#356d30]",
  },
  {
    id: "guest-2",
    name: "Player 3",
    characterModel: "Rabbit",
    status: "準備中",
    accentClassName: "from-[#96b6d9] to-[#3f6294]",
  },
] as const;
