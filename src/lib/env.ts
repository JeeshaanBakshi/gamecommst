/** True when running on a laptop (localhost / LAN), false on the deployed site. */
export function isLocalMachine() {
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".local") || /^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(h);
}

export const SUPABASE_SETUP_HINT =
  "In Vercel: Settings → Environment Variables → add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then Deployments → Redeploy.";
