"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

function generateOrderNumber() {
  const now = new Date()
  const d = now.toISOString().replace(/[-T:.Z]/g, "").slice(0, 12)
  const r = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `${d}-${r}`
}

export async function getMenuCategories(propertyId?: string) {
  return prisma.menuCategory.findMany({
    where: propertyId ? { propertyId } : {},
    include: { items: { include: { modifiers: true } } },
    orderBy: { sortOrder: "asc" },
  })
}

export async function createMenuCategory(data: { name: string; description?: string; sortOrder?: number; propertyId: string }) {
  const cat = await prisma.menuCategory.create({ data })
  revalidatePath("/restaurant/menu")
  return cat
}

export async function getMenuItems(propertyId?: string) {
  return prisma.menuItem.findMany({
    where: { ...(propertyId ? { category: { propertyId } } : {}) },
    include: { category: true, modifiers: true, menuItemIngredients: { include: { ingredient: true } } },
    orderBy: { name: "asc" },
  })
}

export async function createMenuItem(data: {
  name: string; description?: string; price: number; costPrice?: number; prepTime?: number;
  allergens?: string[]; kitchenStation?: string; categoryId: string;
  modifiers?: { name: string; priceAdj: number }[];
}) {
  const item = await prisma.menuItem.create({
    data: {
      name: data.name, description: data.description, price: data.price,
      costPrice: data.costPrice, prepTime: data.prepTime,
      allergens: JSON.stringify(data.allergens || []),
      kitchenStation: data.kitchenStation, categoryId: data.categoryId,
      modifiers: data.modifiers ? { create: data.modifiers } : undefined,
    },
    include: { modifiers: true },
  })
  revalidatePath("/restaurant/menu")
  return item
}

export async function updateMenuItem(id: string, data: {
  name?: string; description?: string; price?: number; costPrice?: number; prepTime?: number;
  allergens?: string[]; kitchenStation?: string; categoryId?: string;
  modifiers?: { id?: string; name: string; priceAdj: number }[];
}) {
  if (data.modifiers) {
    await prisma.menuItemModifier.deleteMany({ where: { menuItemId: id } })
  }
  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      name: data.name, description: data.description, price: data.price,
      costPrice: data.costPrice, prepTime: data.prepTime,
      allergens: data.allergens ? JSON.stringify(data.allergens) : undefined,
      kitchenStation: data.kitchenStation, categoryId: data.categoryId,
      modifiers: data.modifiers ? { create: data.modifiers.map(m => ({ name: m.name, priceAdj: m.priceAdj })) } : undefined,
    },
    include: { modifiers: true },
  })
  revalidatePath("/restaurant/menu")
  return item
}

export async function deleteMenuItem(id: string) {
  await prisma.menuItemModifier.deleteMany({ where: { menuItemId: id } })
  await prisma.menuItem.delete({ where: { id } })
  revalidatePath("/restaurant/menu")
}

export async function createModifier(data: { name: string; priceAdj: number; menuItemId: string }) {
  return prisma.menuItemModifier.create({ data })
}

export async function deleteModifier(id: string) {
  return prisma.menuItemModifier.delete({ where: { id } })
}

export async function getOrders(filters?: { status?: string; propertyId?: string }) {
  return prisma.order.findMany({
    where: {
      ...(filters?.status ? { status: filters.status as never } : {}),
      ...(filters?.propertyId ? { propertyId: filters.propertyId } : {}),
    },
    include: {
      items: { include: { menuItem: true, modifiers: true } },
      table: true, user: true, payments: true, tips: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { menuItem: true, modifiers: true } },
      table: true, user: true, payments: true, tips: true,
    },
  })
}

