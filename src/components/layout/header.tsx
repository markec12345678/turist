"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { NotificationsBell } from "@/components/notifications-bell"

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin", ADMIN: "Administrator", RECEPTIONIST: "Receptor",
  CHEF: "Kuhar", WAITER: "Natakar", CLEANER: "Čistilka",
  CASHIER: "Blagajnik", MANAGER: "Upravnik", STAFF: "Zaposleni",
}

export function Header() {
  const { data: session } = useSession()
  const user = session?.user
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "?"
  const role = (user as Record<string, unknown>)?.role as string | undefined

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div />
      <div className="flex items-center gap-4">
        <NotificationsBell />
        {role && <Badge variant="secondary">{roleLabels[role] || role}</Badge>}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/login" })}>Odjava</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
