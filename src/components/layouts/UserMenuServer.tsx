'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserMenu } from "./UserMenu";

export async function UserMenuServer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return <UserMenu user={session.user} />;
}