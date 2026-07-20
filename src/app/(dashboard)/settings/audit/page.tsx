"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAuditLogs } from "../actions"
import { formatDateTime } from "@/lib/utils"

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  useEffect(() => { getAuditLogs().then(setLogs) }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Revizija</h1>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Datum</TableHead><TableHead>Uporabnik</TableHead><TableHead>Dejanje</TableHead><TableHead>Entiteta</TableHead><TableHead>ID</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{formatDateTime(l.createdAt)}</TableCell>
                  <TableCell>{l.user?.name || l.user?.email || "-"}</TableCell>
                  <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                  <TableCell>{l.entity}</TableCell>
                  <TableCell className="font-mono text-xs">{l.entityId?.slice(0, 8) || "-"}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Ni zapisov</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
