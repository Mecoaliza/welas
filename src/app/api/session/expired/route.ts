import { NextResponse } from "next/server";

import { auth, signOut } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

/**
 * Landing spot for a cookie that is still a valid JWT but no longer valid in the DB
 * (password changed, user deleted). Server Components can't clear cookies, and the
 * middleware would bounce a "logged in" cookie away from /login, so clear it here.
 * Only signs out when the session really is stale, so a cross-site GET can't log
 * out a healthy session.
 */
export async function GET(request: Request) {
  const loginUrl = new URL("/login?expired=1", request.url);
  if ((await auth()) && !(await getSessionUser())) {
    await signOut({ redirect: false });
  }
  return NextResponse.redirect(loginUrl);
}
