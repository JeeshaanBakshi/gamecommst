/**
 * Zero-setup backend used when Supabase env vars are missing.
 * Data lives in localStorage and syncs between tabs of the SAME browser via
 * BroadcastChannel, so you can open /host and a few /play tabs side by side
 * to rehearse. Real phones need the Supabase backend.
 *
 * Every row has its own localStorage key (like a table row), so several tabs
 * answering at the same moment never overwrite each other.
 */
import { uid } from "../uid";
import type { Answer, GameState, Player, Room } from "../types";
import { PlayerGoneError, type Backend, type Handlers } from "./types";

type Msg =
  | { kind: "state"; row: GameState }
  | { kind: "player"; row: Player }
  | { kind: "answer"; row: Answer };

const P = "wle2:";
const K = {
  room: (code: string) => `${P}room:${code}`,
  state: (roomId: string) => `${P}state:${roomId}`,
  player: (id: string) => `${P}player:${id}`,
  answer: (playerId: string, q: string) => `${P}answer:${playerId}:${q}`,
};
const FRESH = { screen: 0, revealed: false, locked: false, started_at: null };

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
const put = (key: string, v: unknown) => localStorage.setItem(key, JSON.stringify(v));
const del = (key: string) => localStorage.removeItem(key);

function scan<T>(prefix: string): { key: string; row: T }[] {
  const out: { key: string; row: T }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      const row = get<T>(key);
      if (row) out.push({ key, row });
    }
  }
  return out;
}

export function createLocalBackend(): Backend {
  const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("wle-local") : null;
  const sameTab = new EventTarget();

  const emit = (m: Msg) => {
    bc?.postMessage(m);
    sameTab.dispatchEvent(new CustomEvent<Msg>("msg", { detail: m }));
  };

  const delay = () => new Promise((r) => setTimeout(r, 30 + Math.random() * 60));

  return {
    mode: "local",

    async serverTime() {
      return Date.now();
    },

    async createRoom(code) {
      await delay();
      const room: Room = { id: uid(), code, created_at: new Date().toISOString() };
      const state: GameState = { room_id: room.id, ...FRESH, epoch: 0, rev: 0 };
      put(K.room(code), room);
      put(K.state(room.id), state);
      return { room, state };
    },

    async getRoomByCode(code) {
      return get<Room>(K.room(code.toUpperCase()));
    },

    async getState(roomId) {
      return get<GameState>(K.state(roomId));
    },

    async updateState(roomId, patch) {
      await delay();
      const row = { ...get<GameState>(K.state(roomId))!, ...patch, updated_at: new Date().toISOString() };
      put(K.state(roomId), row);
      emit({ kind: "state", row });
    },

    async listPlayers(roomId) {
      return scan<Player>(`${P}player:`)
        .map((x) => x.row)
        .filter((p) => p.room_id === roomId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
    },

    async getPlayer(id) {
      return get<Player>(K.player(id));
    },

    async addPlayers(rows) {
      await delay();
      const created = rows.map((r) => ({ ...r, id: uid(), created_at: new Date().toISOString() }));
      created.forEach((p) => put(K.player(p.id), p));
      created.forEach((row) => emit({ kind: "player", row }));
      return created;
    },

    async removePlayer(id) {
      del(K.player(id));
      scan(`${P}answer:${id}:`).forEach((x) => del(x.key));
    },

    async listAnswers(roomId) {
      return scan<Answer>(`${P}answer:`)
        .map((x) => x.row)
        .filter((a) => a.room_id === roomId);
    },

    async listPlayerAnswers(playerId) {
      return scan<Answer>(`${P}answer:${playerId}:`).map((x) => x.row);
    },

    async upsertAnswers(rows) {
      await delay();
      for (const r of rows) {
        if (!get(K.player(r.player_id))) throw new PlayerGoneError();
        put(K.answer(r.player_id, r.question), r);
      }
      rows.forEach((row) => emit({ kind: "answer", row }));
    },

    async deleteAnswers(roomId, questions) {
      for (const { key, row } of scan<Answer>(`${P}answer:`)) {
        if (row.room_id === roomId && questions.includes(row.question)) del(key);
      }
    },

    async resetRoom(roomId, next) {
      for (const { key, row } of scan<Player>(`${P}player:`)) {
        if (row.room_id !== roomId) continue;
        del(key);
        scan(`${P}answer:${row.id}:`).forEach((x) => del(x.key));
      }
      const row = { ...get<GameState>(K.state(roomId))!, ...FRESH, ...next };
      put(K.state(roomId), row);
      emit({ kind: "state", row });
    },

    subscribe(roomId, h: Handlers) {
      const onMsg = (m: Msg) => {
        if (m.row.room_id !== roomId) return;
        if (m.kind === "state") h.onState?.(m.row);
        if (m.kind === "player") h.onPlayer?.(m.row);
        if (m.kind === "answer") h.onAnswer?.(m.row);
      };
      const fromBc = (e: MessageEvent<Msg>) => onMsg(e.data);
      const fromTab = (e: Event) => onMsg((e as CustomEvent<Msg>).detail);
      bc?.addEventListener("message", fromBc);
      sameTab.addEventListener("msg", fromTab);
      h.onStatus?.("live");
      return () => {
        bc?.removeEventListener("message", fromBc);
        sameTab.removeEventListener("msg", fromTab);
      };
    },
  };
}
