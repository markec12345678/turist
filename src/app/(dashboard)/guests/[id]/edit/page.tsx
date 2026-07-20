"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getGuest, updateGuest } from "../../actions"
import { toast } from "sonner"

const schema = z.object({ firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().optional(), phone: z.string().optional(), nationality: z.string().optional(), address: z.string().optional(), city: z.string().optional(), country: z.string().optional(), notes: z.string().optional() })
type FormData = z.infer<typeof schema>

export default function EditGuestPage() {
  const params = useParams()
  const router = useRouter()
  const [guest, setGuest] = useState<any>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => { if (params.id) getGuest(params.id as string).then((g: Record<string, unknown> | null) => { setGuest(g); reset(g as any) }) }, [params.id, reset])

  async function onSubmit(data: FormData) {
    try {
      await updateGuest(params.id as string, data)
      toast.success("Gost posodobljen")
      router.push(`/guests/${params.id}`)
    } catch { toast.error("Napaka") }
  }

  if (!guest) return <div className="p-6">Nalagam...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Uredi gosta</h1>
      <Card>
        <CardHeader><CardTitle>Podatki</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ime *</Label><Input {...register("firstName")} /></div>
              <div className="space-y-2"><Label>Priimek *</Label><Input {...register("lastName")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input {...register("email")} /></div>
              <div className="space-y-2"><Label>Telefon</Label><Input {...register("phone")} /></div>
            </div>
            <div className="space-y-2"><Label>Državljanstvo</Label><Input {...register("nationality")} /></div>
            <div className="space-y-2"><Label>Naslov</Label><Input {...register("address")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Mesto</Label><Input {...register("city")} /></div>
              <div className="space-y-2"><Label>Država</Label><Input {...register("country")} /></div>
            </div>
            <div className="space-y-2"><Label>Opombe</Label><Textarea {...register("notes")} /></div>
            <div className="flex gap-2"><Button type="submit" disabled={isSubmitting}>Shrani</Button><Button type="button" variant="outline" onClick={() => router.back()}>Prekliči</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
