import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "node:path"
import { pathToFileURL } from "node:url"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient() {
  const dbPath = path.resolve("prisma/dev.db")
  const fileUrl = pathToFileURL(dbPath).href
  const adapter = new PrismaBetterSqlite3({ url: fileUrl })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
