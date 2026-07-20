"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getReservations } from "./actions"

const statusColors: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-800", CONFIRMED: "bg-blue-100 text-blue-800", CHECKED_IN: "bg-green-100 text-green-800", CHECKED_OUT: "bg-gray-100 text-gray-800", CANCELLED: "bg-red-100 text-red-800", NO_SHOW: "bg-red-100 text-red-800" }

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [status, setStatus] = useState("")

  useEffect(() => { getReservations(status ? { status } : undefined).then(setReservations) }, [status])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Rezervacije</h1>
        <Link href="/reservations/new"><Button><Plus className="mr-2 h-4 w-4" /> Nova rezervacija</Button></Link>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Vsi statusi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Vsi statusi</SelectItem>
                {["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Gost</TableHead><TableHead>Soba</TableHead><TableHead>Prihod</TableHead><TableHead>Odhod</TableHead><TableHead>Noči</TableHead><TableHead>Status</TableHead><TableHead>Znesek</TableHead></TableRow></TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><Link href={`/reservations/${r.id}`} className="text-primary hover:underline">{r.guest?.firstName} {r.guest?.lastName}</Link></TableCell>
                  <TableCell>{r.room?.number || "-"}</TableCell>
                  <TableCell>{formatDate(r.checkInDate)}</TableCell>
                  <TableCell>{formatDate(r.checkOutDate)}</TableCell>
                  <TableCell>{r.nights}</TableCell>
                  <TableCell><Badge className={statusColors[r.status] || ""}>{r.status}</Badge></TableCell>
                  <TableCell>{formatCurrency(Number(r.totalAmount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
