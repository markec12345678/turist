"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { getMenuCategories } from "../actions"

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => { getMenuCategories().then(setCategories) }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Meni</h1>
        <div className="flex gap-2">
          <Link href="/restaurant/menu/categories/new"><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Kategorija</Button></Link>
          <Link href="/restaurant/menu/items/new"><Button><Plus className="mr-2 h-4 w-4" /> Artikel</Button></Link>
        </div>
      </div>
      {categories.map((cat) => (
        <Card key={cat.id}>
          <CardHeader><CardTitle>{cat.name}</CardTitle></CardHeader>
          <CardContent>
            {cat.items.length === 0 ? <p className="text-muted-foreground text-sm">Ni artiklov</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Ime</TableHead><TableHead>Cena</TableHead><TableHead>Alergeni</TableHead><TableHead>Postaja</TableHead></TableRow></TableHeader>
                <TableBody>
                  {cat.items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>€{Number(item.price).toFixed(2)}</TableCell>
                      <TableCell>{(item.allergens || []).join(", ") || "-"}</TableCell>
                      <TableCell><Badge variant="outline">{item.kitchenStation || "-"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
