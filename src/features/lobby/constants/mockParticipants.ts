export type LobbyParticipant = {
  id: string;
  name: string;
  character: string;
  status: string;
  accentClassName: string;
};

export const mockParticipants: readonly LobbyParticipant[] = [
  {
    id: "host",
    name: "Player 1",
    character: "Shiba",
    status: "準備完了",
    accentClassName: "from-[#f0b36a] to-[#bf5f24]",
  },
  {
    id: "guest-1",
    name: "Player 2",
    character: "Mole",
    status: "準備中",
    accentClassName: "from-[#8abf63] to-[#356d30]",
  },
  {
    id: "guest-2",
    name: "Player 3",
    character: "Rabbit",
    status: "準備中",
    accentClassName: "from-[#96b6d9] to-[#3f6294]",
  },
] as const;
