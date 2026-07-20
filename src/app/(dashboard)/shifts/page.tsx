"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getShifts } from "../payments/actions"
import { formatDateTime, formatCurrency } from "@/lib/utils"

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([])
  const [openingBalance, setOpeningBalance] = useState(0)

  useEffect(() => { getShifts().then(setShifts) }, [])

  async function openShift() {
    try {
      const res = await fetch("/api/shifts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ openingBalance, cashRegisterId: "demo-register", userId: "demo-user" }) })
      if (res.ok) { setOpeningBalance(0); getShifts().then(setShifts) }
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Izmene</h1>
      <Card className="max-w-md">
        <CardHeader><CardTitle>Odpri izmeno</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Začetno stanje (EUR)</label>
            <Input type="number" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(Number(e.target.value))} />
          </div>
          <Button onClick={openShift}>Odpri izmeno</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Status</TableHead><TableHead>Začetno</TableHead><TableHead>Konec</TableHead><TableHead>Razlika</TableHead><TableHead>Odprto</TableHead><TableHead>Zaprto</TableHead></TableRow></TableHeader>
            <TableBody>
              {shifts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><Badge variant={s.status === "OPEN" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                  <TableCell>{formatCurrency(Number(s.openingBalance))}</TableCell>
                  <TableCell>{s.closingBalance != null ? formatCurrency(Number(s.closingBalance)) : "-"}</TableCell>
                  <TableCell>{s.discrepancy != null ? formatCurrency(Number(s.discrepancy)) : "-"}</TableCell>
                  <TableCell>{formatDateTime(s.openedAt)}</TableCell>
                  <TableCell>{s.closedAt ? formatDateTime(s.closedAt) : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
