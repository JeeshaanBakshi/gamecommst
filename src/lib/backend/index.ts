import { createLocalBackend } from "./local";
import { createSupabaseBackend } from "./supabase";
import type { Backend } from "./types";

export * from "./types";

let instance: Backend | null = null;

export function getBackend(): Backend {
  if (!instance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    instance = url && key ? createSupabaseBackend(url, key) : createLocalBackend();
  }
  return instance;
}
