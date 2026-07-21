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
  return prisma.menuCategory.findMany({ where: propertyId ? { propertyId } : {}, include: { items: true }, orderBy: { sortOrder: "asc" } })
}

export async function createMenuCategory(data: { name: string; description?: string; sortOrder?: number; propertyId: string }) {
  const cat = await prisma.menuCategory.create({ data })
  revalidatePath("/restaurant/menu")
  return cat
}

export async function getMenuItems(propertyId?: string) {
  return prisma.menuItem.findMany({ where: { ...(propertyId ? { category: { propertyId } } : {}) }, include: { category: true }, orderBy: { name: "asc" } })
}

export async function createMenuItem(data: { name: string; description?: string; price: number; costPrice?: number; prepTime?: number; allergens?: string[]; kitchenStation?: string; categoryId: string }) {
  const item = await prisma.menuItem.create({ data: { ...data, allergens: JSON.stringify(data.allergens || []) } })
  revalidatePath("/restaurant/menu")
  return item
}

export async function getOrders(filters?: { status?: string }) {
  return prisma.order.findMany({
    where: filters?.status ? { status: filters.status as never } : {},
    include: { items: { include: { menuItem: true } }, table: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function createOrder(data: { items: { menuItemId: string; quantity: number }[]; tableId?: string; type?: string; notes?: string; propertyId: string; userId: string }) {
  let totalAmount = 0
  const orderItems = []

  for (const item of data.items) {
    const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } })
    if (!menuItem) throw new Error("Artikel ne obstaja")
    const unitPrice = Number(menuItem.price)
    totalAmount += unitPrice * item.quantity
    orderItems.push({ menuItemId: item.menuItemId, quantity: item.quantity, unitPrice, status: "PENDING" })
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(), totalAmount, type: (data.type || "DINE_IN") as never,
      notes: data.notes, propertyId: data.propertyId, tableId: data.tableId, userId: data.userId,
      items: { create: orderItems },
    },
    include: { items: true },
  })

  if (data.tableId) {
    await prisma.table.update({ where: { id: data.tableId }, data: { status: "OCCUPIED" } })
  }

  revalidatePath("/restaurant")
  return order
}

export async function updateOrderStatus(id: string, status: string) {
  const order = await prisma.order.update({ where: { id }, data: { status: status as never } })
  if (status === "CLOSED" && order.tableId) {
    await prisma.table.update({ where: { id: order.tableId }, data: { status: "AVAILABLE" } })
  }
  revalidatePath("/restaurant")
  return order
}

export async function getTables(propertyId?: string) {
  return prisma.table.findMany({ where: propertyId ? { propertyId } : {}, orderBy: { number: "asc" } })
}

export async function updateTableStatus(id: string, status: string) {
  const table = await prisma.table.update({ where: { id }, data: { status } })
  revalidatePath("/restaurant/tables")
  return table
}
