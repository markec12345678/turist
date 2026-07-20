"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2 } from "lucide-react"
import { getTables, createOrder } from "../actions"
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

  useEffect(() => {
    import("../actions").then(({ getMenuCategories, getTables: gt }) => {
      getMenuCategories().then(setCategories)
      gt().then(setTables)
    })
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
      await createOrder({
        items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
        tableId: tableId || undefined, type: orderType, propertyId: "demo-property", userId: "demo-user",
      })
      toast.success("Naročilo oddano!")
      setCart([])
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
                  <div><div className="font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{formatCurrency(Number(item.price))}</div></div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right: Cart */}
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
            <Select value={tableId} onValueChange={(v) => setTableId(v ?? "")}>
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
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem(item.menuItemId)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t space-y-2">
          <div className="flex justify-between text-sm"><span>Neto</span><span>{formatCurrency(totalNet)}</span></div>
          <div className="flex justify-between text-sm"><span>DDV (22%)</span><span>{formatCurrency(ddv)}</span></div>
          <div className="flex justify-between font-bold"><span>Skupaj</span><span>{formatCurrency(totalGross)}</span></div>
          <Button className="w-full" onClick={submitOrder} disabled={submitting || cart.length === 0}>
            {submitting ? "Pošiljam..." : "Oddaj naročilo"}
          </Button>
        </div>
      </div>
    </div>
  )
}
