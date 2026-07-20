"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getGuests(search?: string) {
  return prisma.guest.findMany({
    where: search ? {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function getGuest(id: string) {
  return prisma.guest.findUnique({
    where: { id },
    include: { reservations: { orderBy: { createdAt: "desc" }, take: 10 } },
  })
}

export async function createGuest(data: {
  firstName: string; lastName: string; email?: string; phone?: string;
  nationality?: string; gender?: string; documentType?: string; documentNo?: string;
  address?: string; city?: string; country?: string; notes?: string;
}) {
  const guest = await prisma.guest.create({
    data: { ...data, companyId: "demo-company" },
  })
  revalidatePath("/guests")
  return guest
}

export async function updateGuest(id: string, data: Record<string, unknown>) {
  const guest = await prisma.guest.update({ where: { id }, data })
  revalidatePath("/guests")
  return guest
}

export async function deleteGuest(id: string) {
  await prisma.guest.delete({ where: { id } })
  revalidatePath("/guests")
}
