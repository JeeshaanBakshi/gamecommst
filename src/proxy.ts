import { NextResponse, type NextRequest } from "next/server";
import { HOST_COOKIE, hostToken } from "@/lib/hostAuth";

/** Only the presenter gets into /host: no valid cookie → password page. */
export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get(HOST_COOKIE)?.value;
  if (cookie && cookie === (await hostToken())) return NextResponse.next();

  const login = new URL("/host/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/host"],
};