export async function createOrder(data: {
  items: { menuItemId: string; quantity: number; modifiers?: string[]; notes?: string; discountType?: string; discountValue?: number }[];
  tableId?: string; type?: string; notes?: string; propertyId: string; userId: string;
}) {
  let subtotal = 0
  const orderItems = []

  for (const item of data.items) {
    const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId }, include: { modifiers: true } })
    if (!menuItem) throw new Error("Artikel ne obstaja")

    let modTotal = 0
    const selectedModifiers = item.modifiers || []
    const modifierRecords = selectedModifiers.map(modId => {
      const mod = menuItem.modifiers.find(m => m.id === modId)
      if (mod) { modTotal += Number(mod.priceAdj); return { modifierId: mod.id, name: mod.name, priceAdj: mod.priceAdj } }
      return null
    }).filter(Boolean) as { modifierId: string; name: string; priceAdj: number }[]

    const basePrice = Number(menuItem.price) + modTotal
    let lineTotal = basePrice * item.quantity

    if (item.discountType === "PERCENT") {
      lineTotal -= lineTotal * ((item.discountValue || 0) / 100)
    } else if (item.discountType === "FIXED") {
      lineTotal -= (item.discountValue || 0) * item.quantity
    }

    subtotal += lineTotal
    orderItems.push({
      menuItemId: item.menuItemId, quantity: item.quantity,
      unitPrice: basePrice, discountType: item.discountType, discountValue: item.discountValue,
      lineTotal, status: "PENDING", notes: item.notes,
      modifiers: modifierRecords.length > 0 ? { create: modifierRecords } : undefined,
    })
  }

  const totalAmount = subtotal

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(), subtotal: totalAmount, totalAmount,
      type: (data.type || "DINE_IN") as never,
      notes: data.notes, propertyId: data.propertyId, tableId: data.tableId, userId: data.userId,
      items: { create: orderItems },
    },
    include: { items: { include: { modifiers: true } } },
  })

  if (data.tableId) {
    await prisma.table.update({ where: { id: data.tableId }, data: { status: "OCCUPIED" } })
  }

  revalidatePath("/restaurant")
  revalidatePath("/restaurant/pos")
  revalidatePath("/restaurant/orders")
  return order
}

export async function applyOrderDiscount(orderId: string, discountType: string, discountValue: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new Error("Naročilo ne obstaja")

  let discountAmount = 0
  if (discountType === "PERCENT") {
    discountAmount = Number(order.subtotal) * (discountValue / 100)
  } else {
    discountAmount = discountValue
  }

  const totalAmount = Number(order.subtotal) - discountAmount + Number(order.tipAmount)

  return prisma.order.update({
    where: { id: orderId },
    data: { discountType, discountValue, discountAmount, totalAmount },
  })
}

export async function addTip(orderId: string, amount: number, method: string, userId?: string) {
  const tip = await prisma.tip.create({
    data: { amount, method, orderId, userId },
  })
  await prisma.order.update({
    where: { id: orderId },
    data: { tipAmount: { increment: amount }, totalAmount: { increment: amount } },
  })
  revalidatePath("/restaurant/pos")
  return tip
}

export async function voidOrder(orderId: string, reason: string, voidedBy: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
  if (!order) throw new Error("Naročilo ne obstaja")

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "VOIDED", voidedAt: new Date(), voidedBy, voidReason: reason },
    }),
    prisma.orderVoidLog.create({
      data: { type: "ORDER", reason, amount: order.totalAmount, orderId, voidedBy },
    }),
    ...(order.tableId ? [prisma.table.update({ where: { id: order.tableId }, data: { status: "AVAILABLE" } })] : []),
  ])

  revalidatePath("/restaurant/orders")
  revalidatePath("/restaurant/pos")
  return { success: true }
}

export async function voidOrderItem(orderItemId: string, reason: string, voidedBy: string) {
  const item = await prisma.orderItem.findUnique({ where: { id: orderItemId } })
  if (!item) throw new Error("Postavka ne obstaja")

  await prisma.$transaction([
    prisma.orderItem.update({ where: { id: orderItemId }, data: { status: "VOIDED", voidedAt: new Date() } }),
    prisma.orderVoidLog.create({
      data: { type: "ITEM", reason, amount: item.unitPrice, orderId: item.orderId, orderItemId, voidedBy },
    }),
    prisma.order.update({
      where: { id: item.orderId },
      data: {
        subtotal: { decrement: item.lineTotal },
        totalAmount: { decrement: item.lineTotal },
      },
    }),
  ])

  revalidatePath("/restaurant/orders")
  return { success: true }
}

export async function refundPayment(paymentId: string, reason: string) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REFUNDED", isRefund: true, refundReason: reason },
  })
}

export async function getTables(propertyId?: string) {
  return prisma.table.findMany({ where: propertyId ? { propertyId } : {}, orderBy: { number: "asc" } })
}

export async function updateTableStatus(id: string, status: string) {
  const table = await prisma.table.update({ where: { id }, data: { status } })
  revalidatePath("/restaurant/tables")
  return table
}

export async function getModifierGroups() {
  return prisma.menuItemModifier.findMany({ orderBy: { name: "asc" } })
}
