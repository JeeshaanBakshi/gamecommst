import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-grid flex min-h-[100dvh] flex-col items-center justify-center gap-10 px-6 py-12 text-center">
      <div>
        <div className="font-mono text-sm font-bold uppercase tracking-[0.3em]">Live from exam season</div>
        <h1 className="mt-3 text-6xl font-extrabold leading-[0.9] tracking-tight sm:text-8xl">
          The Waterloo Effect<span className="text-pen">.</span>
        </h1>
        <p className="mt-4 font-marker text-3xl text-pen sm:text-4xl">How Not to Go Bald</p>
      </div>
      <div className="flex w-full max-w-md flex-col gap-4 sm:max-w-xl sm:flex-row">
        <Link href="/play" className="flex-1 rounded-2xl border-[3px] border-ink bg-ink px-6 py-5 text-2xl font-extrabold text-gold shadow-hard transition-transform active:scale-95">
          📱 Join a game
        </Link>
        <Link href="/host" className="flex-1 rounded-2xl border-[3px] border-ink bg-paper px-6 py-5 text-2xl font-extrabold shadow-hard transition-transform active:scale-95">
          🖥️ Host on projector
        </Link>
      </div>
    </main>
  );
}
