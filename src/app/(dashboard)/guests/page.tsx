"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getGuests } from "./actions"

export default function GuestsPage() {
  const [guests, setGuests] = useState<Array<{ id: string; firstName: string; lastName: string; email: string | null; phone: string | null; country: string | null; createdAt: Date }>>([])
  const [search, setSearch] = useState("")

  useEffect(() => { getGuests(search).then(setGuests) }, [search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gostje</h1>
        <Link href="/guests/new"><Button><Plus className="mr-2 h-4 w-4" /> Nov gost</Button></Link>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Iskanje gostov..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Ime</TableHead><TableHead>Email</TableHead><TableHead>Telefon</TableHead><TableHead>Država</TableHead><TableHead>Ustvarjeno</TableHead></TableRow></TableHeader>
            <TableBody>
              {guests.map((g) => (
                <TableRow key={g.id}>
                  <TableCell><Link href={`/guests/${g.id}`} className="text-primary hover:underline">{g.firstName} {g.lastName}</Link></TableCell>
                  <TableCell>{g.email || "-"}</TableCell>
                  <TableCell>{g.phone || "-"}</TableCell>
                  <TableCell>{g.country || "-"}</TableCell>
                  <TableCell>{formatDate(g.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
