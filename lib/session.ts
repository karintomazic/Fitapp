import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "fitapp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // one year, in seconds

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

// The cookie holds a hash of APP_PASSWORD, so changing the password logs
// out every device. Returns null when no password is configured.
export function sessionToken() {
  const password = process.env.APP_PASSWORD;
  if (!password) return null;
  return sha256(`fitapp-session:${password}`);
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export function isValidSession(cookieValue: string | undefined) {
  const expected = sessionToken();
  if (!expected || !cookieValue) return false;
  return safeEqual(cookieValue, expected);
}

export function isCorrectPassword(password: string) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  // hash both so they have the same length for timingSafeEqual
  return safeEqual(sha256(password), sha256(expected));
}

// for server actions: stop if the request isn't logged in
export async function requireSession() {
  const cookieStore = await cookies();
  if (!isValidSession(cookieStore.get(SESSION_COOKIE)?.value)) {
    throw new Error("Not logged in");
  }
}
