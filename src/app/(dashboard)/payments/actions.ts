"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPayments(filters?: { method?: string }) {
  return prisma.payment.findMany({
    where: filters?.method ? { method: filters.method as never } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function createPayment(data: { amount: number; method: string; guestId?: string; folioId?: string; orderId?: string; reservationId?: string; notes?: string }) {
  const payment = await prisma.payment.create({ data: { ...data, status: "PAID", method: data.method as never } })
  if (data.folioId) {
    const folio = await prisma.folio.findUnique({ where: { id: data.folioId }, include: { payments: true } })
    if (folio) {
      const totalPayments = folio.payments.reduce((s: number, p: { amount: unknown }) => s + Number(p.amount), 0) + data.amount
      await prisma.folio.update({ where: { id: data.folioId }, data: { totalPayments, balance: Number(folio.totalCharges) - totalPayments } })
    }
  }
  revalidatePath("/payments")
  return payment
}

export async function getDailyReport(date: string) {
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999)
  const where = { createdAt: { gte: dayStart, lte: dayEnd } }

  const [payments, orders, checkIns, checkOuts] = await Promise.all([
    prisma.payment.findMany({ where }),
    prisma.order.findMany({ where }),
    prisma.reservation.findMany({ where: { checkedInAt: where.createdAt } }),
    prisma.reservation.findMany({ where: { checkedOutAt: where.createdAt } }),
  ])

  const totalByMethod: Record<string, number> = {}
  payments.forEach((p: { method: string; amount: unknown }) => { totalByMethod[p.method] = (totalByMethod[p.method] || 0) + Number(p.amount) })

  return { totalByMethod, totalOrders: orders.length, totalPayments: payments.length, checkIns: checkIns.length, checkOuts: checkOuts.length }
}

export async function getShifts(filters?: { status?: string }) {
  return prisma.shift.findMany({ where: filters?.status ? { status: filters.status as never } : {}, include: { user: true, cashRegister: true }, orderBy: { openedAt: "desc" }, take: 50 })
}

export async function createShift(data: { openingBalance: number; cashRegisterId: string; userId: string }) {
  const shift = await prisma.shift.create({ data: { ...data, status: "OPEN" } })
  revalidatePath("/shifts")
  return shift
}
