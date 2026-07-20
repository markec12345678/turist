"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getOrders, updateOrderStatus } from "../actions"
import { toast } from "sonner"

export default function KOTPage() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const all = await getOrders()
      setOrders(all.filter((o: any) => ["SUBMITTED", "PREPARING"].includes(o.status)))
    }
    load()
    const i = setInterval(load, 15000)
    return () => clearInterval(i)
  }, [])

  function getUrgency(createdAt: string) {
    const mins = (Date.now() - new Date(createdAt).getTime()) / 60000
    if (mins <= 5) return "border-l-green-500"
    if (mins <= 15) return "border-l-yellow-500"
    return "border-l-red-500"
  }

  async function markReady(orderId: string) {
    try {
      await updateOrderStatus(orderId, "READY")
      toast.success("Naročilo pripravljeno")
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
    } catch { toast.error("Napaka") }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">KOT Zaslon</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id} className={`border-l-4 ${getUrgency(order.createdAt)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">#{order.orderNumber.slice(-6)}</CardTitle>
                <Badge>Miza {order.table?.number || "-"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.menuItem?.name}</span>
                    <span className="text-muted-foreground">{item.notes || ""}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => markReady(order.id)}>Pripravljeno ✓</Button>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">Ni aktivnih naročil</div>}
      </div>
    </div>
  )
}
