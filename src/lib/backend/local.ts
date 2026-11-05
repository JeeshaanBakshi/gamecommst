/**
 * Zero-setup backend used when Supabase env vars are missing.
 * Data lives in localStorage and syncs between tabs of the SAME browser via
 * BroadcastChannel, so you can open /host and a few /play tabs side by side
 * to rehearse. Real phones need the Supabase backend.
 */
import { uid } from "../uid";
import type { Answer, GameState, Player, Room } from "../types";
import { PlayerGoneError, type Backend, type Handlers } from "./types";

interface DB {
  rooms: Room[];
  states: Record<string, GameState>;
  players: Player[];
  answers: Answer[];
}

type Msg =
  | { kind: "state"; row: GameState }
  | { kind: "player"; row: Player }
  | { kind: "answer"; row: Answer };

const KEY = "wle-local-db-v1";
const FRESH = { screen: 0, revealed: false, locked: false, started_at: null };

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch {}
  return { rooms: [], states: {}, players: [], answers: [] };
}

function save(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function createLocalBackend(): Backend {
  const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("wle-local") : null;
  const sameTab = new EventTarget();

  const emit = (m: Msg) => {
    bc?.postMessage(m);
    sameTab.dispatchEvent(new CustomEvent<Msg>("msg", { detail: m }));
  };

  const tx = <T,>(fn: (db: DB) => T): T => {
    const db = load();
    const out = fn(db);
    save(db);
    return out;
  };

  const delay = () => new Promise((r) => setTimeout(r, 30 + Math.random() * 60));

  return {
    mode: "local",

    async serverTime() {
      return Date.now();
    },

    async createRoom(code) {
      await delay();
      return tx((db) => {
        const room: Room = { id: uid(), code, created_at: new Date().toISOString() };
        const state: GameState = { room_id: room.id, ...FRESH, epoch: 0, rev: 0 };
        db.rooms.push(room);
        db.states[room.id] = state;
        return { room, state };
      });
    },

    async getRoomByCode(code) {
      return load().rooms.find((r) => r.code === code.toUpperCase()) ?? null;
    },

    async getState(roomId) {
      return load().states[roomId] ?? null;
    },

    async updateState(roomId, patch) {
      await delay();
      const row = tx((db) => (db.states[roomId] = { ...db.states[roomId], ...patch, updated_at: new Date().toISOString() }));
      emit({ kind: "state", row });
    },

    async listPlayers(roomId) {
      return load().players.filter((p) => p.room_id === roomId);
    },

    async getPlayer(id) {
      return load().players.find((p) => p.id === id) ?? null;
    },

    async addPlayers(rows) {
      await delay();
      const created = tx((db) => {
        const out = rows.map((r) => ({ ...r, id: uid(), created_at: new Date().toISOString() }));
        db.players.push(...out);
        return out;
      });
      created.forEach((row) => emit({ kind: "player", row }));
      return created;
    },

    async removePlayer(id) {
      tx((db) => {
        db.players = db.players.filter((p) => p.id !== id);
        db.answers = db.answers.filter((a) => a.player_id !== id);
      });
    },

    async listAnswers(roomId) {
      return load().answers.filter((a) => a.room_id === roomId);
    },

    async listPlayerAnswers(playerId) {
      return load().answers.filter((a) => a.player_id === playerId);
    },

    async upsertAnswers(rows) {
      await delay();
      tx((db) => {
        for (const r of rows) {
          if (!db.players.some((p) => p.id === r.player_id)) throw new PlayerGoneError();
          const i = db.answers.findIndex((a) => a.player_id === r.player_id && a.question === r.question);
          if (i >= 0) db.answers[i] = r;
          else db.answers.push(r);
        }
      });
      rows.forEach((row) => emit({ kind: "answer", row }));
    },

    async resetRoom(roomId, next) {
      const row = tx((db) => {
        db.players = db.players.filter((p) => p.room_id !== roomId);
        db.answers = db.answers.filter((a) => a.room_id !== roomId);
        return (db.states[roomId] = { ...db.states[roomId], ...FRESH, ...next });
      });
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
