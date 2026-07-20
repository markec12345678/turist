import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = session.user as unknown as { id: string; companyId: string }

  const [reservations, guests, occupiedRooms, todayPayments, todayOrders, openFolios, pendingTasks, activeShifts] = await Promise.all([
    prisma.reservation.count(),
    prisma.guest.count(),
    prisma.room.count({ where: { status: "OCCUPIED" } }),
    prisma.payment.aggregate({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }, _sum: { amount: true } }),
    prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.folio.count({ where: { status: "OPEN" } }),
    prisma.housekeepingTask.count({ where: { status: "PENDING" } }),
    prisma.shift.count({ where: { status: "OPEN" } }),
  ])

  return NextResponse.json({
    reservations, guests, occupiedRooms,
    dailyRevenue: Number(todayPayments._sum.amount || 0),
    orders: todayOrders, openFolios, pendingTasks, activeShifts,
  })
}
