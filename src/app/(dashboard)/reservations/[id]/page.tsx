"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getReservation, updateReservationStatus } from "../actions"
import { formatDate, formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

const statusLabels: Record<string, string> = { PENDING: "Čaka", CONFIRMED: "Potrjeno", CHECKED_IN: "Prijavljeno", CHECKED_OUT: "Odjavljeno", CANCELLED: "Odpovedano", NO_SHOW: "Ni prišel" }
const nextStatus: Record<string, string[]> = { PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["CHECKED_IN", "CANCELLED"], CHECKED_IN: ["CHECKED_OUT"] }

export default function ReservationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [reservation, setReservation] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (params.id) getReservation(params.id as string).then(setReservation) }, [params.id])

  async function changeStatus(status: string) {
    setLoading(true)
    try {
      await updateReservationStatus(params.id as string, status)
      toast.success("Status posodobljen")
      const updated = await getReservation(params.id as string)
      setReservation(updated)
    } catch (err: any) { toast.error(err.message || "Napaka") }
    finally { setLoading(false) }
  }

  if (!reservation) return <div className="p-6">Nalagam...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Rezervacija #{reservation.id.slice(0, 8)}</h1>
        <Badge>{statusLabels[reservation.status] || reservation.status}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Gost</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>{reservation.guest?.firstName} {reservation.guest?.lastName}</div>
            <div className="text-muted-foreground">{reservation.guest?.email}</div>
            <div className="text-muted-foreground">{reservation.guest?.phone}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Soba</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>Soba {reservation.room?.number} — {reservation.room?.roomType?.name}</div>
            <div className="text-muted-foreground">{formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}</div>
            <div>{reservation.nights} noči, {reservation.adults} odraslih</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Znesek</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold">{formatCurrency(Number(reservation.totalAmount))}</div></CardContent>
      </Card>
      {nextStatus[reservation.status] && (
        <div className="flex gap-2">
          {nextStatus[reservation.status].map((s) => (
            <Button key={s} variant={s === "CANCELLED" ? "destructive" : "default"} onClick={() => changeStatus(s)} disabled={loading}>
              {statusLabels[s] || s}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
