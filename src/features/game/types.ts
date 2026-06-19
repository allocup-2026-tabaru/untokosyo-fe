// HTTP APIレスポンス型

export type CreateRoomResponse = {
  roomID: string;
  hostPlayerID: string;
  token: string;
};

export type JoinRoomResponse = {
  playerID: string;
  name: string;
  token: string;
};

export type StartGameResponse = {
  ok: boolean;
};

export type PlayerStatus = "active" | "eliminated";
export type RoomStatus = "waiting" | "playing" | "finished";

export type RoomPlayer = {
  ID: string;
  Name: string;
  Status: PlayerStatus;
  IsPulling: boolean;
  PullAccumulation: number;
  LatencyMs: number;
  ClockOffsetMs: number;
  JoinedAt: string;
};

export type RoomTurnip = {
  TotalPullAccumulation: number;
  ExtractionProbability: number;
  IsExtracted: boolean;
  ExtractedAt: string | null;
};

export type RoomState = {
  ID: string;
  HostPlayerID: string;
  Status: RoomStatus;
  Players: Record<string, RoomPlayer>;
  Turnip: RoomTurnip;
  Winner: string | null;
  CreatedAt: string;
  StartedAt: string | null;
  FinishedAt: string | null;
};

// WSクライアント→サーバーメッセージ型

export type WsAuthMessage = {
  type: "auth";
  token: string;
};

export type WsPullMessage = {
  type: "pull";
  playerID: string;
  clientTimestamp: number;
};

export type WsReleaseMessage = {
  type: "release";
  playerID: string;
  clientTimestamp: number;
};

export type WsPongMessage = {
  type: "pong";
  serverTimestamp: number;
  clientTimestamp: number;
};

export type WsClientMessage =
  | WsAuthMessage
  | WsPullMessage
  | WsReleaseMessage
  | WsPongMessage;

// WSサーバー→クライアント メッセージ型（ホスト向け）

export type WsRoomStateHostPayload = {
  status: RoomStatus;
  players: Array<{
    playerID: string;
    name: string;
    status: PlayerStatus;
    isPulling: boolean;
    pullAccumulation: number;
  }>;
  turnip: {
    totalPullAccumulation: number;
    extractionProbability: number;
  };
};

export type WsPlayerJoinedPayload = {
  playerID: string;
  name: string;
};

export type WsGameStartPayload = {
  startedAt: number;
};

export type WsPingMessage = {
  type: "ping";
  serverTimestamp: number;
};

export type WsTurnipUpdatePayload = {
  totalPullAccumulation: number;
  extractionProbability: number;
};

export type WsPlayerUpdateHostPayload = {
  playerID: string;
  isPulling: boolean;
};

export type WsExtractedPayload = {
  eliminatedPlayerIDs: string[];
};

export type WsGameFinishedHostPayload = {
  winnerPlayerID: string;
  winnerName: string;
  standings: Array<{
    playerID: string;
    name: string;
    pullAccumulation: number;
    rank: number;
  }>;
};

// WSサーバー→クライアント メッセージ型（コントローラー向け）

export type WsRoomStatePlayerPayload = {
  status: RoomStatus;
  myPlayerID: string;
  myPullAccumulation: number;
};

export type WsPlayerUpdatePlayerPayload = {
  playerID: string;
  isPulling: boolean;
  status: PlayerStatus;
};

export type WsEliminatedPayload = {
  playerID: string;
};

export type WsGameFinishedPlayerPayload = {
  winnerPlayerID: string;
  myRank: number;
  myPullAccumulation: number;
};

export type WsErrorPayload = {
  code: string;
  message: string;
};

// WSサーバー→クライアント union型

export type WsServerMessage =
  | { type: "room_state"; payload: WsRoomStateHostPayload | WsRoomStatePlayerPayload }
  | { type: "player_joined"; payload: WsPlayerJoinedPayload }
  | { type: "game_start"; payload: WsGameStartPayload }
  | { type: "ping"; serverTimestamp: number }
  | { type: "turnip_update"; payload: WsTurnipUpdatePayload }
  | { type: "player_update"; payload: WsPlayerUpdateHostPayload | WsPlayerUpdatePlayerPayload }
  | { type: "extracted"; payload: WsExtractedPayload }
  | { type: "eliminated"; payload: WsEliminatedPayload }
  | { type: "game_finished"; payload: WsGameFinishedHostPayload | WsGameFinishedPlayerPayload }
  | { type: "error"; payload: WsErrorPayload };

// イベントログ型（デバッグUI用）

export type EventLog = {
  timestamp: number;
  type: string;
  payload: unknown;
};

// hookが公開するゲーム状態型

export type HostPlayerState = {
  playerID: string;
  name: string;
  status: PlayerStatus;
  isPulling: boolean;
  pullAccumulation: number;
};

export type HostTurnipState = {
  totalPullAccumulation: number;
  extractionProbability: number;
};

export type HostGameState = {
  status: RoomStatus;
  players: HostPlayerState[];
  turnip: HostTurnipState;
};

export type PlayerState = {
  status: RoomStatus;
  myPlayerID: string;
  myPullAccumulation: number;
  isPulling: boolean;
  playerStatus: PlayerStatus;
};
