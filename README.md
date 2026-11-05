# The Waterloo Effect: How Not to Go Bald

A live audience game for our class presentation. The projector shows a QR code. Everyone joins on their phone with a nickname and an emoji. They answer questions about stress, sleep, food, and doomscrolling, run a pulse + mental-math stress test, and at the end find out who in the room is **closest to bald**.

- **`/host`**: the projector view (16:9, laid out at 1920×1080 and scaled to fit any screen)
- **`/play`**: the phone view (mobile-first, works on iOS Safari)

Built with Next.js (App Router) + TypeScript + Tailwind v4, Supabase (Postgres + Realtime), Framer Motion, `qrcode.react`, and `canvas-confetti`. Sounds are synthesized with the Web Audio API, so there are no audio files.

---

## Quick start (no setup, local rehearsal)

```bash
npm install
npm run dev
```

Open <http://localhost:3000/host>. If Supabase env vars are **not** set, the app runs in **local mode**: data lives in the browser and syncs between tabs. Open `/play?room=CODE` in a few more tabs to play along, or hit **+30 fake** in the host controls to add bots. Real phones can't join in local mode; use Supabase for that.

## Setup with Supabase (real phones)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates the tables, the `server_now()` clock function, row-level-security policies, and adds the tables to Realtime. It's safe to re-run.
3. Copy `.env.example` to `.env.local` and fill it in from **Project Settings → API**:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # or the legacy anon key
   NEXT_PUBLIC_SITE_URL=                                      # optional, see below
   ```

4. `npm run dev` and open `/host`.

**Testing phones against your laptop:** phones can't reach `localhost`. Run `npm run dev -- -H 0.0.0.0`, find your laptop's LAN IP, and set `NEXT_PUBLIC_SITE_URL=http://192.168.x.x:3000` so the QR code points there. Campus Wi-Fi often blocks device-to-device traffic, so deploying to Vercel is the reliable option.

### Database tables

| Table        | What's in it |
|--------------|--------------|
| `rooms`      | One row per game; `code` is the 4-letter join code |
| `game_state` | One row per room, written only by the host: current `screen`, `revealed`, `locked`, `started_at` (for timers), `epoch` (bumped on reset), `rev` (ignores stale updates) |
| `players`    | Nickname, emoji, `is_fake` for demo bots |
| `answers`    | One row per player per question (`unique(player_id, question)`), `value` is JSON |

The anon key can read and write these tables because it's a no-login classroom game. Don't put anything sensitive in them.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com), click **Add New → Project** and import the repo (framework: Next.js, no build settings needed).
3. Add the env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (leave `NEXT_PUBLIC_SITE_URL` empty; the QR code uses the deployed domain).
4. Deploy, then open `https://your-app.vercel.app/host` on the projector laptop.

Or from the CLI: `npx vercel`, then `npx vercel env add ...` and `npx vercel --prod`.

---

## Running the presentation

The host remembers its room, so refreshing `/host` keeps the same code and players. Use **? → Start a brand-new room** for a fresh code.

| Key | Action |
|-----|--------|
| `→` / `Space` / `PageDown` | Next. On a poll or quiz it **reveals** results first; on the math round it **starts the 30s timer**; on the finale it **starts the reveal**. |
| `←` / `PageUp` | Previous screen |
| `R` | Reveal results (also locks answers) |
| `L` | Lock / unlock answers |
| `M` | Mute / unmute host sounds |
| `D` | Toggle demo bots |
| `F` | Fullscreen |
| `?` | Help |

Presentation clickers send PageUp/PageDown, so they work out of the box. Move the mouse to show the control bar (it hides itself after 2.5s); it has a screen-jump dropdown, **+30 fake**, **Bots on/off**, and **Reset room**. Click a player tile in the lobby to remove them.

> **Sound:** browsers block audio until you interact with the page, so click anywhere or press a key on `/host` once before starting.

### Game flow

Every section works the same way: **the speaker's slides → a poll → a quiz.** The slides are part of the game, so while someone is talking every phone shows *"👀 Look up! Jeeshaan is speaking about managing courseload. Pay attention if you don't wanna go bald."*

