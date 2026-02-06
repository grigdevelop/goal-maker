import { PrismaClient } from "@/../generated/prisma/client";
import { PrismaLibSql } from '@prisma/adapter-libsql';

// const adapter = new PrismaBetterSqlite3({
//   url: process.env.DATABASE_URL!
// });

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma || new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;