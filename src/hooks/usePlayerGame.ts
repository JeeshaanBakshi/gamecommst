"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getBackend, PlayerGoneError } from "@/lib/backend";
import { syncClock } from "@/lib/clock";
import type { AnswerValue, ConnStatus, GameState, Player, QuestionKey, Room } from "@/lib/types";

const SESSION_KEY = "wle-player-session";

interface Session {
  roomCode: string;
  playerId: string;
  epoch: number;
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export type Phase = "loading" | "enterCode" | "join" | "playing";

export function usePlayerGame() {
  const backend = getBackend();
  const [phase, setPhase] = useState<Phase>("loading");
  const [code, setCode] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [mine, setMine] = useState<Partial<Record<QuestionKey, AnswerValue>>>({});
  const [status, setStatus] = useState<ConnStatus>("connecting");
  const [notice, setNotice] = useState<string | null>(null);

  const playerRef = useRef<Player | null>(null);
  const stateRef = useRef<GameState | null>(null);

  const kickToJoin = useCallback((msg: string) => {
    writeSession(null);
    playerRef.current = null;
    setPlayer(null);
    setMine({});
    setNotice(msg);
    setPhase("join");
  }, []);

  const applyState = useCallback(
    (s: GameState) => {
      const cur = stateRef.current;
      if (cur && s.epoch === cur.epoch && s.rev < cur.rev) return;
      stateRef.current = s;
      setState(s);
      const p = playerRef.current;
      if (p && s.epoch !== p.epoch) kickToJoin("The host reset the room. Jump back in!");
    },
    [kickToJoin],
  );

  /* ---- figure out which room ---- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("room")?.toUpperCase() || null;
    const c = fromUrl ?? readSession()?.roomCode ?? null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once on mount
    if (c) setCode(c);
    else setPhase("enterCode");
  }, []);

  /* ---- load room + resume session ---- */
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    (async () => {
      setPhase("loading");
      void syncClock(() => backend.serverTime());
      const r = await backend.getRoomByCode(code);
      if (cancelled) return;
      if (!r) {
        setNotice(`No room called "${code}". Check the code on the big screen.`);
        setPhase("enterCode");
        return;
      }
      const s = await backend.getState(r.id);
      if (cancelled) return;
      setRoom(r);
      if (s) {
        stateRef.current = s;
        setState(s);
      }
      const sess = readSession();
      if (sess && sess.roomCode === r.code && s && sess.epoch === s.epoch) {
        const p = await backend.getPlayer(sess.playerId);
        if (p && p.room_id === r.id) {
          const as = await backend.listPlayerAnswers(p.id);
          if (cancelled) return;
          playerRef.current = p;
          setPlayer(p);
          setMine(Object.fromEntries(as.map((a) => [a.question, a.value])));
          setPhase("playing");
          return;
        }
      }
      writeSession(null);
      setPhase("join");
    })().catch(() => {
      if (!cancelled) {
        setNotice("Couldn't reach the game. Check your connection and try again.");
        setPhase("enterCode");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [code, backend]);

  /* ---- follow the host ---- */
  useEffect(() => {
    if (!room) return;
    let live = false;
    const pull = () =>
      void backend
        .getState(room.id)
        .then((s) => s && applyState(s))
        .catch(() => {});
    const unsub = backend.subscribe(room.id, {
      onState: applyState,
      onStatus: (s) => {
        live = s === "live";
        setStatus(s);
        if (live) pull();
      },
    });
    // Safety net for flaky lecture-hall Wi-Fi / iOS killing sockets in the background.
    let ticks = 0;
    const poll = setInterval(() => {
      ticks++;
      if (!live || ticks % 4 === 0) pull();
    }, 3000);
    const onVis = () => document.visibilityState === "visible" && pull();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("online", pull);
    window.addEventListener("pageshow", pull);
    return () => {
      unsub();
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("online", pull);
      window.removeEventListener("pageshow", pull);
    };
  }, [room, backend, applyState]);

  const join = useCallback(
    async (nickname: string, emoji: string) => {
      if (!room) return;
      const s = stateRef.current ?? (await backend.getState(room.id));
      const epoch = s?.epoch ?? 0;
      const [p] = await backend.addPlayers([{ room_id: room.id, nickname, emoji, is_fake: false, epoch }]);
      writeSession({ roomCode: room.code, playerId: p.id, epoch });
      playerRef.current = p;
      setPlayer(p);
      setMine({});
      setNotice(null);
      setPhase("playing");
    },
    [backend, room],
  );

  const answer = useCallback(
    async (question: QuestionKey, value: AnswerValue) => {
      const p = playerRef.current;
      if (!p || !room) return;
      setMine((m) => ({ ...m, [question]: value }));
      try {
        await backend.upsertAnswers([{ room_id: room.id, player_id: p.id, question, value }]);
      } catch (e) {
        if (e instanceof PlayerGoneError) kickToJoin("You were removed from the room. Rejoin to keep playing.");
        else {
          // one retry for flaky Wi-Fi
          await new Promise((r) => setTimeout(r, 800));
          await backend.upsertAnswers([{ room_id: room.id, player_id: p.id, question, value }]).catch(() => {});
        }
      }
    },
    [backend, room, kickToJoin],
  );

  const enterCode = useCallback((c: string) => {
    setNotice(null);
    setCode(c.trim().toUpperCase());
  }, []);

  return { backend, phase, room, state, player, mine, status, notice, join, answer, enterCode };
}

export type PlayerGame = ReturnType<typeof usePlayerGame>;
