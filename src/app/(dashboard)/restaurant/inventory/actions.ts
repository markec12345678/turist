"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getInventoryCategories(propertyId?: string) {
  return prisma.inventoryCategory.findMany({
    where: propertyId ? { propertyId } : {},
    include: { ingredients: true },
    orderBy: { sortOrder: "asc" },
  })
}

export async function createInventoryCategory(data: { name: string; sortOrder?: number; propertyId: string }) {
  const cat = await prisma.inventoryCategory.create({ data })
  revalidatePath("/restaurant/inventory")
  return cat
}

export async function deleteInventoryCategory(id: string) {
  await prisma.inventoryCategory.delete({ where: { id } })
  revalidatePath("/restaurant/inventory")
}

export async function getIngredients(propertyId?: string) {
  return prisma.ingredient.findMany({
    where: propertyId ? { propertyId } : {},
    include: { category: true },
    orderBy: { name: "asc" },
  })
}

export async function createIngredient(data: {
  name: string; unit?: string; currentStock?: number; minStock?: number; costPerUnit?: number; categoryId?: string; propertyId: string
}) {
  const ingredient = await prisma.ingredient.create({ data })
  revalidatePath("/restaurant/inventory")
  return ingredient
}

export async function updateIngredient(id: string, data: {
  name?: string; unit?: string; currentStock?: number; minStock?: number; costPerUnit?: number; categoryId?: string | null
}) {
  const ingredient = await prisma.ingredient.update({ where: { id }, data })
  revalidatePath("/restaurant/inventory")
  return ingredient
}

export async function deleteIngredient(id: string) {
  await prisma.ingredient.delete({ where: { id } })
  revalidatePath("/restaurant/inventory")
}

export async function addStockMovement(data: {
  type: string; quantity: number; unitCost?: number; notes?: string; ingredientId: string; userId?: string
}) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id: data.ingredientId } })
  if (!ingredient) throw new Error("Sestavina ne obstaja")

  const quantityChange = data.type === "RECEIPT" ? data.quantity : data.type === "CONSUMPTION" ? -data.quantity : data.quantity

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        type: data.type, quantity: data.quantity, unitCost: data.unitCost ?? ingredient.costPerUnit,
        notes: data.notes, ingredientId: data.ingredientId, userId: data.userId,
      },
    }),
    prisma.ingredient.update({
      where: { id: data.ingredientId },
      data: { currentStock: { increment: quantityChange } },
    }),
  ])

  revalidatePath("/restaurant/inventory")
  return movement
}

export async function getStockMovements(ingredientId?: string, limit = 50) {
  return prisma.stockMovement.findMany({
    where: ingredientId ? { ingredientId } : {},
    include: { ingredient: true, user: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getLowStockItems(propertyId?: string) {
  return prisma.ingredient.findMany({
    where: {
      ...(propertyId ? { propertyId } : {}),
      isActive: true,
    },
    include: { category: true },
  }).then((items) => items.filter((i) => Number(i.currentStock) <= Number(i.minStock)))
}
