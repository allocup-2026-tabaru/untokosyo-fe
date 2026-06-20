// ─── Client → Server ────────────────────────────────────────────────────────

export type AuthMessage = { type: "auth"; token: string };
export type PullMessage = { type: "pull"; playerID: string; clientTimestamp: number };
export type ReleaseMessage = { type: "release"; playerID: string; clientTimestamp: number };
export type PongMessage = { type: "pong"; serverTimestamp: number; clientTimestamp: number };

export type ClientMessage = AuthMessage | PullMessage | ReleaseMessage | PongMessage;

// ─── 共通受信イベント（Host・Player両方） ────────────────────────────────────

export type GameCountdownEvent = {
  type: "game_countdown";
  payload: { scheduledStartAt: number };
};
export type GameStartEvent = { type: "game_start"; payload: { startedAt: number } };
export type PingEvent = { type: "ping"; serverTimestamp: number };

// ─── Server → Host ──────────────────────────────────────────────────────────

type HostPlayerState = {
  playerID: string;
  name: string;
  status: string;
  isPulling: boolean;
  pullAccumulation: number;
};

type TurnipState = {
  totalPullAccumulation: number;
  extractionProbability: number;
};

type Standing = {
  playerID: string;
  name: string;
  pullAccumulation: number;
  rank: number;
};

export type HostRoomStateEvent = {
  type: "room_state";
  payload: {
    status: string;
    players: HostPlayerState[];
    turnip: TurnipState;
  };
};

export type PlayerJoinedEvent = {
  type: "player_joined";
  payload: { playerID: string; name: string };
};

export type TurnipUpdateEvent = {
  type: "turnip_update";
  payload: { totalPullAccumulation: number; extractionProbability: number };
};

export type HostPlayerUpdateEvent = {
  type: "player_update";
  payload: { playerID: string; isPulling: boolean };
};

export type ExtractedEvent = {
  type: "extracted";
  payload: { eliminatedPlayerIDs: string[] };
};

export type HostGameFinishedEvent = {
  type: "game_finished";
  payload: { winnerPlayerID: string; winnerName: string; standings: Standing[] };
};

export type HostServerEvent =
  | HostRoomStateEvent
  | PlayerJoinedEvent
  | GameCountdownEvent
  | GameStartEvent
  | PingEvent
  | TurnipUpdateEvent
  | HostPlayerUpdateEvent
  | ExtractedEvent
  | HostGameFinishedEvent;

// ─── Server → Player (Controller) ───────────────────────────────────────────

export type PlayerRoomStateEvent = {
  type: "room_state";
  payload: { status: string; myPlayerID: string; myPullAccumulation: number };
};

export type PlayerPlayerUpdateEvent = {
  type: "player_update";
  payload: { playerID: string; isPulling: boolean; status: string };
};

export type EliminatedEvent = {
  type: "eliminated";
  payload: { playerID: string };
};

export type PlayerGameFinishedEvent = {
  type: "game_finished";
  payload: { winnerPlayerID: string; myRank: number; myPullAccumulation: number };
};

export type ErrorEvent = {
  type: "error";
  payload: { code: string; message: string };
};

export type PlayerServerEvent =
  | PlayerRoomStateEvent
  | GameCountdownEvent
  | GameStartEvent
  | PingEvent
  | PlayerPlayerUpdateEvent
  | EliminatedEvent
  | PlayerGameFinishedEvent
  | ErrorEvent;
