"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createGuest } from "../actions"
import { toast } from "sonner"

const schema = z.object({
  firstName: z.string().min(1, "Ime je obvezno"),
  lastName: z.string().min(1, "Priimek je obvezen"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  gender: z.string().optional(),
  documentType: z.string().optional(),
  documentNo: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewGuestPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      await createGuest(data)
      toast.success("Gost uspešno ustvarjen")
      router.push("/guests")
    } catch { toast.error("Napaka pri ustvarjanju") }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Nov gost</h1>
      <Card>
        <CardHeader><CardTitle>Osebni podatki</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ime *</Label><Input {...register("firstName")} />{errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}</div>
              <div className="space-y-2"><Label>Priimek *</Label><Input {...register("lastName")} />{errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
              <div className="space-y-2"><Label>Telefon</Label><Input {...register("phone")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Državljanstvo</Label><Input {...register("nationality")} /></div>
              <div className="space-y-2"><Label>Spol</Label><Input {...register("gender")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Vrsta dokumenta</Label><Input {...register("documentType")} /></div>
              <div className="space-y-2"><Label>Št. dokumenta</Label><Input {...register("documentNo")} /></div>
            </div>
            <div className="space-y-2"><Label>Naslov</Label><Input {...register("address")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Mesto</Label><Input {...register("city")} /></div>
              <div className="space-y-2"><Label>Država</Label><Input {...register("country")} /></div>
            </div>
            <div className="space-y-2"><Label>Opombe</Label><Textarea {...register("notes")} /></div>
            <div className="flex gap-2"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Shranjujem..." : "Shrani"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Prekliči</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
