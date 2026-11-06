# The Waterloo Effect: How Not to Go Bald

A live audience game for our class presentation. The projector shows a QR code, everyone joins on their phone with a nickname and an emoji, and the presentation runs inside the game: each speaker presents their slides, then the room answers a quick poll and a quiz. At the end, the game reveals who in the room is **closest to bald**.

- **`/host`**: the projector view (laid out at 1920×1080 and scaled to fit any screen)
- **`/play`**: the phone view (works on iOS Safari and Android)

Built with Next.js (App Router), TypeScript, Tailwind, Supabase (Postgres + Realtime), Framer Motion, `qrcode.react` and `canvas-confetti`.

---

## The presentation

It opens with a wall of everyone's bald WatCards. After that, each section works the same way: **the speaker's slides → a poll → a quiz.** While someone is presenting, every phone shows **that speaker's photo** with *"Pay attention if you don't wanna go bald."*

| # | Speaker | Slides (from each person's script) | Then the audience answers |
|---|---------|--------|---------------------------|
| 1 | Gurshaan | Bald WatCard collage · What is the Waterloo Effect? · Why it hits home | How stressed are you? (1–5) → Quiz: which midterm sent the viral "you matter more than your grades" email? |
| 2 | Austin | You studied all night, so where did it go? · No sleep → cortisol → hair · The fix | Hours of sleep → Quiz: how much sleep do adults need? |
| 3 | Jacob | Stress eating · 400 mg · Iron, protein, zinc, vitamin D · Cheap student fixes · Recap | Meals skipped per week → Quiz: Health Canada's daily caffeine limit? |
| 4 | Jeeshaan | My "perfect" day · Stress that never clocks out → **Quiz:** the stress hormone → **Poll:** study vs doomscroll → Plan it. Block it. Banish it. | (games are inside the talk) |
| 5 | Emmanuel | SH\*\*\*WER · Hair care 101 · Massage, LeBron, and your parents | Baldness in the family? → Quiz: #1 cause of permanent hair loss? → **Closest to Bald** finale |

Every answer is a single tap.

- **Polls** stay open until the presenter reveals the results.
- **Quizzes** give everyone 20 seconds and one answer each. They reveal themselves when time is up or everyone has answered, then show the right answer, % correct and the 3 fastest correct players. Each phone shows ✅ or ❌.

### Editing the content

- **Slides:** [`src/lib/slides.ts`](src/lib/slides.ts). Change any text, or add a third slide by adding another `{ title, emoji, bullets }` to a speaker's `slides` list.
- **Speaker photos (shown on phones):** `SPEAKER_PHOTOS` in the same file. To add one, put the image in `public/speakers/` (for example `public/speakers/jeeshaan.jpg`) and set `Jeeshaan: "/speakers/jeeshaan.jpg"`. Anyone without a photo gets a microphone instead.
- **Bald wall:** the images are in `public/bald/` and the list is `BALD_WALL` in `slides.ts`.
- **Polls and quizzes:** `Q` in [`src/lib/flow.ts`](src/lib/flow.ts). The screen order is `SCREENS` in the same file.

### Bald score (the finale)

+1 each for: stress 4 or 5 · under 6h of sleep · skipping 4+ meals a week · doomscrolling more than studying · baldness in the family.

| Score | Tier |
|-------|------|
| 0–1 | Full Luscious Locks |
| 2–3 | Slight Breeze Detected |
| 4 | Forehead Expansion Pack |
| 5 | Certified Waterloo Graduate |

The finale counts down the top 8 from #8 to #1 with a drumroll and cartoon hairlines that recede by score. Then each phone shows that person's own result card.

*Just for fun. Stress causes temporary shedding; genetics is the main cause of permanent hair loss.*

---

## Setup

### 1. Supabase (needed for real phones)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates the tables, the server clock function, access policies, and turns on Realtime. It's safe to run again.
3. From **Project Settings → API**, copy the project URL and the publishable (or anon) key.

