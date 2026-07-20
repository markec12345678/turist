"use server"

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export interface AuditEvent {
  userId?: string
  action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE"
  entity: string
  entityId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function logAudit(event: AuditEvent) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: event.userId,
        action: event.action,
        entity: event.entity,
        entityId: event.entityId,
        oldValues: (event.oldValues as Prisma.InputJsonValue) || undefined,
        newValues: (event.newValues as Prisma.InputJsonValue) || undefined,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      },
    })
  } catch (error) {
    console.error("Audit log error:", error)
  }
}

export async function getAuditLogs(params?: {
  userId?: string
  entity?: string
  limit?: number
  offset?: number
}) {
  const limit = params?.limit || 50
  const offset = params?.offset || 0

  const where: Record<string, unknown> = {}
  if (params?.userId) where.userId = params.userId
  if (params?.entity) where.entity = params.entity

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total }
}
