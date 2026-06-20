export type ParticipantStatus = "準備完了" | "準備中";

export type Participant = {
  id: string;
  name: string;
  characterModel: string;
  status: ParticipantStatus;
  accentClassName: string;
};
