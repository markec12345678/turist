"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Calendar, Banknote, CreditCard, ArrowRightLeft, Printer, TrendingUp, ShoppingCart, Users } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { getDailyReport } from "../actions"

function todayStr() {
  return new Date().toISOString().split("T")[0]
}

export default function DailyReportPage() {
  const [date, setDate] = useState(todayStr())
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const r = await getDailyReport(date)
      setReport(r)
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [date])

  if (!report) return <div className="p-8 text-center text-muted-foreground">Nalaganje...</div>

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6 print:space-y-2">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" /> Dnevno poročilo (PVS)
        </h1>
        <div className="flex gap-2 items-center">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Tiskaj</Button>
          <Button onClick={load} disabled={loading}>Osveži</Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center border-b pb-2 mb-4">
        <h2 className="text-lg font-bold">TURIST D.O.O.</h2>
        <p className="text-sm">Dnevno poročilo — {new Date(date).toLocaleDateString("sl-SI")}</p>
        <p className="text-xs text-muted-foreground">Številka PVS: PVS-{date.replace(/-/g, "")}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4" /> Promet</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(report.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><ShoppingCart className="h-4 w-4" /> Naročila</div>
            <div className="text-2xl font-bold mt-1">{report.ordersCount}</div>
            {report.ordersCount > 0 && (
              <div className="text-xs text-muted-foreground">Povprečje: {formatCurrency(report.avgOrderValue)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /> V lokalu</div>
            <div className="text-2xl font-bold mt-1">{report.ordersByStatus?.DINE_IN || 0}</div>
            <div className="text-xs text-muted-foreground">Za s seboj: {report.ordersByStatus?.TAKEAWAY || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /> Povprečje mizo</div>
            <div className="text-2xl font-bold mt-1">
              {report.orders.length > 0 ? formatCurrency(report.totalRevenue / Math.max(1, report.ordersCount)) : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment methods */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Plačila po metodah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <Banknote className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-xs text-muted-foreground">Gotovina</div>
                <div className="text-lg font-bold">{formatCurrency(report.cashTotal)}</div>
                <div className="text-xs text-muted-foreground">{report.cashPaymentsCount} transakcij</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-xs text-muted-foreground">Kartica</div>
                <div className="text-lg font-bold">{formatCurrency(report.cardTotal)}</div>
                <div className="text-xs text-muted-foreground">{report.cardPaymentsCount} transakcij</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <ArrowRightLeft className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-xs text-muted-foreground">Predračun / Transfer</div>
                <div className="text-lg font-bold">{formatCurrency(report.transferTotal)}</div>
                <div className="text-xs text-muted-foreground">{report.transferPaymentsCount} transakcij</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Promet po kategorijah</CardTitle>
          </CardHeader>
          <CardContent>
            {report.categorySales.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ni podatkov</p>
            ) : (
              <div className="space-y-2">
                {report.categorySales.map((cat: any) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <span>{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{cat.quantity} kosov</span>
                      <span className="font-medium">{formatCurrency(cat.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top 10 artiklov</CardTitle>
          </CardHeader>
          <CardContent>
            {report.topItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ni podatkov</p>
            ) : (
              <div className="space-y-2">
                {report.topItems.map((item: any, idx: number) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">{idx + 1}</Badge>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{item.quantity}×</span>
                      <span className="font-medium">{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order status breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Status naročil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(report.ordersByStatus || {}).map(([status, count]) => (
              <Badge key={status} variant={status === "CANCELLED" ? "destructive" : "outline"}>
                {status}: {count as number}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual orders table */}
      <Card className="print:break-before">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Vsa naročila ({report.ordersCount})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-2">Ura</th>
                <th className="text-left p-2">Št.</th>
                <th className="text-left p-2">Tip</th>
                <th className="text-left p-2">Miza</th>
                <th className="text-left p-2">Natakar</th>
                <th className="text-left p-2">Postavke</th>
                <th className="text-right p-2">Znesek</th>
                <th className="text-left p-2">Plačilo</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.orders.map((o: any) => (
                <tr key={o.id} className="border-b">
                  <td className="p-2">{new Date(o.createdAt).toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="p-2 font-mono">{o.orderNumber}</td>
                  <td className="p-2">{o.type === "DINE_IN" ? "Lokal" : o.type === "TAKEAWAY" ? "Seboj" : "Dostava"}</td>
                  <td className="p-2">{o.table?.number || "—"}</td>
                  <td className="p-2">{o.user?.name || "—"}</td>
                  <td className="p-2">{o.items.length}</td>
                  <td className="p-2 text-right font-mono">{formatCurrency(Number(o.totalAmount))}</td>
                  <td className="p-2">
                    {o.payments.length > 0 ? (
                      <div className="flex gap-1">
                        {o.payments.map((p: any) => (
                          <Badge key={p.id} variant="outline" className="text-[10px]">
                            {p.method === "CASH" ? "GOT" : p.method === "CARD" ? "KRT" : "TRF"} {formatCurrency(Number(p.amount))}
                          </Badge>
                        ))}
                      </div>
                    ) : <span className="text-muted-foreground">Neplačano</span>}
                  </td>
                  <td className="p-2">
                    <Badge variant={o.status === "CLOSED" ? "default" : o.status === "CANCELLED" ? "destructive" : "secondary"}>
                      {o.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {report.orders.length === 0 && (
                <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">Ni naročil za ta dan</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
