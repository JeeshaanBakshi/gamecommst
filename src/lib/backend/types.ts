import type { Answer, ConnStatus, GameState, NewPlayer, Player, QuestionKey, Room } from "../types";

export interface Handlers {
  onState?: (s: GameState) => void;
  onPlayer?: (p: Player) => void;
  onAnswer?: (a: Answer) => void;
  onStatus?: (s: ConnStatus) => void;
}

export class PlayerGoneError extends Error {
  constructor() {
    super("Player no longer exists in this room");
  }
}

export interface Backend {
  mode: "supabase" | "local";
  serverTime(): Promise<number>;

  createRoom(code: string): Promise<{ room: Room; state: GameState }>;
  getRoomByCode(code: string): Promise<Room | null>;

  getState(roomId: string): Promise<GameState | null>;
  updateState(roomId: string, patch: Partial<GameState>): Promise<void>;

  listPlayers(roomId: string): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  addPlayers(rows: NewPlayer[]): Promise<Player[]>;
  removePlayer(id: string): Promise<void>;

  listAnswers(roomId: string): Promise<Answer[]>;
  listPlayerAnswers(playerId: string): Promise<Answer[]>;
  /** Throws PlayerGoneError if the player was kicked / room was reset. */
  upsertAnswers(rows: Answer[]): Promise<void>;
  /** Clears every player's answers to these questions (the host's Redo button). */
  deleteAnswers(roomId: string, questions: QuestionKey[]): Promise<void>;

  /** Wipes players + answers, sends everyone back to the lobby, bumps epoch. */
  resetRoom(roomId: string, next: Pick<GameState, "epoch" | "rev">): Promise<void>;

  /** Only the tables you pass handlers for are subscribed. Returns unsubscribe. */
  subscribe(roomId: string, h: Handlers): () => void;
}
