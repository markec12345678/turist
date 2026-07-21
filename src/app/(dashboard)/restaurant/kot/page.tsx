"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Monitor, Clock, CheckCircle, AlertCircle, ChefHat } from "lucide-react"
import { getOrders, updateOrderItemStatus, updateOrderStatus } from "../actions"
import { toast } from "sonner"

const STATIONS = [
  { value: "all", label: "Vse postaje" },
  { value: "TOPLOTNO", label: "Toplotno" },
  { value: "HLADNO", label: "Hladno" },
  { value: "SLADICE", label: "Sladice" },
  { value: "BAR", label: "Bar" },
]

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 border-yellow-300 dark:bg-yellow-950",
  PREPARING: "bg-blue-100 border-blue-300 dark:bg-blue-950",
  READY: "bg-green-100 border-green-300 dark:bg-green-950",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Čaka",
  PREPARING: "V pripravi",
  READY: "Pripravljeno",
  SERVED: "Postreženo",
}

function OrderTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000))
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [createdAt])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const isUrgent = mins >= 15
  const isWarning = mins >= 8

  return (
    <span className={`font-mono text-sm ${isUrgent ? "text-red-600 font-bold" : isWarning ? "text-orange-500" : "text-muted-foreground"}`}>
      {mins}:{secs.toString().padStart(2, "0")}
      {isUrgent && " ⚠"}
    </span>
  )
}

export default function KOTPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [station, setStation] = useState("all")
  const [filter, setFilter] = useState("active")

  const load = useCallback(async () => {
    const data = await getOrders()
    setOrders(data)
  }, [])

  useEffect(() => { load(); const i = setInterval(load, 10000); return () => clearInterval(i) }, [load])

  const activeOrders = orders.filter(o => ["OPEN", "PREPARING", "READY"].includes(o.status))
  const filtered = activeOrders.filter(o => {
    if (filter === "completed") return o.status === "SERVED" || o.status === "CLOSED"
    if (station === "all") return true
    return o.items.some((item: any) => item.menuItem?.kitchenStation === station)
  })

  async function advanceStatus(orderItem: any, currentStatus: string) {
    const next = currentStatus === "PENDING" ? "PREPARING" : currentStatus === "PREPARING" ? "READY" : "SERVED"
    try {
      await updateOrderItemStatus(orderItem.id, next)
      const allItems = orders.find(o => o.items.some((i: any) => i.id === orderItem.id))?.items || []
      const allReady = allItems.filter((i: any) => i.id !== orderItem.id).every((i: any) => i.status === "READY" || i.status === "SERVED")
      if (next === "READY" && allReady) {
        const orderId = orderItem.orderId || orders.find(o => o.items.some((i: any) => i.id === orderItem.id))?.id
        if (orderId) await updateOrderStatus(orderId, "READY")
      }
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Monitor className="h-6 w-6" /> KOT Zaslon</h1>
        <div className="flex gap-2">
          <Select value={station} onValueChange={setStation}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button variant={filter === "active" ? "default" : "ghost"} size="sm" onClick={() => setFilter("active")}>
              Aktivni ({activeOrders.length})
            </Button>
            <Button variant={filter === "completed" ? "default" : "ghost"} size="sm" onClick={() => setFilter("completed")}>
              Zaključeni
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={load}>↻ Osveži</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Ni naročil</p>
            <p className="text-sm">Počakaj na nova naročila...</p>
          </div>
        )}

        {filtered.map(order => {
          const relevantItems = station === "all"
            ? order.items
            : order.items.filter((i: any) => i.menuItem?.kitchenStation === station)

          const allReady = relevantItems.every((i: any) => i.status === "READY" || i.status === "SERVED")
          const anyPreparing = relevantItems.some((i: any) => i.status === "PREPARING")

          return (
            <Card key={order.id} className={`${STATUS_COLORS[order.status] || ""} border-2`}>
              <CardHeader className="pb-2 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">#{order.orderNumber?.slice(-4)}</span>
                    <Badge variant={order.type === "TAKEAWAY" ? "secondary" : "outline"} className="text-[10px]">
                      {order.type === "TAKEAWAY" ? "SEBOJ" : order.table ? `Miza ${order.table.number}` : "Brez mize"}
                    </Badge>
                  </div>
                  <OrderTimer createdAt={order.createdAt} />
                </div>
                {order.notes && <div className="text-xs italic text-muted-foreground mt-1">📝 {order.notes}</div>}
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {relevantItems.map((item: any) => (
                  <div key={item.id}
                    className={`flex items-start gap-2 p-2 rounded border ${item.status === "VOIDED" ? "opacity-50 line-through" : ""} ${
                      item.status === "READY" ? "bg-green-50 dark:bg-green-950/30" :
                      item.status === "PREPARING" ? "bg-blue-50 dark:bg-blue-950/30" : ""
                    }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.quantity}×</span>
                        <span className="text-sm">{item.menuItem?.name}</span>
                      </div>
                      {item.modifiers?.length > 0 && (
                        <div className="text-[10px] text-muted-foreground ml-6">
                          {item.modifiers.map((m: any) => m.name).join(", ")}
                        </div>
                      )}
                      {item.notes && <div className="text-[10px] text-orange-600 ml-6 italic">{item.notes}</div>}
                    </div>
                    {item.status !== "VOIDED" && (
                      <Button size="sm" variant={item.status === "PENDING" ? "default" : item.status === "PREPARING" ? "default" : "outline"}
                        className={`h-7 text-xs shrink-0 ${item.status === "READY" ? "border-green-500 text-green-700" : ""}`}
                        onClick={() => advanceStatus(item, item.status)}>
                        {item.status === "PENDING" ? "▶ Začni" : item.status === "PREPARING" ? "✓ Pripravljeno" : "✓ Postreženo"}
                      </Button>
                    )}
                  </div>
                ))}

                {allReady && order.status !== "READY" && (
                  <Button className="w-full" variant="default" onClick={async () => {
                    await updateOrderStatus(order.id, "READY")
                    load()
                  }}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Vso pripravljeno — obvesti natakarja
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
