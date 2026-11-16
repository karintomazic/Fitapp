import { NextResponse, type NextRequest } from "next/server";
import { isValidSession, SESSION_COOKIE } from "@/lib/session";

// every page needs the login cookie, otherwise go to /login
export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (!isValidSession(cookie)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // skip the login page, the Apple Watch sync (it has its own token),
  // Next.js files and the icons/manifest the phone needs for the home screen
  matcher: [
    "/((?!login|api/sync-health|_next/static|_next/image|favicon.ico|icon.svg|manifest.json|apple-touch-icon.png|icon-192.png|icon-512.png).*)",
  ],
};
