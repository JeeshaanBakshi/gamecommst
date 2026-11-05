"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getBackend } from "@/lib/backend";
import { serverNow, syncClock } from "@/lib/clock";
import { fakePlayers } from "@/lib/demo";
import { isRevealable, MATH_DURATION_MS, SCREENS } from "@/lib/flow";
import { indexAnswers, type Answer, type AnswerIndex, type ConnStatus, type GameState, type Player, type Room } from "@/lib/types";
import { roomCode } from "@/lib/uid";

const HOST_ROOM_KEY = "wle-host-room";

interface Events {
  onJoin?: (p: Player) => void;
  onAnswer?: (a: Answer) => void;
}

export function useHostGame(events: Events = {}) {
  const backend = getBackend();
  const [room, setRoom] = useState<Room | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [answers, setAnswers] = useState<AnswerIndex>({});
  const [status, setStatus] = useState<ConnStatus>("connecting");
  const [error, setError] = useState<string | null>(null);

  const stateRef = useRef<GameState | null>(null);
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  });

  const applyState = useCallback((s: GameState) => {
    const cur = stateRef.current;
    // Ignore stale echoes of our own earlier writes.
    if (cur && s.rev < cur.rev) return;
    stateRef.current = s;
    setState(s);
  }, []);

  const refresh = useCallback(
    async (roomId: string) => {
      const [s, ps, as] = await Promise.all([
        backend.getState(roomId),
        backend.listPlayers(roomId),
        backend.listAnswers(roomId),
      ]);
      if (s) applyState(s);
      setPlayers(ps);
      setAnswers(indexAnswers(as));
    },
    [backend, applyState],
  );

  /* ---- pick or create the room ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await syncClock(() => backend.serverTime());
      const params = new URLSearchParams(window.location.search);
      const wanted = (params.get("room") || localStorage.getItem(HOST_ROOM_KEY) || "").toUpperCase();
      let r = wanted ? await backend.getRoomByCode(wanted) : null;
      if (!r) {
        for (let i = 0; i < 5 && !r; i++) {
          try {
            r = (await backend.createRoom(roomCode())).room;
          } catch (e) {
            if (i === 4) throw e;
          }
        }
      }
      if (cancelled || !r) return;
      localStorage.setItem(HOST_ROOM_KEY, r.code);
      setRoom(r);
    })().catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, [backend]);

  /* ---- live sync + safety-net polling ---- */
  useEffect(() => {
    if (!room) return;
    // refresh() only sets state after awaiting the network, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh(room.id).catch(() => {});
    const unsub = backend.subscribe(room.id, {
      onState: applyState,
      onPlayer: (p) => {
        setPlayers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
        eventsRef.current.onJoin?.(p);
      },
      onAnswer: (a) => {
        setAnswers((prev) => ({ ...prev, [a.question]: { ...prev[a.question], [a.player_id]: a.value } }));
        eventsRef.current.onAnswer?.(a);
      },
      onStatus: (s) => {
        setStatus(s);
        if (s === "live") void refresh(room.id).catch(() => {});
      },
    });
    const poll = setInterval(() => void refresh(room.id).catch(() => {}), 8000);
    return () => {
      unsub();
      clearInterval(poll);
    };
  }, [room, backend, refresh, applyState]);

  /* ---- host writes ---- */
  const write = useCallback(
    (patch: Partial<GameState>) => {
      const cur = stateRef.current;
      if (!cur || !room) return;
      const next = { ...cur, ...patch, rev: cur.rev + 1 };
      stateRef.current = next;
      setState(next);
      const { screen, revealed, locked, started_at, epoch, rev } = next;
      void backend.updateState(room.id, { screen, revealed, locked, started_at, epoch, rev }).catch((e) => setError(String(e)));
    },
    [backend, room],
  );

  const goTo = useCallback(
    (i: number) => {
      const screen = Math.max(0, Math.min(SCREENS.length - 1, i));
      if (screen === stateRef.current?.screen) return;
      write({ screen, revealed: false, locked: false, started_at: null });
    },
    [write],
  );

  const start = useCallback(() => write({ started_at: new Date(serverNow()).toISOString(), locked: false }), [write]);

  const next = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const scr = SCREENS[s.screen];
    if (isRevealable(scr) && !s.revealed) return write({ revealed: true, locked: true });
    if (scr.type === "math") {
      if (!s.started_at) return start();
      if (serverNow() - Date.parse(s.started_at) < MATH_DURATION_MS) return; // let the clock run
    }
    if (scr.type === "finale" && !s.started_at) return start();
    goTo(s.screen + 1);
  }, [write, start, goTo]);

  const prev = useCallback(() => {
    const s = stateRef.current;
    if (s) goTo(s.screen - 1);
  }, [goTo]);

  const reveal = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const scr = SCREENS[s.screen];
    if (isRevealable(scr)) write({ revealed: !s.revealed, locked: !s.revealed ? true : s.locked });
    else if ((scr.type === "finale" || scr.type === "math") && !s.started_at) start();
  }, [write, start]);

  const toggleLock = useCallback(() => {
    const s = stateRef.current;
    if (s) write({ locked: !s.locked });
  }, [write]);

  const reset = useCallback(async () => {
    const s = stateRef.current;
    if (!s || !room) return;
    const nextFields = { epoch: s.epoch + 1, rev: s.rev + 1 };
    const fresh = { ...s, screen: 0, revealed: false, locked: false, started_at: null, ...nextFields };
    stateRef.current = fresh;
    setState(fresh);
    setPlayers([]);
    setAnswers({});
    await backend.resetRoom(room.id, nextFields);
    await refresh(room.id);
  }, [backend, room, refresh]);

  const newRoom = useCallback(() => {
    localStorage.removeItem(HOST_ROOM_KEY);
    // Full reload on purpose: drops every subscription and in-memory state.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/host";
  }, []);

  const kick = useCallback(
    async (id: string) => {
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      await backend.removePlayer(id);
    },
    [backend],
  );

  const playersRef = useRef<Player[]>([]);
  useEffect(() => {
    playersRef.current = players;
  });

  const seedFakes = useCallback(async () => {
    const s = stateRef.current;
    if (!room || !s) return;
    const taken = playersRef.current.map((p) => p.nickname);
    const created = await backend.addPlayers(fakePlayers(room.id, s.epoch, taken));
    setPlayers((prev) => [...prev, ...created.filter((c) => !prev.some((p) => p.id === c.id))]);
  }, [backend, room]);

  return {
    backend,
    room,
    state,
    players,
    answers,
    status,
    error,
    actions: { next, prev, goTo, reveal, toggleLock, reset, newRoom, kick, seedFakes },
  };
}

export type HostGame = ReturnType<typeof useHostGame>;
