"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

export async function getReservations(filters?: { status?: string }) {
  return prisma.reservation.findMany({
    where: filters?.status ? { status: filters.status as never } : {},
    include: { guest: true, room: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function getReservation(id: string) {
  return prisma.reservation.findUnique({ where: { id }, include: { guest: true, room: { include: { roomType: true } }, ratePlan: true } })
}

export async function createReservation(data: {
  guestId: string; roomId: string; ratePlanId: string; checkInDate: string; checkOutDate: string;
  adults: number; children?: number; petCount?: number; source?: string; guestNotes?: string;
}) {
  const checkIn = new Date(data.checkInDate)
  const checkOut = new Date(data.checkOutDate)
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  if (nights < 1) throw new Error("Datum odhoda mora biti po datumu prihoda")

  const overlapping = await prisma.reservation.findFirst({
    where: { roomId: data.roomId, status: { notIn: ["CANCELLED", "NO_SHOW"] }, checkInDate: { lt: checkOut }, checkOutDate: { gt: checkIn } },
  })
  if (overlapping) throw new Error("Soba je že rezervirana v tem terminu")

  const ratePlan = await prisma.ratePlan.findUnique({ where: { id: data.ratePlanId } })
  if (!ratePlan) throw new Error("Cenik ne obstaja")
  const totalAmount = Number(ratePlan.basePrice) * nights

  const room = await prisma.room.findUnique({ where: { id: data.roomId } })

  const reservation = await prisma.reservation.create({
    data: {
      propertyId: room!.propertyId, guestId: data.guestId, roomId: data.roomId, ratePlanId: data.ratePlanId,
      checkInDate: checkIn, checkOutDate: checkOut, nights, adults: data.adults,
      children: data.children || 0, petCount: data.petCount || 0, source: data.source,
      totalAmount, guestNotes: data.guestNotes,
    },
    include: { guest: true, room: true },
  })

  revalidatePath("/reservations")
  return reservation
}

export async function updateReservationStatus(id: string, status: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id }, include: { room: true } })
  if (!reservation) throw new Error("Rezervacija ne obstaja")
  const now = new Date()

  const updated = await prisma.reservation.update({
    where: { id }, data: { status: status as never, ...(status === "CHECKED_IN" ? { checkedInAt: now } : {}), ...(status === "CHECKED_OUT" ? { checkedOutAt: now } : {}) },
  })

  if (status === "CHECKED_IN") {
    await prisma.room.update({ where: { id: reservation.roomId }, data: { status: "OCCUPIED" } })
  } else if (status === "CHECKED_OUT") {
    await prisma.room.update({ where: { id: reservation.roomId }, data: { status: "CLEANING" } })
  } else if (status === "CANCELLED" && reservation.room.status === "RESERVED") {
    await prisma.room.update({ where: { id: reservation.roomId }, data: { status: "AVAILABLE" } })
  }

  revalidatePath("/reservations")
  return updated
}
