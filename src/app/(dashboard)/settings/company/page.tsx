"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function CompanyPage() {
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    fetch("/api/company").then((r) => r.ok ? r.json() : null).then(setCompany).catch(() => {})
  }, [])

  async function save() {
    try {
      await fetch("/api/company", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(company) })
      toast.success("Shranjeno")
    } catch { toast.error("Napaka") }
  }

  if (!company) return <div className="p-6">Nalagam...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Podjetje</h1>
      <Card>
        <CardHeader><CardTitle>Podatki o podjetju</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Naziv</Label><Input value={company.name || ""} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Matična številka</Label><Input value={company.registrationNo || ""} onChange={(e) => setCompany({ ...company, registrationNo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Davčna številka</Label><Input value={company.taxNumber || ""} onChange={(e) => setCompany({ ...company, taxNumber: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>AJPES ID</Label><Input value={company.ajpesId || ""} onChange={(e) => setCompany({ ...company, ajpesId: e.target.value })} /></div>
          <div className="space-y-2"><Label>Naslov</Label><Input value={company.address || ""} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Mesto</Label><Input value={company.city || ""} onChange={(e) => setCompany({ ...company, city: e.target.value })} /></div>
            <div className="space-y-2"><Label>Poštna številka</Label><Input value={company.postalCode || ""} onChange={(e) => setCompany({ ...company, postalCode: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Telefon</Label><Input value={company.phone || ""} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={company.email || ""} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></div>
          </div>
          <Button onClick={save}>Shrani</Button>
        </CardContent>
      </Card>
    </div>
  )
}
