"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createMenuCategory } from "../../../actions"
import { toast } from "sonner"

export default function NewCategoryPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sortOrder, setSortOrder] = useState(0)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createMenuCategory({ name, description, sortOrder, propertyId: "demo-property" })
      toast.success("Kategorija ustvarjena")
      router.push("/restaurant/menu")
    } catch { toast.error("Napaka") }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Nova kategorija</h1>
      <Card>
        <CardHeader><CardTitle>Podatki</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Ime *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Opis</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="space-y-2"><Label>Vrstni red</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
            <div className="flex gap-2"><Button type="submit">Shrani</Button><Button type="button" variant="outline" onClick={() => router.back()}>Prekliči</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
