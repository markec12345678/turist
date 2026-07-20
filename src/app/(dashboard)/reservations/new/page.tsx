"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { createReservation } from "../actions"
import { toast } from "sonner"

export default function NewReservationPage() {
  const router = useRouter()
  const [guests, setGuests] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [ratePlans, setRatePlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [guestId, setGuestId] = useState("")
  const [roomId, setRoomId] = useState("")
  const [ratePlanId, setRatePlanId] = useState("")
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [source, setSource] = useState("")

  useEffect(() => {
    import("../../guests/actions").then(({ getGuests }) => getGuests().then(setGuests))
  }, [])

  useEffect(() => {
    fetch("/api/stats").then(() => {}).catch(() => {})
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createReservation({ guestId, roomId, ratePlanId, checkInDate, checkOutDate, adults, children, source })
      toast.success("Rezervacija ustvarjena")
      router.push("/reservations")
    } catch (err: any) { toast.error(err.message || "Napaka") }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Nova rezervacija</h1>
      <Card>
        <CardHeader><CardTitle>Podatki rezervacije</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Gost *</Label><Input value={guestId} onChange={(e) => setGuestId(e.target.value)} placeholder="Guest ID" required /></div>
            <div className="space-y-2"><Label>Soba *</Label><Input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" required /></div>
            <div className="space-y-2"><Label>Cenik *</Label><Input value={ratePlanId} onChange={(e) => setRatePlanId(e.target.value)} placeholder="Rate Plan ID" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Prihod *</Label><Input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Odhod *</Label><Input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Odrasli</Label><Input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Otroci</Label><Input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Vir</Label><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Booking.com" /></div>
            </div>
            <div className="flex gap-2"><Button type="submit" disabled={loading}>{loading ? "Shranjujem..." : "Ustvari"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Prekliči</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
