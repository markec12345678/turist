"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getGuest } from "../actions"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function GuestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [guest, setGuest] = useState<any>(null)

  useEffect(() => { if (params.id) getGuest(params.id as string).then(setGuest) }, [params.id])

  if (!guest) return <div className="p-6">Nalagam...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{guest.firstName} {guest.lastName}</h1>
        <Link href={`/guests/${guest.id}/edit`}><Button>Uredi</Button></Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Osebni podatki</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Email:</span> {guest.email || "-"}</div>
            <div><span className="text-muted-foreground">Telefon:</span> {guest.phone || "-"}</div>
            <div><span className="text-muted-foreground">Državljanstvo:</span> {guest.nationality || "-"}</div>
            <div><span className="text-muted-foreground">Naslov:</span> {guest.address || "-"}, {guest.city || ""} {guest.country || ""}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Dokumenti</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Vrsta:</span> {guest.documentType || "-"}</div>
            <div><span className="text-muted-foreground">Številka:</span> {guest.documentNo || "-"}</div>
          </CardContent>
        </Card>
      </div>
      {guest.reservations?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Zgodovina rezervacij</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Datum</TableHead><TableHead>Stanje</TableHead><TableHead>Znesek</TableHead></TableRow></TableHeader>
              <TableBody>
                {guest.reservations.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.checkInDate)} - {formatDate(r.checkOutDate)}</TableCell>
                    <TableCell><Badge variant={r.status === "CHECKED_IN" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                    <TableCell>€{Number(r.totalAmount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
