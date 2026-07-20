import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const shifts = await prisma.shift.findMany({ include: { user: true, cashRegister: true }, orderBy: { openedAt: "desc" }, take: 50 })
  return NextResponse.json(shifts)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { openingBalance, cashRegisterId } = await request.json()
    const userId = (session.user as unknown as { id: string }).id

    const shift = await prisma.shift.create({
      data: { openingBalance, cashRegisterId, userId, status: "OPEN" },
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
