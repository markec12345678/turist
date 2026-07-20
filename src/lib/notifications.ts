"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface NotificationData {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}

export async function createNotification(data: NotificationData) {
  try {
    await prisma.notification.create({
      data,
    })
  } catch (error) {
    console.error("Notification error:", error)
  }
}

export async function createNotificationsForRole(
  companyId: string,
  role: string,
  data: Omit<NotificationData, "userId">
) {
  try {
    const users = await prisma.user.findMany({
      where: { companyId, role: role as never, isActive: true },
      select: { id: true },
    })

    await prisma.notification.createMany({
      data: users.map((u: { id: string }) => ({
        userId: u.id,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      })),
    })
  } catch (error) {
    console.error("Notification error:", error)
  }
}

export async function getNotifications(userId: string, unreadOnly = false) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

export async function markAsRead(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })
  revalidatePath("/")
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
  revalidatePath("/")
}
