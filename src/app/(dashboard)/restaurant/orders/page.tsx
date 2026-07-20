"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { getOrders } from "../actions"
import { formatDateTime, formatCurrency } from "@/lib/utils"

const statusColors: Record<string, string> = { OPEN: "bg-blue-100 text-blue-800", SUBMITTED: "bg-yellow-100 text-yellow-800", PREPARING: "bg-orange-100 text-orange-800", READY: "bg-green-100 text-green-800", SERVED: "bg-purple-100 text-purple-800", CLOSED: "bg-gray-100 text-gray-800", CANCELLED: "bg-red-100 text-red-800" }

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [status, setStatus] = useState("")

  useEffect(() => { getOrders(status ? { status } : undefined).then(setOrders) }, [status])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Naročila</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Vsi statusi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Vsi statusi</SelectItem>
                {["OPEN", "SUBMITTED", "PREPARING", "READY", "SERVED", "CLOSED"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Številka</TableHead><TableHead>Miza</TableHead><TableHead>Status</TableHead><TableHead>Skupaj</TableHead><TableHead>Čas</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono">{o.orderNumber}</TableCell>
                  <TableCell>{o.table?.number || "-"}</TableCell>
                  <TableCell><Badge className={statusColors[o.status] || ""}>{o.status}</Badge></TableCell>
                  <TableCell>{formatCurrency(Number(o.totalAmount))}</TableCell>
                  <TableCell>{formatDateTime(o.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
