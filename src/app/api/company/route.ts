import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const companyId = (session.user as unknown as { companyId: string }).companyId
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  return NextResponse.json(company)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const companyId = (session.user as unknown as { companyId: string }).companyId
  const body = await request.json()
  const company = await prisma.company.update({ where: { id: companyId }, data: body })
  return NextResponse.json(company)
}
