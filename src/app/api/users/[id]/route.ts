import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const user = await prisma.user.update({ where: { id }, data: body })
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
