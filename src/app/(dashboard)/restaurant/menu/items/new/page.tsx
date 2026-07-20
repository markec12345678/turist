"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createMenuItem } from "../../../actions"
import { toast } from "sonner"

export default function NewMenuItemPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [allergens, setAllergens] = useState("")
  const [kitchenStation, setKitchenStation] = useState("")
  const [categoryId, setCategoryId] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createMenuItem({ name, description, price, allergens: allergens.split(",").map((a) => a.trim()).filter(Boolean), kitchenStation, categoryId })
      toast.success("Artikel ustvarjen")
      router.push("/restaurant/menu")
    } catch { toast.error("Napaka") }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Nov artikel</h1>
      <Card>
        <CardHeader><CardTitle>Podatki</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Ime *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Opis</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cena (neto) *</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required /></div>
              <div className="space-y-2"><Label>Kategorija ID *</Label><Input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label>Alergeni (ločeno z vejico)</Label><Input value={allergens} onChange={(e) => setAllergens(e.target.value)} placeholder="mleko, gluten, jajca" /></div>
            <div className="space-y-2"><Label>Kuhinjska postaja</Label><Input value={kitchenStation} onChange={(e) => setKitchenStation(e.target.value)} placeholder="TOPLOTNO" /></div>
            <div className="flex gap-2"><Button type="submit">Shrani</Button><Button type="button" variant="outline" onClick={() => router.back()}>Prekliči</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
