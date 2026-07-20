"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { getRooms, updateRoomStatus } from "./actions"
import { toast } from "sonner"

const statusColors: Record<string, string> = { AVAILABLE: "bg-green-100 text-green-800", OCCUPIED: "bg-red-100 text-red-800", RESERVED: "bg-yellow-100 text-yellow-800", CLEANING: "bg-blue-100 text-blue-800", INSPECTION: "bg-purple-100 text-purple-800", OUT_OF_ORDER: "bg-gray-100 text-gray-800" }

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [filter, setFilter] = useState("")

  useEffect(() => { getRooms(filter ? { status: filter } : undefined).then(setRooms) }, [filter])

  async function changeStatus(id: string, status: string) {
    try { await updateRoomStatus(id, status); toast.success("Status posodobljen"); getRooms(filter ? { status: filter } : undefined).then(setRooms) }
    catch { toast.error("Napaka") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sobe</h1>
        <Select value={filter} onValueChange={(v) => setFilter(v ?? "")}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Vsi statusi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Vsi statusi</SelectItem>
            {["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "INSPECTION", "OUT_OF_ORDER"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Soba {room.number}</CardTitle>
              <Badge className={statusColors[room.status]}>{room.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{room.roomType?.name} — Nadstropje {room.floor || "-"}</p>
              <div className="flex gap-1 flex-wrap">
                {["AVAILABLE", "CLEANING", "OUT_OF_ORDER"].map((s) => (
                  <Button key={s} size="sm" variant="outline" onClick={() => changeStatus(room.id, s)} disabled={room.status === s}>{s}</Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
