"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Banknote, CreditCard, ArrowRightLeft, LogIn, LogOut, AlertTriangle, Receipt } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { getOpenShift, openShift, getShiftSummary, closeShift, getCashRegisters } from "./actions"

export default function ShiftsPage() {
  const [currentShift, setCurrentShift] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [registers, setRegisters] = useState<any[]>([])
  const [showOpen, setShowOpen] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [openingBalance, setOpeningBalance] = useState("200")
  const [closingBalance, setClosingBalance] = useState("")
  const [selectedRegister, setSelectedRegister] = useState("")
  const [loading, setLoading] = useState(false)

  async function load() {
    const [s, r] = await Promise.all([getOpenShift("demo-user"), getCashRegisters()])
    setCurrentShift(s)
    setRegisters(r)
    if (r.length > 0 && !selectedRegister) setSelectedRegister(r[0].id)
    if (s) {
      const sum = await getShiftSummary(s.id)
      setSummary(sum)
    }
  }

  useEffect(() => { load() }, [])

  async function handleOpen() {
    setLoading(true)
    try {
      await openShift({ cashRegisterId: selectedRegister, userId: "demo-user", openingBalance: parseFloat(openingBalance) || 0 })
      toast.success("Izmena odprta!")
      setShowOpen(false)
      load()
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
  }

  async function handleClose() {
    setLoading(true)
    try {
      const balance = parseFloat(closingBalance) || 0
      const result = await closeShift(currentShift.id, balance)
      if (Math.abs(result.discrepancy || 0) > 0.01) {
        toast.warning(`Razlika: ${formatCurrency(Number(result.discrepancy))}`)
      } else {
        toast.success("Izmena zaključena!")
      }
      setShowClose(false)
      setCurrentShift(null)
      setSummary(null)
      load()
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6" /> Izmene</h1>
        {currentShift ? (
          <Button variant="destructive" onClick={() => { setClosingBalance(""); setShowClose(true) }}>
            <LogOut className="h-4 w-4 mr-1" /> Zaključi izmeno
          </Button>
        ) : (
          <Button onClick={() => setShowOpen(true)}><LogIn className="h-4 w-4 mr-1" /> Odpri izmeno</Button>
        )}
      </div>

      {currentShift ? (
        <div className="space-y-4">
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Clock className="h-5 w-5" /> Tekoča izmena
                <Badge variant="outline" className="ml-auto">ODPRTA</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Blagajna</div>
                  <div className="font-medium">{currentShift.cashRegister?.name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Odprta ob</div>
                  <div className="font-medium">{new Date(currentShift.openedAt).toLocaleString("sl-SI")}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Začetno stanje</div>
                  <div className="font-medium">{formatCurrency(Number(currentShift.openingBalance))}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Trajanje</div>
                  <div className="font-medium">
                    {Math.floor((Date.now() - new Date(currentShift.openedAt).getTime()) / 3600000)}h
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {summary && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Gotovina</div>
                    <div className="text-xl font-bold text-green-600">{formatCurrency(summary.cashSales)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Kartica</div>
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(summary.cardSales)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Transfer</div>
                    <div className="text-xl font-bold text-purple-600">{formatCurrency(summary.transferSales)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Skupaj</div>
                    <div className="text-xl font-bold">{formatCurrency(summary.totalSales)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Naročila</div>
                    <div className="text-xl font-bold">{summary.orderCount}</div>
                  </CardContent>
                </Card>
              </div>

              {summary.tips > 0 && (
                <Card>
                  <CardContent className="p-4 flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Napitnine:</span>
                    <span className="font-bold">{formatCurrency(summary.tips)}</span>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Top artikli izmene</CardTitle></CardHeader>
                <CardContent>
                  {summary.topItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ni prodaje</p>
                  ) : (
                    <div className="space-y-1">
                      {summary.topItems.map((item: any) => (
                        <div key={item.name} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <div className="flex gap-3">
                            <span className="text-muted-foreground">{item.qty}×</span>
                            <span className="font-medium">{formatCurrency(item.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Ni odprte izmene</p>
            <p className="text-sm mt-1">Odpri izmeno za začetek dela</p>
          </CardContent>
        </Card>
      )}

      {/* Open Shift Dialog */}
      <Dialog open={showOpen} onOpenChange={setShowOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Odpri izmeno</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Blagajna</Label>
              <Select value={selectedRegister} onValueChange={setSelectedRegister}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {registers.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Začetno stanje gotovine</Label>
              <Input type="number" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleOpen} disabled={loading}>
              <LogIn className="h-4 w-4 mr-1" /> Odpri izmeno
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={showClose} onOpenChange={setShowClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Zaključek izmene</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {summary && (
              <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-muted rounded-lg">
                <div><span className="text-muted-foreground">Gotovina prodaje:</span> <span className="font-bold">{formatCurrency(summary.cashSales)}</span></div>
                <div><span className="text-muted-foreground">Začetno stanje:</span> <span className="font-bold">{formatCurrency(Number(currentShift?.openingBalance || 0))}</span></div>
                <div><span className="text-muted-foreground">Pričakovana gotovina:</span> <span className="font-bold">{formatCurrency(Number(currentShift?.openingBalance || 0) + summary.cashSales)}</span></div>
                <div><span className="text-muted-foreground">Refundacije:</span> <span className="font-bold text-red-600">{formatCurrency(summary.refunds)}</span></div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Dejansko stanje gotovine v blagajni</Label>
              <Input type="number" step="0.01" value={closingBalance} onChange={(e) => setClosingBalance(e.target.value)}
                placeholder="Preštej gotovino in vnesi znesek" className="text-lg" />
            </div>

            {closingBalance && summary && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                Math.abs(parseFloat(closingBalance) - (Number(currentShift?.openingBalance || 0) + summary.cashSales)) < 0.01
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              }`}>
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Razlika: {formatCurrency(parseFloat(closingBalance) - (Number(currentShift?.openingBalance || 0) + summary.cashSales))}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowClose(false)}>Prekliči</Button>
              <Button variant="destructive" className="flex-1" onClick={handleClose} disabled={loading || !closingBalance}>
                <LogOut className="h-4 w-4 mr-1" /> Zaključi izmeno
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
