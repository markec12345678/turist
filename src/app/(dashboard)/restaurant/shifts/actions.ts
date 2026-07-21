"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getOpenShift(userId: string) {
  return prisma.shift.findFirst({
    where: { userId, status: "OPEN" },
    include: { cashRegister: true },
  })
}

export async function openShift(data: { cashRegisterId: string; userId: string; openingBalance: number }) {
  const existing = await prisma.shift.findFirst({ where: { userId: data.userId, status: "OPEN" } })
  if (existing) throw new Error("Že imaš odprto izmeno")

  return prisma.shift.create({
    data: {
      openingBalance: data.openingBalance, cashRegisterId: data.cashRegisterId, userId: data.userId, status: "OPEN",
    },
    include: { cashRegister: true },
  })
}

export async function getShiftSummary(shiftId: string) {
  const shift = await prisma.shift.findUnique({ where: { id: shiftId }, include: { cashRegister: true, user: true } })
  if (!shift) throw new Error("Izmena ne obstaja")

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: shift.openedAt, ...(shift.closedAt ? { lte: shift.closedAt } : {}) }, status: "CLOSED" },
    include: { payments: true, items: { include: { menuItem: true } } },
  })

  const payments = orders.flatMap(o => o.payments)
  const cashSales = payments.filter(p => p.method === "CASH" && !p.isRefund).reduce((s, p) => s + Number(p.amount), 0)
  const cardSales = payments.filter(p => p.method === "CARD" && !p.isRefund).reduce((s, p) => s + Number(p.amount), 0)
  const transferSales = payments.filter(p => p.method === "TRANSFER" && !p.isRefund).reduce((s, p) => s + Number(p.amount), 0)
  const refunds = payments.filter(p => p.isRefund).reduce((s, p) => s + Number(p.amount), 0)
  const tips = (await prisma.tip.findMany({ where: { createdAt: { gte: shift.openedAt } } })).reduce((s, t) => s + Number(t.amount), 0)

  const totalSales = cashSales + cardSales + transferSales
  const orderCount = orders.length

  const itemSales: Record<string, { name: string; qty: number; total: number }> = {}
  for (const order of orders) {
    for (const item of order.items) {
      if (item.status === "VOIDED") continue
      const key = item.menuItemId
      if (!itemSales[key]) itemSales[key] = { name: (item.menuItem as any).name, qty: 0, total: 0 }
      itemSales[key].qty += item.quantity
      itemSales[key].total += Number(item.unitPrice) * item.quantity
    }
  }

  return {
    shift, cashSales, cardSales, transferSales, totalSales, orderCount, tips, refunds,
    topItems: Object.values(itemSales).sort((a, b) => b.total - a.total).slice(0, 10),
    orders,
  }
}

export async function closeShift(shiftId: string, closingBalance: number) {
  const summary = await getShiftSummary(shiftId)
  const expectedCash = Number(summary.shift.openingBalance) + summary.cashSales - summary.refunds
  const discrepancy = closingBalance - expectedCash

  return prisma.shift.update({
    where: { id: shiftId },
    data: {
      status: "CLOSED", closedAt: new Date(), closingBalance,
      cashSales: summary.cashSales, cardSales: summary.cardSales,
      discrepancy,
    },
    include: { cashRegister: true },
  })
}

export async function getCashRegisters(propertyId?: string) {
  return prisma.cashRegister.findMany({ where: propertyId ? { propertyId } : {}, orderBy: { name: "asc" } })
}
