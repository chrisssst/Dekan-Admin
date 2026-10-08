import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "dekan_admin_session";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/dekan.png"
  ) {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SECRET ?? "";

  if (!password || !secret) {
    return NextResponse.redirect(new URL("/login?setup=1", request.url));
  }

  const expected = await sha256(`${password}:${secret}`);
  const actual = request.cookies.get(ADMIN_COOKIE)?.value;

  if (actual !== expected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/logout).*)"]
};
