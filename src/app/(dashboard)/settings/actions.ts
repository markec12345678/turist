"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"

export async function getUsers() { return prisma.user.findMany({ orderBy: { createdAt: "desc" } }) }
export async function getUser(id: string) { return prisma.user.findUnique({ where: { id } }) }

export async function createUser(data: { name: string; email: string; password: string; role: string }) {
  const user = await prisma.user.create({ data: { ...data, passwordHash: await hash(data.password, 10), companyId: "demo-company", role: data.role as never } })
  revalidatePath("/settings/users")
  return user
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  if (data.password) { data.passwordHash = await hash(data.password as string, 10); delete data.password }
  const user = await prisma.user.update({ where: { id }, data })
  revalidatePath("/settings/users")
  return user
}

export async function updateCompany(id: string, data: Record<string, unknown>) {
  const company = await prisma.company.update({ where: { id }, data })
  revalidatePath("/settings/company")
  return company
}

export async function getAuditLogs(filters?: { entity?: string }) {
  return prisma.auditLog.findMany({ where: filters?.entity ? { entity: filters.entity } : {}, include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 })
}
