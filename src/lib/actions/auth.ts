// src/lib/actions/auth.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Logout failed:", error);
    throw new Error("Failed to sign out");
  }
  
  redirect("/login");
}