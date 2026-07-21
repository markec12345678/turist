"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Package, Plus, AlertTriangle, ArrowDownCircle, ArrowUpCircle, MinusCircle, Trash2, Edit } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import {
  getIngredients, createIngredient, updateIngredient, deleteIngredient,
  getInventoryCategories, createInventoryCategory,
  addStockMovement, getLowStockItems,
} from "./actions"

const UNITS = ["KG", "G", "L", "ML", "KOS", "PACK", "PALET"]

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [showCategory, setShowCategory] = useState(false)
  const [showMovement, setShowMovement] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [catName, setCatName] = useState("")

  const [form, setForm] = useState({ name: "", unit: "KG", currentStock: "0", minStock: "0", costPerUnit: "0", categoryId: "" })
  const [movForm, setMovForm] = useState({ type: "RECEIPT", quantity: "", unitCost: "", notes: "" })

  async function load() {
    const [i, c, l] = await Promise.all([getIngredients(), getInventoryCategories(), getLowStockItems()])
    setIngredients(i); setCategories(c); setLowStock(l)
  }
  useEffect(() => { load() }, [])

  async function handleSave() {
    try {
      const data = {
        name: form.name, unit: form.unit, currentStock: parseFloat(form.currentStock) || 0,
        minStock: parseFloat(form.minStock) || 0, costPerUnit: parseFloat(form.costPerUnit) || 0,
        categoryId: form.categoryId || undefined,
      }
      if (editing) {
        await updateIngredient(editing, data)
        toast.success("Sestavina posodobljena")
      } else {
        await createIngredient({ ...data, propertyId: "demo-property" })
        toast.success("Sestavina dodana")
      }
      setShowNew(false); setEditing(null)
      setForm({ name: "", unit: "KG", currentStock: "0", minStock: "0", costPerUnit: "0", categoryId: "" })
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Izbrišem sestavino?")) return
    await deleteIngredient(id); toast.success("Izbrisano"); load()
  }

  async function handleMovement() {
    if (!showMovement) return
    try {
      await addStockMovement({
        type: movForm.type, quantity: parseFloat(movForm.quantity) || 0,
        unitCost: movForm.unitCost ? parseFloat(movForm.unitCost) : undefined,
        notes: movForm.notes, ingredientId: showMovement,
      })
      toast.success("Premik zabeležen")
      setShowMovement(null)
      setMovForm({ type: "RECEIPT", quantity: "", unitCost: "", notes: "" })
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  async function handleAddCategory() {
    if (!catName.trim()) return
    await createInventoryCategory({ name: catName, propertyId: "demo-property" })
    setCatName(""); setShowCategory(false); load()
  }

  function startEdit(ing: any) {
    setEditing(ing.id)
    setForm({ name: ing.name, unit: ing.unit, currentStock: String(ing.currentStock), minStock: String(ing.minStock), costPerUnit: String(ing.costPerUnit), categoryId: ing.categoryId || "" })
    setShowNew(true)
  }

  const filtered = filter === "all" ? ingredients : filter === "low" ? lowStock : ingredients.filter((i) => i.categoryId === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6" /> Inventar</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCategory(true)}><Plus className="h-4 w-4 mr-1" /> Kategorija</Button>
          <Button onClick={() => { setEditing(null); setForm({ name: "", unit: "KG", currentStock: "0", minStock: "0", costPerUnit: "0", categoryId: "" }); setShowNew(true) }}>
            <Plus className="h-4 w-4 mr-1" /> Nova sestavina
          </Button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-4 w-4" /> Nizka zaloga ({lowStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStock.map((i) => (
                <Badge key={i.id} variant="outline" className="text-orange-700 border-orange-300">
                  {i.name}: {i.currentStock} {i.unit} (min: {i.minStock})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Vse ({ingredients.length})</SelectItem>
            <SelectItem value="low">Nizka zaloga ({lowStock.length})</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.ingredients.length})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Ime</th>
                <th className="text-left p-3 font-medium">Kategorija</th>
                <th className="text-right p-3 font-medium">Zaloga</th>
                <th className="text-right p-3 font-medium">Min. zaloga</th>
                <th className="text-right p-3 font-medium">Cena/enoto</th>
                <th className="text-center p-3 font-medium">Vrednost</th>
                <th className="text-right p-3 font-medium">Dejanja</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const isLow = Number(i.currentStock) <= Number(i.minStock)
                return (
                  <tr key={i.id} className={`border-b ${isLow ? "bg-orange-50 dark:bg-orange-950/30" : ""}`}>
                    <td className="p-3 font-medium flex items-center gap-2">
                      {i.name}
                      {isLow && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                    </td>
                    <td className="p-3 text-muted-foreground">{i.category?.name || "—"}</td>
                    <td className="p-3 text-right font-mono">{Number(i.currentStock).toFixed(1)} {i.unit}</td>
                    <td className="p-3 text-right font-mono text-muted-foreground">{Number(i.minStock).toFixed(1)}</td>
                    <td className="p-3 text-right font-mono">{formatCurrency(Number(i.costPerUnit))}</td>
                    <td className="p-3 text-center font-mono">{formatCurrency(Number(i.currentStock) * Number(i.costPerUnit))}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setShowMovement(i.id) }}>
                          <ArrowDownCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(i)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(i.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Ni sestavin</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* New/Edit Ingredient Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Uredi sestavino" : "Nova sestavina"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ime</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="npr. Močna moka" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Enota</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select value={form.categoryId || "none"} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Brez" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Brez</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Trenutna zaloga</Label>
                <Input type="number" step="0.1" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Min. zaloga</Label>
                <Input type="number" step="0.1" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cena/enoto</Label>
                <Input type="number" step="0.01" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSave}>{editing ? "Posodobi" : "Dodaj"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategory} onOpenChange={setShowCategory}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova kategorija inventarja</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ime kategorije" />
            <Button className="w-full" onClick={handleAddCategory}>Dodaj</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={!!showMovement} onOpenChange={() => setShowMovement(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Knjiženje premika zaloge</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vrsta</Label>
              <div className="flex gap-2">
                {[
                  { value: "RECEIPT", label: "Prejem", icon: ArrowDownCircle, color: "text-green-600" },
                  { value: "CONSUMPTION", label: "Poraba", icon: MinusCircle, color: "text-red-600" },
                  { value: "ADJUSTMENT", label: "Prilagoditev", icon: ArrowUpCircle, color: "text-blue-600" },
                ].map((t) => (
                  <Button key={t.value} variant={movForm.type === t.value ? "default" : "outline"} className="flex-1"
                    onClick={() => setMovForm({ ...movForm, type: t.value })}>
                    <t.icon className={`h-4 w-4 mr-1 ${t.color}`} /> {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Količina</Label>
                <Input type="number" step="0.1" value={movForm.quantity} onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cena/enoto</Label>
                <Input type="number" step="0.01" value={movForm.unitCost} onChange={(e) => setMovForm({ ...movForm, unitCost: e.target.value })} placeholder="Opcijsko" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Opombe</Label>
              <Input value={movForm.notes} onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })} placeholder="npr. Dostava dobavitelja X" />
            </div>
            <Button className="w-full" onClick={handleMovement}>Potrdi premik</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
