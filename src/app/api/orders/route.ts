import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

function generateOrderNumber() {
  const now = new Date()
  const d = now.toISOString().replace(/[-T:.Z]/g, "").slice(0, 12)
  const r = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `${d}-${r}`
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { items, tableId, type, notes, propertyId } = body

    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } })
      if (!menuItem) continue
      const unitPrice = Number(menuItem.price)
      totalAmount += unitPrice * item.quantity
      orderItems.push({ menuItemId: item.menuItemId, quantity: item.quantity, unitPrice, status: "PENDING" })
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(), totalAmount, type: type || "DINE_IN",
        notes, propertyId, tableId,
        userId: (session.user as unknown as { id: string }).id,
        items: { create: orderItems },
      },
      include: { items: true },
    })

    if (tableId) await prisma.table.update({ where: { id: tableId }, data: { status: "OCCUPIED" } })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