### 2. Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the two Supabase values
npm run dev
```

Open <http://localhost:3000/host>. Without Supabase values the app still runs in **local mode**, where only other tabs in the same browser can join. That's handy for checking slides, but real phones need Supabase.

### 3. Deploy to Vercel

1. On [vercel.com](https://vercel.com), click **Add New → Project** and import this GitHub repo.
2. Add the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Deploy, then open `https://<your-app>.vercel.app/host` on the projector laptop. The QR code automatically points phones at the deployed site.

> **Added or changed the environment variables after deploying?** Vercel only reads them when it builds, so go to **Deployments → ⋯ → Redeploy**. If they're missing, the lobby shows a red "NOT CONNECTED TO SUPABASE" warning and phones show "Game not connected yet".

Free-tier notes: Supabase pauses projects after about a week with no activity. Open the Supabase dashboard the day before you present to make sure it's awake. Everything else easily fits within the free tiers for a class of 60.

---

## On presentation day

1. Open `/host` on the projector laptop and enter the presenter password: **1234**. (Change it by adding a `HOST_PASSWORD` environment variable in Vercel, then redeploy.) The laptop stays unlocked for 12 hours. Press **F** for fullscreen.
2. **Click once anywhere on the page** so the browser allows sound.
3. Leave the lobby up while people scan the QR code. Click a player's tile to remove an inappropriate name.
4. Press **→** to move through the slides and games.

| Key | Action |
|-----|--------|
| `→` / `Space` / `PageDown` | Next. On a poll or quiz it reveals the results first; on the finale it starts the reveal. |
| `←` / `PageUp` | Previous screen |
| `R` | Reveal results |
| `L` | Lock / unlock answers |
| `M` | Mute / unmute sounds |
| `F` | Fullscreen |
| `H` | Hide / show the control bar |

Presentation clickers send PageUp/PageDown, so they work out of the box. The control bar sits in its own strip **below** the slide, so it never covers any text or images. Press **H** to hide or show it (the slide still fits either way). It has the same buttons, a dropdown to jump to any screen, and **Reset room**, which removes all players and answers and sends every phone back to the join screen. Use it after a practice run.

The host remembers its room, so refreshing `/host` keeps the same code and players. Phones that refresh or briefly lose Wi-Fi rejoin as the same player automatically, and people who join late land on the current screen.

## Troubleshooting

| You see | Fix |
|---------|-----|
| **"Could not find the table 'public.rooms' in the schema cache"** | The database tables don't exist yet. Supabase → **SQL Editor → New query** → paste *all* of `supabase/schema.sql` → **Run** → refresh `/host`. Safe to run again if you already did. |
| Red **"NOT CONNECTED TO SUPABASE"** in the lobby / phones say "Game not connected yet" | Add the two `NEXT_PUBLIC_SUPABASE_*` variables in Vercel → Settings → Environment Variables, then **Deployments → Redeploy**. |
| Phones can't load the site | The QR points at the address the host page is open on. Open `/host` from your Vercel URL, not `localhost`. |
| Supabase project "paused" | Free projects pause after about a week with no activity. Open the Supabase dashboard and click **Restore**. Do this the day before you present. |

Every slide has a small **scan to join** QR in the top-right corner, so people who arrive late can still join.

## Project structure

```
src/
  app/                 routes: / (landing), /host, /play
  components/
    host/              Stage (16:9 scaler), TopBar, HostControls, BarChart, screens/
    play/              Join, SpeakerScreen, Answering, QuizQuestion, ResultCard
    BaldHead.tsx       cartoon head whose hairline recedes with the score
  hooks/               useHostGame (projector), usePlayerGame (phones)
  lib/
    slides.ts          speaker slides  ← edit your slides here
    flow.ts            polls, quizzes and screen order
    scoring.ts         stats, captions, bald score, tiers
    backend/           Supabase + local (same-browser) implementations
supabase/schema.sql    database schema
```
