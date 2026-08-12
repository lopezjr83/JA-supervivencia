/**
 * Prisma Client singleton
 * Previene crear múltiples instancias en desarrollo (HMR)
 */

import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
