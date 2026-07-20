"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getReservations } from "../actions"
import { formatDate } from "@/lib/utils"

export default function CalendarPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => { getReservations().then(setReservations) }, [])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function prev() { setCurrentMonth(new Date(year, month - 1)) }
  function next() { setCurrentMonth(new Date(year, month + 1)) }

  const monthName = currentMonth.toLocaleDateString("sl-SI", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Koledar</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={prev}>← Prejšnji</Button>
          <span className="font-medium capitalize">{monthName}</span>
          <Button variant="outline" onClick={next}>Naslednji →</Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr><th className="p-2 text-left">Soba</th>
                {days.map((d) => <th key={d} className="p-1 text-center min-w-[40px]">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {[101, 102, 103, 201, 202, 301].map((room) => (
                <tr key={room} className="border-t">
                  <td className="p-2 font-medium">{room}</td>
                  {days.map((d) => {
                    const date = new Date(year, month, d)
                    const res = reservations.find((r) => {
                      const ci = new Date(r.checkInDate)
                      const co = new Date(r.checkOutDate)
                      return r.room?.number == room && date >= ci && date < co
                    })
                    return (
                      <td key={d} className={`p-1 text-center text-xs ${res ? "bg-primary/20 rounded" : ""}`}>
                        {res ? res.guest?.lastName?.charAt(0) || "•" : ""}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
