"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink, AlertCircle, CheckCircle, Clock, Building2 } from "lucide-react"

export default function ETurizemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">eTurizem / AJPES</h1><p className="text-muted-foreground">Poročanje turističnih podatkov AJPES in FURS</p></div>
        <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> V razvoju</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> eTurizem poročanje</CardTitle><CardDescription>Samodejno poročanje podatkov o gostih in nočitvah na AJPES</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-yellow-500" /><span>Integracija z AJPES API v pripravi</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Podatki o gostih zbrani</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Podatki o nočitvah zbrani</span></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> FURS e-Davki</CardTitle><CardDescription>Elektronsko pošiljanje računov in poročil na FURS</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>EOR pripravljena</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>DDV izračun avtomatiziran</span></div>
              <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-yellow-500" /><span>Fiskalizacija v integraciji</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Povezave</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="https://www.ajpes.si/eturizem/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><ExternalLink className="h-4 w-4" /> AJPES eTurizem</a>
          <a href="https://www.furrs.gov.si/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><ExternalLink className="h-4 w-4" /> FURS — e-Davki</a>
          <a href="https://www.furrs.gov.si/etir/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><ExternalLink className="h-4 w-4" /> FURS e-TIR</a>
        </CardContent>
      </Card>
    </div>
  )
}
