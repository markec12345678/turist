"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MonthlyReportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mesečno poročilo</h1>
      <Card>
        <CardHeader><CardTitle>Poročilo</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Mesečno poročilo bo na voljo kmalu.</p></CardContent>
      </Card>
    </div>
  )
}
