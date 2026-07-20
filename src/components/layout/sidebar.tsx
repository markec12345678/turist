"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, CalendarDays, CalendarRange, Users, BedDouble,
  UtensilsCrossed, CreditCard, Settings, LogOut, Building2, ClipboardList,
  Monitor, Armchair, BarChart3, Clock, FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { signOut } from "next-auth/react"
import { useState } from "react"

const navigation = [
  { name: "Nadzorna plošča", href: "/", icon: LayoutDashboard },
  { name: "Rezervacije", href: "/reservations", icon: CalendarDays },
  { name: "Koledar", href: "/reservations/calendar", icon: CalendarRange },
  { name: "Gostje", href: "/guests", icon: Users },
  { name: "Sobe", href: "/rooms", icon: BedDouble },
  {
    name: "Restavracija", href: "/restaurant", icon: UtensilsCrossed,
    children: [
      { name: "Meni", href: "/restaurant/menu", icon: ClipboardList },
      { name: "Naročila", href: "/restaurant/orders", icon: UtensilsCrossed },
      { name: "KOT Zaslon", href: "/restaurant/kot", icon: Monitor },
      { name: "Mize", href: "/restaurant/tables", icon: Armchair },
      { name: "POS Terminal", href: "/restaurant/pos", icon: CreditCard },
    ],
  },
  { name: "Plačila", href: "/payments", icon: CreditCard },
  { name: "Izmene", href: "/shifts", icon: Clock },
  { name: "Lastnosti", href: "/properties", icon: Building2 },
  { name: "Poročila", href: "/reports/monthly", icon: BarChart3 },
  { name: "eTurizem / AJPES", href: "/eturizem", icon: FileText },
]

const secondaryNav = [
  { name: "Nastavitve", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [restaurantOpen, setRestaurantOpen] = useState(pathname.startsWith("/restaurant"))

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Building2 className="h-6 w-6" /> Turist
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2 overflow-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          const hasChildren = "children" in item && item.children

          if (item.href === "/restaurant") {
            return (
              <div key={item.href}>
                <button
                  onClick={() => setRestaurantOpen(!restaurantOpen)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  <span className="ml-auto text-xs">{restaurantOpen ? "▼" : "▶"}</span>
                </button>
                {restaurantOpen && item.children && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href
                      return (
                        <Link key={child.href} href={child.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors",
                            childActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <child.icon className="h-3.5 w-3.5" />
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-2">
        <Separator className="mb-2" />
        {secondaryNav.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => signOut({ callbackUrl: "/auth/login" })}>
          <LogOut className="h-4 w-4" /> Odjava
        </Button>
      </div>
    </aside>
  )
}
