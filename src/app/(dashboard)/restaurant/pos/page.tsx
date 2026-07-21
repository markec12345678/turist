"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Minus, Plus, Trash2, Banknote, CreditCard, ArrowRightLeft, Receipt, X } from "lucide-react"
import { getTables, createOrder, closeOrder, getMenuCategories } from "../actions"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface CartItem { menuItemId: string; name: string; price: number; quantity: number }

export default function POSPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableId, setTableId] = useState("")
  const [orderType, setOrderType] = useState("DINE_IN")
  const [submitting, setSubmitting] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [amountGiven, setAmountGiven] = useState("")

  useEffect(() => {
    getMenuCategories().then(setCategories)
    getTables().then(setTables)
  }, [])

  function addToCart(item: { id: string; name: string; price: number }) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id)
      if (existing) return prev.map((c) => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { menuItemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }]
    })
  }

  function updateQty(menuItemId: string, delta: number) {
    setCart((prev) => prev.map((c) => c.menuItemId === menuItemId ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter((c) => c.quantity > 0))
  }

  function removeItem(menuItemId: string) { setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId)) }

  const totalNet = cart.reduce((sum, c) => sum + c.price * c.quantity, 0)
  const ddv = totalNet * 0.22
  const totalGross = totalNet + ddv

  async function submitOrder() {
    if (cart.length === 0) return toast.error("Košarica je prazna")
    setSubmitting(true)
    try {
      const order = await createOrder({
        items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
        tableId: tableId || undefined, type: orderType, propertyId: "demo-property", userId: "demo-user",
      })
      setLastOrderId(order.id)
      toast.success("Naročilo oddano!")
      setCart([])
    } catch (err: any) { toast.error(err.message || "Napaka") }
    finally { setSubmitting(false) }
  }

  function openPayment() {
    if (!lastOrderId) return toast.error("Najprej oddaj naročilo")
    setShowPayment(true)
    setAmountGiven(String(Math.ceil(totalGross)))
  }

  async function processPayment() {
    if (!lastOrderId) return
    setSubmitting(true)
    try {
      const amount = paymentMethod === "CASH" ? parseFloat(amountGiven) || totalGross : totalGross
      await closeOrder(lastOrderId, [{ method: paymentMethod, amount }])
      setReceiptData({
        items: cart.length > 0 ? cart : undefined,
        total: totalGross,
        method: paymentMethod,
        amountGiven: paymentMethod === "CASH" ? amount : totalGross,
        change: paymentMethod === "CASH" ? Math.max(0, (parseFloat(amountGiven) || 0) - totalGross) : 0,
        orderNumber: `ORD-${Date.now()}`,
        date: new Date().toLocaleString("sl-SI"),
      })
      setShowPayment(false)
      setShowReceipt(true)
      setLastOrderId(null)
      setCart([])
      setTableId("")
      toast.success("Plačilo uspešno!")
    } catch (err: any) { toast.error(err.message || "Napaka") }
    finally { setSubmitting(false) }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left: Menu */}
      <div className="flex-1 overflow-auto space-y-4">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h3 className="font-semibold mb-2">{cat.name}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {cat.items?.map((item: any) => (
                <Button key={item.id} variant="outline" className="h-auto py-3 text-left justify-start" onClick={() => addToCart(item)}>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(Number(item.price))}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center text-muted-foreground py-12">Ni artiklov v meniju</div>
        )}
      </div>

      {/* Right: Cart + Payment */}
      <div className="w-80 flex flex-col border rounded-lg bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Košarica</h3>
          <div className="flex gap-2">
            <Select value={orderType} onValueChange={(v) => v && setOrderType(v)}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DINE_IN">V lokalu</SelectItem>
                <SelectItem value="TAKEAWAY">Za s seboj</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tableId || "none"} onValueChange={(v) => setTableId(v === "none" ? "" : v)}>
              <SelectTrigger className="w-20"><SelectValue placeholder="Miza" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Brez</SelectItem>
                {tables.map((t) => <SelectItem key={t.id} value={t.id}>{t.number}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {cart.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Prazna košarica</p>}
          {cart.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-2 text-sm">
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-muted-foreground">{formatCurrency(item.price)} × {item.quantity}</div>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQty(item.menuItemId, -1)}><Minus className="h-3 w-3" /></Button>
              <span className="w-6 text-center">{item.quantity}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQty(item.menuItemId, 1)}><Plus className="h-3 w-3" /></Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeItem(item.menuItemId)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t space-y-2">
          <div className="flex justify-between text-sm"><span>Neto</span><span>{formatCurrency(totalNet)}</span></div>
          <div className="flex justify-between text-sm"><span>DDV (22%)</span><span>{formatCurrency(ddv)}</span></div>
          <Separator className="my-1" />
          <div className="flex justify-between text-lg font-bold"><span>Skupaj</span><span>{formatCurrency(totalGross)}</span></div>

          {lastOrderId ? (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={openPayment}>
                <Banknote className="h-4 w-4 mr-1" /> Plačaj
              </Button>
              <Button variant="outline" onClick={() => { setLastOrderId(null); setCart([]) }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={submitOrder} disabled={submitting || cart.length === 0}>
              {submitting ? "Pošiljam..." : "Oddaj naročilo"}
            </Button>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Plačilo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Za plačilo</div>
              <div className="text-3xl font-bold">{formatCurrency(totalGross)}</div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "CASH", label: "Gotovina", icon: Banknote, color: "bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-950" },
                { value: "CARD", label: "Kartica", icon: CreditCard, color: "bg-blue-100 border-blue-300 hover:bg-blue-200 dark:bg-blue-950" },
                { value: "TRANSFER", label: "Predračun", icon: ArrowRightLeft, color: "bg-purple-100 border-purple-300 hover:bg-purple-200 dark:bg-purple-950" },
              ].map((m) => (
                <Button key={m.value} variant="outline" className={`h-20 flex-col gap-1 ${paymentMethod === m.value ? "ring-2 ring-primary" : ""} ${m.color}`}
                  onClick={() => setPaymentMethod(m.value)}>
                  <m.icon className="h-5 w-5" />
                  <span className="text-xs">{m.label}</span>
                </Button>
              ))}
            </div>

            {paymentMethod === "CASH" && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground text-center">Vneseno</div>
                <div className="flex gap-2">
                  <Input type="number" value={amountGiven} onChange={(e) => setAmountGiven(e.target.value)}
                    className="text-center text-lg" autoFocus />
                  <Button variant="outline" onClick={() => setAmountGiven(String(Math.ceil(totalGross)))}>Točno</Button>
                </div>
                {parseFloat(amountGiven) >= totalGross && (
                  <div className="text-center text-green-600 font-bold">
                    Vračilo: {formatCurrency((parseFloat(amountGiven) || 0) - totalGross)}
                  </div>
                )}
                <div className="flex gap-2">
                  {[5, 10, 20, 50].map((v) => (
                    <Button key={v} variant="outline" size="sm" className="flex-1"
                      onClick={() => setAmountGiven(String(v))}>{v}€</Button>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full text-lg h-12" onClick={processPayment} disabled={submitting}>
              <Receipt className="h-5 w-5 mr-2" />
              {submitting ? "Obdelava..." : `Plačaj ${formatCurrency(totalGross)}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Račun
            </DialogTitle>
          </DialogHeader>
          <div className="font-mono text-sm space-y-2 border rounded-lg p-4 bg-white dark:bg-gray-950">
            <div className="text-center font-bold text-lg">TURIST D.O.O.</div>
            <div className="text-center text-xs text-muted-foreground">Cesta 1, 1000 Ljubljana</div>
            <div className="text-center text-xs text-muted-foreground">Davčna številka: SI12345678</div>
            <Separator />
            <div className="text-center text-xs">Račun št: {receiptData?.orderNumber}</div>
            <div className="text-center text-xs text-muted-foreground">{receiptData?.date}</div>
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Artikel</span>
                <span>Kol. × Cena = Skupaj</span>
              </div>
              {receiptData?.items?.map((i: CartItem) => (
                <div key={i.menuItemId} className="flex justify-between text-xs">
                  <span className="flex-1 truncate">{i.name}</span>
                  <span>{i.quantity} × {formatCurrency(i.price)} = {formatCurrency(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between text-xs"><span>Neto:</span><span>{formatCurrency((receiptData?.total || 0) / 1.22)}</span></div>
            <div className="flex justify-between text-xs"><span>DDV 22%:</span><span>{formatCurrency((receiptData?.total || 0) - (receiptData?.total || 0) / 1.22)}</span></div>
            <Separator />
            <div className="flex justify-between font-bold"><span>SKUPAJ:</span><span>{formatCurrency(receiptData?.total || 0)}</span></div>
            <div className="flex justify-between text-xs">
              <span>Način plačila:</span>
              <span>{receiptData?.method === "CASH" ? "GOTOVINA" : receiptData?.method === "CARD" ? "KARTICA" : "PREDRAČUN"}</span>
            </div>
            {receiptData?.method === "CASH" && (
              <>
                <div className="flex justify-between text-xs"><span>Vneseno:</span><span>{formatCurrency(receiptData?.amountGiven)}</span></div>
                <div className="flex justify-between text-xs"><span>Vračilo:</span><span>{formatCurrency(receiptData?.change)}</span></div>
              </>
            )}
            <Separator />
            <div className="text-center text-xs text-muted-foreground pt-2">
              Hvala za obisk!<br />
              Davčno potrjevanje računov: <br />
              Številka: PVS-{Date.now()}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              <Receipt className="h-4 w-4 mr-1" /> Natisni
            </Button>
            <Button className="flex-1" onClick={() => setShowReceipt(false)}>Zapri</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
