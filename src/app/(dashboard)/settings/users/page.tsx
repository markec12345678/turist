"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { getUsers } from "../actions"

const roleLabels: Record<string, string> = { ADMIN: "Administrator", RECEPTIONIST: "Receptor", CHEF: "Kuhar", WAITER: "Natakar", CLEANER: "Čistilka", CASHIER: "Blagajnik", MANAGER: "Upravnik" }

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  useEffect(() => { getUsers().then(setUsers) }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Uporabniki</h1>
        <Link href="/settings/users/new"><Button><Plus className="mr-2 h-4 w-4" /> Nov uporabnik</Button></Link>
      </div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Ime</TableHead><TableHead>Email</TableHead><TableHead>Vloga</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell><Link href={`/settings/users/${u.id}`} className="text-primary hover:underline">{u.name}</Link></TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant="outline">{roleLabels[u.role] || u.role}</Badge></TableCell>
                <TableCell><Badge variant={u.isActive ? "default" : "secondary"}>{u.isActive ? "Aktiven" : "Neaktiven"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  )
}
