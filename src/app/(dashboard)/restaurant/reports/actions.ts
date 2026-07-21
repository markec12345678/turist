"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getDailyReport(date: string, propertyId?: string) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const [orders, payments] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        ...(propertyId ? { propertyId } : {}),
      },
      include: {
        items: { include: { menuItem: true } },
        payments: true,
        table: true,
        user: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.payment.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        ...(propertyId ? { orderId: { not: null } } : {}),
      },
      include: { order: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const cashPayments = payments.filter((p) => p.method === "CASH")
  const cardPayments = payments.filter((p) => p.method === "CARD")
  const transferPayments = payments.filter((p) => p.method === "TRANSFER")

  const cashTotal = cashPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const cardTotal = cardPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const transferTotal = transferPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  const ordersByType = {
    DINE_IN: orders.filter((o) => o.type === "DINE_IN"),
    TAKEAWAY: orders.filter((o) => o.type === "TAKEAWAY"),
    DELIVERY: orders.filter((o) => o.type === "DELIVERY"),
  }

  const ordersByStatus = {
    OPEN: orders.filter((o) => o.status === "OPEN"),
    PREPARING: orders.filter((o) => o.status === "PREPARING"),
    READY: orders.filter((o) => o.status === "READY"),
    SERVED: orders.filter((o) => o.status === "SERVED"),
    CLOSED: orders.filter((o) => o.status === "CLOSED"),
    CANCELLED: orders.filter((o) => o.status === "CANCELLED"),
  }

  const categorySales: Record<string, { name: string; quantity: number; total: number }> = {}
  for (const order of orders) {
    for (const item of order.items) {
      const catName = (item.menuItem as any).category?.name || "Ostalo"
      if (!categorySales[catName]) categorySales[catName] = { name: catName, quantity: 0, total: 0 }
      categorySales[catName].quantity += item.quantity
      categorySales[catName].total += Number(item.unitPrice) * item.quantity
    }
  }

  const itemSales: Record<string, { name: string; quantity: number; total: number }> = {}
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.menuItemId
      if (!itemSales[key]) itemSales[key] = { name: (item.menuItem as any).name, quantity: 0, total: 0 }
      itemSales[key].quantity += item.quantity
      itemSales[key].total += Number(item.unitPrice) * item.quantity
    }
  }

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  return {
    date, totalRevenue, totalPayments, cashTotal, cardTotal, transferTotal,
    ordersCount: orders.length, avgOrderValue,
    cashPaymentsCount: cashPayments.length, cardPaymentsCount: cardPayments.length,
    transferPaymentsCount: transferPayments.length,
    ordersByType: { DINE_IN: ordersByType.DINE_IN.length, TAKEAWAY: ordersByType.TAKEAWAY.length, DELIVERY: ordersByType.DELIVERY.length },
    ordersByStatus, categorySales: Object.values(categorySales).sort((a, b) => b.total - a.total),
    topItems: Object.values(itemSales).sort((a, b) => b.quantity - a.quantity).slice(0, 10),
    orders, payments,
  }
}

export async function getOpenOrders(propertyId?: string) {
  return prisma.order.findMany({
    where: {
      status: { in: ["OPEN", "PREPARING", "READY", "SERVED"] },
      ...(propertyId ? { propertyId } : {}),
    },
    include: { items: { include: { menuItem: true } }, table: true, payments: true },
    orderBy: { createdAt: "asc" },
  })
}

export async function closeOrder(id: string, payments: { method: string; amount: number }[]) {
  const order = await prisma.order.findUnique({ where: { id }, include: { table: true } })
  if (!order) throw new Error("Naročilo ne obstaja")

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  if (totalPaid < Number(order.totalAmount)) {
    throw new Error(` premalo plačila. Potrebno: ${Number(order.totalAmount)}, vplačano: ${totalPaid}`)
  }

  await prisma.$transaction([
    ...payments.map((p) =>
      prisma.payment.create({
        data: {
          amount: p.amount, method: p.method, status: "PAID", orderId: id,
        },
      })
    ),
    prisma.order.update({ where: { id }, data: { status: "CLOSED" } }),
    ...(order.tableId
      ? [prisma.table.update({ where: { id: order.tableId }, data: { status: "AVAILABLE" } })]
      : []),
  ])

  revalidatePath("/restaurant/pos")
  revalidatePath("/restaurant/orders")
  revalidatePath("/restaurant/reports/daily")
  return { success: true }
}

export async function updateOrderItemStatus(orderItemId: string, status: string) {
  return prisma.orderItem.update({ where: { id: orderItemId }, data: { status } })
}

export async function updateShiftClosingBalance(shiftId: string, closingBalance: number, discrepancy?: number) {
  const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
  if (!shift) throw new Error("Izmena ne obstaja")

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: shift.openedAt, lte: new Date() }, status: "CLOSED" },
    include: { payments: true },
  })

  const cashSales = orders.reduce((sum, o) => sum + o.payments.filter((p) => p.method === "CASH").reduce((s, p) => s + Number(p.amount), 0), 0)
  const cardSales = orders.reduce((sum, o) => sum + o.payments.filter((p) => p.method === "CARD").reduce((s, p) => s + Number(p.amount), 0), 0)

  return prisma.shift.update({
    where: { id: shiftId },
    data: {
      status: "CLOSED", closedAt: new Date(), closingBalance,
      cashSales, cardSales,
      discrepancy: discrepancy ?? closingBalance - (Number(shift.openingBalance) + cashSales),
    },
  })
}
