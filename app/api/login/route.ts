import { NextResponse } from "next/server";
import { ADMIN_COOKIE, expectedAdminToken } from "@/lib/auth";

export async function POST(request: Request) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET;

  if (!configuredPassword || !secret) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD ve ADMIN_SECRET ayarlanmamış." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as { password?: string };

  if (!body.password || body.password !== configuredPassword) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  const token = await expectedAdminToken();

  if (!token) {
    return NextResponse.json({ error: "Oturum oluşturulamadı." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
