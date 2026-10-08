import { cookies } from "next/headers";

export const ADMIN_COOKIE = "dekan_admin_session";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedAdminToken() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SECRET ?? "";

  if (!password || !secret) {
    return null;
  }

  return sha256(`${password}:${secret}`);
}

export async function isAdmin() {
  const expected = await expectedAdminToken();
  if (!expected) return false;

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === expected;
}
