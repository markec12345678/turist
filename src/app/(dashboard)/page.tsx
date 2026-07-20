"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, BedDouble, CreditCard, UtensilsCrossed, FileText, ClipboardList, Clock } from "lucide-react"

async function fetchStats() {
  try {
    const res = await fetch("/api/stats")
    if (res.ok) return res.json()
  } catch {}
  return { reservations: 0, guests: 0, occupiedRooms: 0, dailyRevenue: 0, orders: 0, openFolios: 0, pendingTasks: 0, activeShifts: 0 }
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ reservations: 0, guests: 0, occupiedRooms: 0, dailyRevenue: 0, orders: 0, openFolios: 0, pendingTasks: 0, activeShifts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats().then(setStats).finally(() => setLoading(false)) }, [])

  const cards = [
    { title: "Rezervacije", value: stats.reservations, icon: CalendarDays },
    { title: "Gostje", value: stats.guests, icon: Users },
    { title: "Zasedene sobe", value: stats.occupiedRooms, icon: BedDouble },
    { title: "Dnevni prihodek", value: `€${stats.dailyRevenue.toFixed(2)}`, icon: CreditCard },
    { title: "Naročila", value: stats.orders, icon: UtensilsCrossed },
    { title: "Odprte položnice", value: stats.openFolios, icon: FileText },
    { title: "Naloge čiščenja", value: stats.pendingTasks, icon: ClipboardList },
    { title: "Aktivne izmene", value: stats.activeShifts, icon: Clock },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Nadzorna plošča</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
