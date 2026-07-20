import path from "node:path"
import type { PrismaConfig } from "prisma/config"

export default {
  schema: path.join(__dirname, "prisma", "schema.prisma"),
} satisfies PrismaConfig
