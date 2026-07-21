"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Minus, Plus, Trash2, Banknote, CreditCard, ArrowRightLeft, Receipt, X, Percent, DollarSign, Undo2 } from "lucide-react"
import { getMenuCategories, getTables, createOrder, closeOrder } from "../actions"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface CartItem {
  menuItemId: string; name: string; basePrice: number; price: number; quantity: number;
  modifiers: { id: string; name: string; priceAdj: number }[];
  notes: string; discountType?: string; discountValue?: number;
}

export default function POSPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableId, setTableId] = useState("")
  const [orderType, setOrderType] = useState("DINE_IN")
  const [submitting, setSubmitting] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)
  const [lastCartSnapshot, setLastCartSnapshot] = useState<CartItem[]>([])

  const [showPayment, setShowPayment] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [showModifier, setShowModifier] = useState<string | null>(null)
  const [showDiscount, setShowDiscount] = useState<string | null>(null)
  const [showItemDiscount, setShowItemDiscount] = useState<number | null>(null)

  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [amountGiven, setAmountGiven] = useState("")
  const [tipAmount, setTipAmount] = useState("")
  const [splitPayments, setSplitPayments] = useState<{ method: string; amount: number }[]>([])
  const [splitMode, setSplitMode] = useState(false)

  const [orderDiscountType, setOrderDiscountType] = useState("PERCENT")
  const [orderDiscountValue, setOrderDiscountValue] = useState("")

  const [selectedMods, setSelectedMods] = useState<string[]>([])
  const [itemNotes, setItemNotes] = useState("")

  useEffect(() => {
    getMenuCategories().then(setCategories)
    getTables().then(setTables)
  }, [])

  function addToCart(item: any) {
    if (item.modifiers?.length > 0) {
      setShowModifier(item.id)
      setSelectedMods([])
      setItemNotes("")
      return
    }
    setCart(prev => [...prev, {
      menuItemId: item.id, name: item.name, basePrice: Number(item.price),
      price: Number(item.price), quantity: 1, modifiers: [], notes: "",
    }])
  }

  function addWithModifiers(item: any) {
    const mods = item.modifiers?.filter((m: any) => selectedMods.includes(m.id)) || []
    const modTotal = mods.reduce((s: number, m: any) => s + Number(m.priceAdj), 0)
    const price = Number(item.price) + modTotal
    setCart(prev => [...prev, {
      menuItemId: item.id, name: item.name, basePrice: Number(item.price),
      price, quantity: 1, modifiers: mods.map((m: any) => ({ id: m.id, name: m.name, priceAdj: Number(m.priceAdj) })),
      notes: itemNotes,
    }])
    setShowModifier(null)
  }

  function updateQty(idx: number, delta: number) {
    setCart(prev => prev.map((c, i) => i === idx ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0))
  }

  function removeItem(idx: number) { setCart(prev => prev.filter((_, i) => i !== idx)) }

  function applyItemDiscount(idx: number, type: string, value: number) {
    setCart(prev => prev.map((c, i) => i === idx ? { ...c, discountType: type, discountValue: value } : c))
    setShowItemDiscount(null)
  }

  const subtotal = cart.reduce((sum, c) => {
    let lineTotal = c.price * c.quantity
    if (c.discountType === "PERCENT") lineTotal -= lineTotal * ((c.discountValue || 0) / 100)
    else if (c.discountType === "FIXED") lineTotal -= (c.discountValue || 0) * c.quantity
    return sum + lineTotal
  }, 0)

  let orderDiscount = 0
  if (orderDiscountType === "PERCENT" && orderDiscountValue) orderDiscount = subtotal * (parseFloat(orderDiscountValue) / 100)
  else if (orderDiscountType === "FIXED" && orderDiscountValue) orderDiscount = parseFloat(orderDiscountValue)

  const afterDiscount = subtotal - orderDiscount
  const ddv = afterDiscount * 0.22
  const totalGross = afterDiscount + ddv

  const totalSplit = splitPayments.reduce((s, p) => s + p.amount, 0)
  const remainingSplit = totalGross - totalSplit
  const tip = parseFloat(tipAmount) || 0

  async function submitOrder() {
    if (cart.length === 0) return toast.error("Košarica je prazna")
    setSubmitting(true)
    try {
      const order = await createOrder({
        items: cart.map(c => ({
          menuItemId: c.menuItemId, quantity: c.quantity,
          modifiers: c.modifiers.map(m => m.id), notes: c.notes || undefined,
          discountType: c.discountType, discountValue: c.discountValue,
        })),
        tableId: tableId || undefined, type: orderType, propertyId: "demo-property", userId: "demo-user",
      })
      if (orderDiscountValue && parseFloat(orderDiscountValue) > 0) {
        const { applyOrderDiscount } = await import("../actions")
        await applyOrderDiscount(order.id, orderDiscountType, parseFloat(orderDiscountValue))
      }
      setLastOrderId(order.id)
      setLastCartSnapshot([...cart])
      toast.success("Naročilo oddano!")
      setCart([])
    } catch (err: any) { toast.error(err.message || "Napaka") }
    finally { setSubmitting(false) }
  }

  function openPayment() {
    if (!lastOrderId) return toast.error("Najprej oddaj naročilo")
    setSplitPayments([])
    setSplitMode(false)
    setAmountGiven(String(Math.ceil(totalGross)))
    setPaymentMethod("CASH")
    setShowPayment(true)
  }

  function addSplitPayment(method: string) {
    const amount = method === "CASH" ? (parseFloat(amountGiven) || remainingSplit) : remainingSplit
    if (amount <= 0 || remainingSplit <= 0) return
    setSplitPayments(prev => [...prev, { method, amount: Math.min(amount, remainingSplit) }])
    setAmountGiven("")
  }

  async function processPayment() {
    if (!lastOrderId) return
    setSubmitting(true)
    try {
      let payments: { method: string; amount: number }[]
      if (splitMode && splitPayments.length > 0) {
        payments = splitPayments
        const remaining = totalGross - totalSplit
        if (remaining > 0.01) payments.push({ method: "CASH", amount: remaining })
      } else {
        const amount = paymentMethod === "CASH" ? (parseFloat(amountGiven) || totalGross) : totalGross
        payments = [{ method: paymentMethod, amount }]
        if (tip > 0 && paymentMethod === "CASH") {
          payments[0].amount += tip
        }
      }

      await closeOrder(lastOrderId, payments)

      if (tip > 0) {
        const { addTip } = await import("../actions")
        await addTip(lastOrderId, tip, splitMode ? "CASH" : paymentMethod)
      }

      setReceiptData({
        items: lastCartSnapshot, subtotal, orderDiscount, ddv, total: totalGross, tip,
        payments, splitMode, date: new Date().toLocaleString("sl-SI"),
        orderNumber: `ORD-${Date.now()}`,
      })
      setShowPayment(false)
      setShowReceipt(true)
      setLastOrderId(null)
      setLastCartSnapshot([])
      setCart([])
      setTableId("")
      setSplitPayments([])
      setTipAmount("")
      setOrderDiscountValue("")
      toast.success("Plačilo uspešno!")
    } catch (err: any) { toast.error(err.message || "Napaka") }
    finally { setSubmitting(false) }
  }

  const modItem = categories.flatMap((c: any) => c.items || []).find((i: any) => i.id === showModifier)
  const discItem = showItemDiscount !== null ? cart[showItemDiscount] : null

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left: Menu */}
      <div className="flex-1 overflow-auto space-y-4">
        {categories.map((cat: any) => (
          <div key={cat.id}>
            <h3 className="font-semibold mb-2">{cat.name}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {cat.items?.map((item: any) => (
                <Button key={item.id} variant="outline" className="h-auto py-3 text-left justify-start"
                  onClick={() => addToCart(item)}>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(Number(item.price))}
                      {item.modifiers?.length > 0 && <span className="ml-1">+mod</span>}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
        {categories.length === 0 && <div className="text-center text-muted-foreground py-12">Ni artiklov v meniju</div>}
      </div>

      {/* Right: Cart */}
      <div className="w-96 flex flex-col border rounded-lg bg-card">
        <div className="p-4 border-b space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Košarica</h3>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowDiscount("order")}>
                <Percent className="h-3 w-3 mr-1" /> Popust
              </Button>
            )}
          </div>
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
                {tables.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.number}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {cart.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Prazna košarica</p>}
          {cart.map((item, idx) => {
            let lineTotal = item.price * item.quantity
            if (item.discountType === "PERCENT") lineTotal -= lineTotal * ((item.discountValue || 0) / 100)
            else if (item.discountType === "FIXED") lineTotal -= (item.discountValue || 0) * item.quantity

            return (
              <div key={idx} className="border rounded-lg p-2 text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-1">
                      {item.name}
                      {item.discountType && <Badge variant="secondary" className="text-[10px] h-4">-{item.discountType === "PERCENT" ? `${item.discountValue}%` : formatCurrency(item.discountValue || 0)}</Badge>}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(lineTotal)}
                    </div>
                    {item.modifiers.length > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        {item.modifiers.map(m => m.name).join(", ")}
                      </div>
                    )}
                    {item.notes && <div className="text-[10px] text-muted-foreground italic">{item.notes}</div>}
                  </div>
                  <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => updateQty(idx, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-5 text-center text-xs">{item.quantity}</span>
                  <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => updateQty(idx, 1)}><Plus className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setShowItemDiscount(idx)}><DollarSign className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => removeItem(idx)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t space-y-1 text-sm">
          <div className="flex justify-between"><span>Neto</span><span>{formatCurrency(subtotal)}</span></div>
          {orderDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Popust {orderDiscountType === "PERCENT" ? `${orderDiscountValue}%` : ""}</span>
              <span>-{formatCurrency(orderDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between"><span>DDV (22%)</span><span>{formatCurrency(ddv)}</span></div>
          {tip > 0 && <div className="flex justify-between text-green-600"><span>Napitnina</span><span>+{formatCurrency(tip)}</span></div>}
          <Separator className="my-1" />
          <div className="flex justify-between text-lg font-bold"><span>Skupaj</span><span>{formatCurrency(totalGross)}</span></div>

          {lastOrderId ? (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={openPayment}><Banknote className="h-4 w-4 mr-1" /> Plačaj</Button>
              <Button variant="outline" onClick={() => { setLastOrderId(null); setCart([]) }}><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <Button className="w-full" onClick={submitOrder} disabled={submitting || cart.length === 0}>
              {submitting ? "Pošiljam..." : "Oddaj naročilo"}
            </Button>
          )}
        </div>
      </div>

      {/* Modifier Dialog */}
      <Dialog open={!!showModifier} onOpenChange={() => setShowModifier(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{modItem?.name} — Modiferji</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {modItem?.modifiers?.map((m: any) => (
              <label key={m.id} className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input type="checkbox" checked={selectedMods.includes(m.id)}
                  onChange={(e) => setSelectedMods(prev => e.target.checked ? [...prev, m.id] : prev.filter(id => id !== m.id))} />
                <span className="flex-1 text-sm">{m.name}</span>
                <span className="text-xs text-muted-foreground">{Number(m.priceAdj) > 0 ? `+${formatCurrency(Number(m.priceAdj))}` : "brezplačno"}</span>
              </label>
            ))}
            <div className="space-y-2">
              <Label>Opombe</Label>
              <Input value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} placeholder="npr. brez čebule..." />
            </div>
            <Button className="w-full" onClick={() => addWithModifiers(modItem)}>Dodaj v košarico</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Discount Dialog */}
      <Dialog open={showDiscount === "order"} onOpenChange={() => setShowDiscount(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Popust na naročilo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={orderDiscountType === "PERCENT" ? "default" : "outline"} className="flex-1" onClick={() => setOrderDiscountType("PERCENT")}>%</Button>
              <Button variant={orderDiscountType === "FIXED" ? "default" : "outline"} className="flex-1" onClick={() => setOrderDiscountType("FIXED")}>€</Button>
            </div>
            <Input type="number" value={orderDiscountValue} onChange={(e) => setOrderDiscountValue(e.target.value)}
              placeholder={orderDiscountType === "PERCENT" ? "npr. 10" : "npr. 5.00"} />
            <div className="flex justify-between text-sm font-bold">
              <span>Popust:</span><span>-{formatCurrency(orderDiscount)}</span>
            </div>
            <Button className="w-full" onClick={() => setShowDiscount(null)}>Potrdi</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Discount Dialog */}
      <Dialog open={showItemDiscount !== null} onOpenChange={() => setShowItemDiscount(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Popust: {discItem?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { applyItemDiscount(showItemDiscount!, "PERCENT", 10); setShowDiscount(null) }}>-10%</Button>
              <Button variant="outline" onClick={() => { applyItemDiscount(showItemDiscount!, "PERCENT", 20); setShowDiscount(null) }}>-20%</Button>
              <Button variant="outline" onClick={() => { applyItemDiscount(showItemDiscount!, "FIXED", 1); setShowDiscount(null) }}>-1€</Button>
              <Button variant="outline" onClick={() => { applyItemDiscount(showItemDiscount!, "FIXED", 2); setShowDiscount(null) }}>-2€</Button>
            </div>
            <Button variant="destructive" className="w-full" onClick={() => {
              if (showItemDiscount !== null) { setCart(prev => prev.map((c, i) => i === showItemDiscount ? { ...c, discountType: undefined, discountValue: undefined } : c)); setShowItemDiscount(null) }
            }}>Odstrani popust</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Plačilo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Za plačilo</div>
              <div className="text-3xl font-bold">{formatCurrency(totalGross)}</div>
            </div>

            {!splitMode && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "CASH", label: "Gotovina", icon: Banknote, color: "bg-green-100 border-green-300 dark:bg-green-950" },
                  { value: "CARD", label: "Kartica", icon: CreditCard, color: "bg-blue-100 border-blue-300 dark:bg-blue-950" },
                  { value: "TRANSFER", label: "Predračun", icon: ArrowRightLeft, color: "bg-purple-100 border-purple-300 dark:bg-purple-950" },
                ].map(m => (
                  <Button key={m.value} variant="outline" className={`h-20 flex-col gap-1 ${paymentMethod === m.value ? "ring-2 ring-primary" : ""} ${m.color}`}
                    onClick={() => setPaymentMethod(m.value)}>
                    <m.icon className="h-5 w-5" /><span className="text-xs">{m.label}</span>
                  </Button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input type="checkbox" id="splitCheck" checked={splitMode} onChange={(e) => setSplitMode(e.target.checked)} />
              <label htmlFor="splitCheck" className="text-sm cursor-pointer">Deljeno plačilo</label>
            </div>

            {splitMode ? (
              <div className="space-y-2">
                {splitPayments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                    <span>{p.method === "CASH" ? "Gotovina" : p.method === "CARD" ? "Kartica" : "Predračun"}</span>
                    <span className="font-mono">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
                <div className="text-sm font-bold flex justify-between">
                  <span>Preostalo:</span><span>{formatCurrency(Math.max(0, remainingSplit))}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => addSplitPayment("CASH")} disabled={remainingSplit <= 0}>
                    <Banknote className="h-4 w-4 mr-1" /> Gotovina
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => addSplitPayment("CARD")} disabled={remainingSplit <= 0}>
                    <CreditCard className="h-4 w-4 mr-1" /> Kartica
                  </Button>
                </div>
              </div>
            ) : paymentMethod === "CASH" ? (
              <div className="space-y-2">
                <Input type="number" value={amountGiven} onChange={(e) => setAmountGiven(e.target.value)} className="text-center text-lg" placeholder="Vneseni znesek" />
                {parseFloat(amountGiven) >= totalGross && (
                  <div className="text-center text-green-600 font-bold">Vračilo: {formatCurrency((parseFloat(amountGiven) || 0) - totalGross)}</div>
                )}
                <div className="flex gap-2">
                  {[5, 10, 20, 50].map(v => (
                    <Button key={v} variant="outline" size="sm" className="flex-1" onClick={() => setAmountGiven(String(v))}>{v}€</Button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Napitnina</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 5].map(v => (
                  <Button key={v} variant={tipAmount === String(v) ? "default" : "outline"} size="sm" className="flex-1"
                    onClick={() => setTipAmount(String(v))}>{v === 0 ? "Brez" : `${v}€`}</Button>
                ))}
              </div>
              <Input type="number" value={tipAmount} onChange={(e) => setTipAmount(e.target.value)} placeholder="Poljuben znesek" className="text-sm" />
            </div>

            <Button className="w-full text-lg h-12" onClick={processPayment} disabled={submitting || (splitMode ? remainingSplit > 0.01 : false)}>
              <Receipt className="h-5 w-5 mr-2" />
              {submitting ? "Obdelava..." : `Plačaj ${formatCurrency(totalGross + tip)}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Račun</DialogTitle></DialogHeader>
          <div className="font-mono text-sm space-y-2 border rounded-lg p-4 bg-white dark:bg-gray-950">
            <div className="text-center font-bold text-lg">TURIST D.O.O.</div>
            <div className="text-center text-xs text-muted-foreground">Cesta 1, 1000 Ljubljana</div>
            <div className="text-center text-xs text-muted-foreground">SI12345678</div>
            <Separator />
            <div className="text-center text-xs">{receiptData?.orderNumber}</div>
            <div className="text-center text-xs text-muted-foreground">{receiptData?.date}</div>
            <Separator />
            {receiptData?.items?.map((i: CartItem, idx: number) => {
              let lt = i.price * i.quantity
              if (i.discountType === "PERCENT") lt -= lt * ((i.discountValue || 0) / 100)
              else if (i.discountType === "FIXED") lt -= (i.discountValue || 0) * i.quantity
              return (
                <div key={idx} className="text-xs space-y-0.5">
                  <div className="flex justify-between"><span>{i.quantity}× {i.name}</span><span>{formatCurrency(lt)}</span></div>
                  {i.modifiers.map((m, mi) => <div key={mi} className="pl-4 text-muted-foreground">  {m.name} {Number(m.priceAdj) > 0 ? `+${formatCurrency(Number(m.priceAdj))}` : ""}</div>)}
                  {i.notes && <div className="pl-4 text-muted-foreground italic">  {i.notes}</div>}
                </div>
              )
            })}
            <Separator />
            <div className="flex justify-between text-xs"><span>Neto:</span><span>{formatCurrency(receiptData?.subtotal || 0)}</span></div>
            {(receiptData?.orderDiscount || 0) > 0 && <div className="flex justify-between text-xs text-green-600"><span>Popust:</span><span>-{formatCurrency(receiptData.orderDiscount)}</span></div>}
            <div className="flex justify-between text-xs"><span>DDV 22%:</span><span>{formatCurrency(receiptData?.ddv || 0)}</span></div>
            {(receiptData?.tip || 0) > 0 && <div className="flex justify-between text-xs"><span>Napitnina:</span><span>+{formatCurrency(receiptData.tip)}</span></div>}
            <Separator />
            <div className="flex justify-between font-bold"><span>SKUPAJ:</span><span>{formatCurrency(receiptData?.total || 0)}</span></div>
            {receiptData?.payments?.map((p: any, i: number) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{p.method === "CASH" ? "GOTOVINA" : p.method === "CARD" ? "KARTICA" : "PREDRAČUN"}</span>
                <span>{formatCurrency(p.amount)}</span>
              </div>
            ))}
            <Separator />
            <div className="text-center text-xs text-muted-foreground pt-2">
              Hvala za obisk! PVS-{Date.now()}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>Tiskaj</Button>
            <Button className="flex-1" onClick={() => setShowReceipt(false)}>Zapri</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
