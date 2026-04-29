import { redirect } from "next/navigation";

import { getCurrentUser, type CurrentUser } from "./session";

export class AuthError extends Error {
  constructor(message: string, public code: "UNAUTHORIZED" | "FORBIDDEN") {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireAuth(): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }
  return currentUser;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const currentUser = await requireAuth();
  if (currentUser.role !== "admin") {
    redirect("/unauthorized");
  }
  return currentUser;
}

export async function requireWarga(): Promise<CurrentUser> {
  const currentUser = await requireAuth();
  if (currentUser.role !== "user") {
    redirect("/unauthorized");
  }
  if (!currentUser.wargaId) {
    redirect("/unauthorized");
  }
  return currentUser;
}
