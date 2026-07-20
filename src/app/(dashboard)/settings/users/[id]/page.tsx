"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUser } from "../../actions"

export default function UserDetailPage() {
  const params = useParams()
  const [user, setUser] = useState<any>(null)

  useEffect(() => { if (params.id) getUser(params.id as string).then(setUser) }, [params.id])

  if (!user) return <div className="p-6">Nalagam...</div>

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
      <Card>
        <CardHeader><CardTitle>Podatki</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
          <div><span className="text-muted-foreground">Vloga:</span> {user.role}</div>
          <div><span className="text-muted-foreground">Status:</span> {user.isActive ? "Aktiven" : "Neaktiven"}</div>
        </CardContent>
      </Card>
    </div>
  )
}
