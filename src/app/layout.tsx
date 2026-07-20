import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import "./globals.css"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Turist - Turistična platforma",
  description: "Upravljanje hotelov, kampov, apartmajev in restavracij",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl">
      <body>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
