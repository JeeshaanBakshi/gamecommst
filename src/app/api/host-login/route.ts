import { NextResponse } from "next/server";
import { checkHostPassword, HOST_COOKIE, hostToken } from "@/lib/hostAuth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };

  if (!checkHostPassword(body.password)) {
    // Slow down guessing a 4-digit code.
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(HOST_COOKIE, await hostToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // stays unlocked for 12 hours on that laptop
  });
  return res;
}
