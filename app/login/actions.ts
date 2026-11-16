"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  isCorrectPassword,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionToken,
} from "@/lib/session";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const token = sessionToken();

  if (!token) {
    redirect("/login?error=setup");
  }
  if (!isCorrectPassword(password)) {
    redirect("/login?error=wrong");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from JavaScript
    secure: process.env.NODE_ENV === "production", // https only when deployed
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
