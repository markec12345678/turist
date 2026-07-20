"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getRooms(filters?: { status?: string }) {
  return prisma.room.findMany({ where: filters?.status ? { status: filters.status as never } : {}, include: { roomType: true }, orderBy: { number: "asc" } })
}

export async function updateRoomStatus(id: string, status: string) {
  const room = await prisma.room.update({ where: { id }, data: { status: status as never } })
  revalidatePath("/rooms")
  return room
}
