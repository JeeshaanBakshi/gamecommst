/** True when running on a laptop (localhost / LAN), false on the deployed site. */
export function isLocalMachine() {
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".local") || /^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(h);
}

/**
 * Public address phones should open (used in every QR code).
 * Vercel's long per-deployment URLs sit behind a Vercel login, so on Vercel we always
 * point phones at the project's public production domain, whatever URL the host is on.
 */
export function publicSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const production = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  const base = explicit || (production ? `https://${production}` : window.location.origin);
  return base.replace(/\/$/, "");
}

export const SUPABASE_SETUP_HINT =
  "In Vercel: Settings → Environment Variables → add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then Deployments → Redeploy.";
