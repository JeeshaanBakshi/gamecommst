import { createClient } from "@supabase/supabase-js";
import type { Answer, GameState, NewPlayer, Player, Room } from "../types";
import { PlayerGoneError, type Backend, type Handlers } from "./types";

const FRESH = { screen: 0, revealed: false, locked: false, started_at: null };

export function createSupabaseBackend(url: string, key: string): Backend {
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { heartbeatIntervalMs: 15_000 },
  });

  const must = <T,>(res: { data: T; error: { message: string } | null }) => {
    if (res.error) throw new Error(res.error.message);
    return res.data;
  };

  return {
    mode: "supabase",

    async serverTime() {
      const { data, error } = await sb.rpc("server_now");
      if (error) throw error;
      return Date.parse(data as string);
    },

    async createRoom(code) {
      const room = must(await sb.from("rooms").insert({ code }).select().single()) as Room;
      const state = must(
        await sb.from("game_state").insert({ room_id: room.id, ...FRESH, epoch: 0, rev: 0 }).select().single(),
      ) as GameState;
      return { room, state };
    },

    async getRoomByCode(code) {
      const { data } = await sb.from("rooms").select().eq("code", code.toUpperCase()).maybeSingle();
      return (data as Room) ?? null;
    },

    async getState(roomId) {
      const { data } = await sb.from("game_state").select().eq("room_id", roomId).maybeSingle();
      return (data as GameState) ?? null;
    },

    async updateState(roomId, patch) {
      must(await sb.from("game_state").update({ ...patch, updated_at: new Date().toISOString() }).eq("room_id", roomId));
    },

    async listPlayers(roomId) {
      return must(await sb.from("players").select().eq("room_id", roomId).order("created_at")) as Player[];
    },

    async getPlayer(id) {
      const { data } = await sb.from("players").select().eq("id", id).maybeSingle();
      return (data as Player) ?? null;
    },

    async addPlayers(rows: NewPlayer[]) {
      return must(await sb.from("players").insert(rows).select()) as Player[];
    },

    async removePlayer(id) {
      must(await sb.from("players").delete().eq("id", id));
    },

    async listAnswers(roomId) {
      // 60 players × 9 questions ≈ 540 rows; well under the default 1000 limit.
      return must(await sb.from("answers").select("room_id,player_id,question,value").eq("room_id", roomId).limit(5000)) as Answer[];
    },

    async listPlayerAnswers(playerId) {
      return must(await sb.from("answers").select("room_id,player_id,question,value").eq("player_id", playerId)) as Answer[];
    },

    async upsertAnswers(rows) {
      const now = new Date().toISOString();
      const { error } = await sb
        .from("answers")
        .upsert(rows.map((r) => ({ ...r, updated_at: now })), { onConflict: "player_id,question" });
      if (error) {
        if (error.code === "23503") throw new PlayerGoneError();
        throw new Error(error.message);
      }
    },

    async deleteAnswers(roomId, questions) {
      must(await sb.from("answers").delete().eq("room_id", roomId).in("question", questions));
    },

    async resetRoom(roomId, next) {
      // Bump epoch first so phones bail out immediately, then clean up.
      must(await sb.from("game_state").update({ ...FRESH, ...next, updated_at: new Date().toISOString() }).eq("room_id", roomId));
      must(await sb.from("answers").delete().eq("room_id", roomId));
      must(await sb.from("players").delete().eq("room_id", roomId));
    },

    subscribe(roomId, h: Handlers) {
      const filter = `room_id=eq.${roomId}`;
      const ch = sb.channel(`room:${roomId}:${Math.random().toString(36).slice(2, 8)}`);
      if (h.onState) {
        ch.on("postgres_changes", { event: "*", schema: "public", table: "game_state", filter }, (p) => {
          if (p.new && "screen" in p.new) h.onState!(p.new as GameState);
        });
      }
      if (h.onPlayer) {
        ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "players", filter }, (p) => {
          h.onPlayer!(p.new as Player);
        });
      }
      if (h.onAnswer) {
        ch.on("postgres_changes", { event: "*", schema: "public", table: "answers", filter }, (p) => {
          if (p.new && "player_id" in p.new) h.onAnswer!(p.new as Answer);
        });
      }
      h.onStatus?.("connecting");
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") h.onStatus?.("live");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") h.onStatus?.("offline");
      });
      return () => {
        void sb.removeChannel(ch);
      };
    },
  };
}
