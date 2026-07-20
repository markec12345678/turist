"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getDailyReport } from "../../payments/actions"
import { formatCurrency } from "@/lib/utils"

export default function DailyReportPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try { const r = await getDailyReport(date); setReport(r) }
    catch {} finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dnevno Z-poročilo</h1>
      <div className="flex gap-4 items-end">
        <div className="space-y-2"><label className="text-sm font-medium">Datum</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <Button onClick={load} disabled={loading}>{loading ? "Nalagam..." : "Naloži"}</Button>
      </div>
      {report && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-sm">Plačila po metodi</CardTitle></CardHeader><CardContent>
            {Object.entries(report.totalByMethod).map(([method, amount]) => (
              <div key={method} className="flex justify-between py-1"><span>{method}</span><span className="font-medium">{formatCurrency(amount as number)}</span></div>
            ))}
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Povzetek</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Naročila</span><span>{report.totalOrders}</span></div>
            <div className="flex justify-between"><span>Plačila</span><span>{report.totalPayments}</span></div>
            <div className="flex justify-between"><span>Prijave</span><span>{report.checkIns}</span></div>
            <div className="flex justify-between"><span>Odjave</span><span>{report.checkOuts}</span></div>
          </CardContent></Card>
        </div>
      )}
    </div>
  )
}
