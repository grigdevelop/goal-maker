import { PrismaClient } from "@/../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from '@prisma/adapter-libsql';
import type { SqlDriverAdapterFactory } from "@prisma/client/runtime/client";

function resolveAdapter(): SqlDriverAdapterFactory {
  console.log('Resolving adapter... Current environment:', process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    const adapter = new PrismaBetterSqlite3({
      url: process.env.LOCAL_DATABASE_URL!
    });
    return adapter;
  }

  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return adapter;
}

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = resolveAdapter();
const prisma =
  globalForPrisma.prisma || new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;