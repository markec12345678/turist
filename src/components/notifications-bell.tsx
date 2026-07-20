"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Bell, CheckCheck } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Notification { id: string; type: string; title: string; message: string; isRead: boolean; link: string | null; createdAt: Date | string }

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) { const data = await res.json(); setNotifications(data.notifications); setUnreadCount(data.unreadCount) }
    } catch {}
  }, [])

  useEffect(() => { fetchNotifications(); const i = setInterval(fetchNotifications, 30000); return () => clearInterval(i) }, [fetchNotifications])

  async function markRead(id: string) { await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); fetchNotifications() }
  async function markAllRead() { await fetch("/api/notifications", { method: "POST" }); fetchNotifications() }

  return (
    <Popover>
      <PopoverTrigger className="relative">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">{unreadCount > 9 ? "9+" : unreadCount}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <span className="font-medium text-sm">Obvestila</span>
          {unreadCount > 0 && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}><CheckCheck className="mr-1 h-3 w-3" /> Preberi vse</Button>}
        </div>
        <div className="max-h-80 overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Ni obvestil</div>
          ) : notifications.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 ${!n.isRead ? "bg-muted/30" : ""}`} onClick={() => !n.isRead && markRead(n.id)}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground truncate">{n.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</div>
              </div>
              {!n.isRead && <div className="mt-1"><div className="h-2 w-2 rounded-full bg-primary" /></div>}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
