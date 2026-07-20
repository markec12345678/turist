"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, ClipboardList } from "lucide-react"

const links = [
  { name: "Uporabniki", href: "/settings/users", icon: Users, description: "Upravljanje uporabnikov in vlog" },
  { name: "Podjetje", href: "/settings/company", icon: Building2, description: "Podatki o podjetju" },
  { name: "Revizija", href: "/settings/audit", icon: ClipboardList, description: "Revizijski dnevnik" },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Nastavitve</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4"><l.icon className="h-8 w-8 text-primary" /><CardTitle>{l.name}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{l.description}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
