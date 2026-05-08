import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { resolve } from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function makeDbUrl(raw: string): string {
  if (raw.startsWith("file:./") || raw.startsWith("file:../")) {
    return "file:" + resolve(process.cwd(), raw.slice(5));
  }
  return raw;
}

function createPrisma() {
  const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const url = makeDbUrl(rawUrl);
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
