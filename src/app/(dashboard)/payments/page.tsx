"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPayments } from "./actions"
import { formatCurrency, formatDateTime } from "@/lib/utils"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => { getPayments().then(setPayments) }, [])

  const cashTotal = payments.filter((p) => p.method === "CASH").reduce((s, p) => s + Number(p.amount), 0)
  const cardTotal = payments.filter((p) => p.method === "CARD").reduce((s, p) => s + Number(p.amount), 0)
  const grandTotal = payments.reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Plačila</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Gotovina</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(cashTotal)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Kartica</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(cardTotal)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Skupaj</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(grandTotal)}</div></CardContent></Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Znesek</TableHead><TableHead>Metoda</TableHead><TableHead>Status</TableHead><TableHead>Datum</TableHead></TableRow></TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatCurrency(Number(p.amount))}</TableCell>
                  <TableCell><Badge variant="outline">{p.method}</Badge></TableCell>
                  <TableCell><Badge>{p.status}</Badge></TableCell>
                  <TableCell>{formatDateTime(p.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
