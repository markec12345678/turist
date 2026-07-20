"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Lastnosti</h1>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4"><Building2 className="h-8 w-8 text-primary" /><CardTitle>Hotel Bled</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>Tip: Hotel</div><div>Mesto: Bled</div><div>Sobe: 6</div><div>Status: Aktivna</div>
        </CardContent>
      </Card>
    </div>
  )
}
