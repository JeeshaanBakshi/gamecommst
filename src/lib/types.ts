export type QuestionKey =
  | "stress"
  | "sleep"
  | "meals"
  | "study"
  | "scroll"
  | "math"
  | "family"
  | "quiz_shed"
  | "quiz_sleep"
  | "quiz_iron"
  | "quiz_genetics";

export interface Room {
  id: string;
  code: string;
  created_at?: string;
}

/** The single row the host writes and every phone follows. */
export interface GameState {
  room_id: string;
  /** Index into SCREENS. */
  screen: number;
  /** Results callout shown (questions) — also implies locked. */
  revealed: boolean;
  /** Phones can no longer submit for the current screen. */
  locked: boolean;
  /** Server-clock ISO timestamp for timed screens (math round, finale reveal). */
  started_at: string | null;
  /** Bumped on "Reset room" so phones know to re-join. */
  epoch: number;
  /** Monotonic revision so stale realtime echoes can be ignored. */
  rev: number;
  updated_at?: string;
}

export interface Player {
  id: string;
  room_id: string;
  nickname: string;
  emoji: string;
  is_fake: boolean;
  epoch: number;
  created_at: string;
}

export type NewPlayer = Omit<Player, "id" | "created_at">;

/**
 * Choice / slider answers store the 0-based option index in `v`.
 * Math answers store progress: `correct`, `ms` (time of last correct answer), `done`.
 */
export interface AnswerValue {
  v?: number;
  correct?: number;
  ms?: number;
  done?: boolean;
  /** Server-clock ms when a quiz answer was submitted (for "fastest correct"). */
  t?: number;
}

export interface Answer {
  room_id: string;
  player_id: string;
  question: QuestionKey;
  value: AnswerValue;
  updated_at?: string;
}

/** question -> playerId -> value */
export type AnswerIndex = Partial<Record<QuestionKey, Record<string, AnswerValue>>>;

export type ConnStatus = "connecting" | "live" | "offline";

export function indexAnswers(rows: Answer[]): AnswerIndex {
  const idx: AnswerIndex = {};
  for (const r of rows) {
    (idx[r.question] ??= {})[r.player_id] = r.value;
  }
  return idx;
}