| # | Speaker | Slides | Then the audience plays |
|---|---------|--------|-------------------------|
| 1 | Gurshaan | What is the Waterloo Effect? · Why stress hits your hair | Stress slider 1–5 → quiz: when does stress shedding start? |
| 2 | Austin | Sleep deprivation · The all-nighter math | Hours of sleep → quiz: how much sleep do adults need? |
| 3 | Jacob | Eating habits · Hair-friendly fuel | Meals skipped → quiz: classic cause of shedding? |
| 4 | Jeeshaan | Managing courseload · STRESS TEST | Study vs doomscroll → pulse #1 → 30s mental math → pulse #2 → before/after BPM + speed leaderboard |
| 5 | Gurshaan | How not to go bald · The prescription | Family history → quiz: #1 cause of permanent hair loss? → **Closest to Bald** finale |

- **Polls** (feed the bald score) stay open until you press → to reveal.
- **Quizzes** get a 15-second countdown, one answer per person, and reveal themselves when time runs out or everyone has answered. The big screen hides the vote counts until then, so nobody copies the crowd. The reveal shows the right answer, % correct and the 3 fastest correct players; each phone shows ✅ or ❌.

**Editing slides:** every speaker's slides live in [`src/lib/slides.ts`](src/lib/slides.ts). Change the text, or add a third slide by adding another `{ title, emoji, bullets }` to that speaker's `slides` list. Polls and quizzes are in [`src/lib/flow.ts`](src/lib/flow.ts) (`Q` and `SCREENS`).

### Bald score

+1 each for: stress ≥ 4 · sleep < 6h · skipping 4+ meals · doomscroll > study · family history = yes · heart rate went up during the test.

| Score | Tier |
|-------|------|
| 0–1 | Full Luscious Locks |
| 2–3 | Slight Breeze Detected |
| 4–5 | Forehead Expansion Pack |
| 6 | Certified Waterloo Graduate |

*Just for fun. Stress causes temporary shedding; genetics is the main cause of permanent hair loss.*

## Rehearsing without an audience

On `/host`, click **+30 fake**. Thirty bots join and **Bots on** switches on automatically. Bots answer every question, measure "pulses", and race through the math round on realistic delays. They write through the real backend, so you're testing the live sync too. Click **Reset room** when you're done; it wipes players and answers and sends every phone back to the join screen.

## Reliability notes

- **Phones follow the host** over Supabase Realtime, with a polling fallback (every 3s if the socket drops, every 12s otherwise) and an immediate re-sync when a phone wakes up or comes back online, which helps with iOS killing background sockets.
- **Reconnects:** the phone stores its player id in `localStorage`. Refreshing or closing and reopening the tab resumes as the same player with the same answers.
- **Late joiners** land on whatever screen is live.
- **Timers** use the database clock (`server_now()`), so phones whose clocks are off still end the math round together.
- **Stale updates:** every host write carries an increasing `rev`, so out-of-order realtime messages can't move a phone backwards.
- **Load:** phones subscribe only to `game_state`; answer events go only to the host. About 60 players stays well inside Supabase's free-tier Realtime limits.

## Project structure

```
src/
  app/                 routes: / (landing), /host, /play
  components/
    host/              Stage (16:9 scaler), TopBar, HostControls, BarChart, screens/*
    play/              Join, Waiting, Answering (scantron buttons + slider), PulseTask, MathTask, ResultCard
    BaldHead.tsx       SVG head whose hairline recedes with the score
    ui.tsx             Buttons, stickers, red-pen circle, caution tape, cards
  hooks/
    useHostGame.ts     host state, realtime, navigation actions
    usePlayerGame.ts   phone join / resume / follow host / submit
    useDemoBots.ts     fake players answering in rehearsal mode
  lib/
    flow.ts            the screens + questions (edit content here)
    scoring.ts         stats, captions, bald score, tiers, leaderboards
    backend/           Supabase implementation + local (BroadcastChannel) implementation
    sound.ts           Web Audio sound effects
supabase/schema.sql    database schema, policies, realtime
```
# game-
