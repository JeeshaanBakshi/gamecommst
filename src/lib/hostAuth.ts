/** Server-only helpers for the host (projector) password lock. */

export const HOST_COOKIE = "wle_host";

/** Set HOST_PASSWORD in Vercel to change it; defaults to 1234. */
function hostPassword() {
  return process.env.HOST_PASSWORD || "1234";
}

export function checkHostPassword(input: unknown) {
  return typeof input === "string" && input === hostPassword();
}

/** Cookie value proving the password was entered (changes if the password changes). */
export async function hostToken() {
  const data = new TextEncoder().encode(`wle-host-v1:${hostPassword()}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
