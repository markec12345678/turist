import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as unknown as { id: string }).id

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function POST() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as unknown as { id: string }).id
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await request.json()
  await prisma.notification.update({ where: { id }, data: { isRead: true } })
  return NextResponse.json({ ok: true })
}
