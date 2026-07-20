"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTables } from "../actions"

const statusColors: Record<string, string> = { AVAILABLE: "bg-green-100 border-green-300 text-green-800", OCCUPIED: "bg-red-100 border-red-300 text-red-800", RESERVED: "bg-yellow-100 border-yellow-300 text-yellow-800", OUT_OF_ORDER: "bg-gray-100 border-gray-300 text-gray-800" }
const statusLabels: Record<string, string> = { AVAILABLE: "Prosta", OCCUPIED: "Zasedena", RESERVED: "Rezervirana", OUT_OF_ORDER: "Ni v uporabi" }

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([])

  useEffect(() => { getTables().then(setTables) }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mize</h1>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {tables.map((table) => (
          <Card key={table.id} className={`border-2 ${statusColors[table.status] || ""}`}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl">{table.number}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm">{table.capacity} mest</p>
              <Badge variant="outline" className="mt-2">{statusLabels[table.status] || table.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
