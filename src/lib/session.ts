import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Current user, re-read from the database once per request. The JWT only proves
 * *who* signed in — role, existence and password changes always come from the DB,
 * so demoting/deleting a user or resetting a password takes effect immediately.
 */
export const getSessionUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatar: true, role: true, passwordChangedAt: true },
  });
  if (!user) return null;

  // Sessions issued before the last password change are no longer valid.
  const authTime = session.authTime ?? 0;
  if (user.passwordChangedAt && user.passwordChangedAt.getTime() > authTime) return null;

  return { id: user.id, name: user.name, email: user.email, image: user.avatar, role: user.role };
});

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    // A JWT that the DB rejects must be cleared first, or the middleware keeps
    // sending the "logged in" cookie away from /login (redirect loop).
    redirect((await auth()) ? "/api/session/expired" : "/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/acesso-negado");
  return user;
}
