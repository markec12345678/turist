"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, UtensilsCrossed, Monitor, Armchair, CreditCard } from "lucide-react"

const links = [
  { name: "Meni", href: "/restaurant/menu", icon: ClipboardList },
  { name: "Naročila", href: "/restaurant/orders", icon: UtensilsCrossed },
  { name: "KOT Zaslon", href: "/restaurant/kot", icon: Monitor },
  { name: "Mize", href: "/restaurant/tables", icon: Armchair },
  { name: "POS Terminal", href: "/restaurant/pos", icon: CreditCard },
]

export default function RestaurantPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Restavracija</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <l.icon className="h-8 w-8 text-primary" />
                <CardTitle>{l.name}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
