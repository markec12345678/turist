"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType>({ open: false, setOpen: () => {} })

function Dialog({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internal, setInternal] = React.useState(false)
  const isOpen = open ?? internal
  const setOpen = onOpenChange ?? setInternal

  React.useEffect(() => {
    if (isOpen) {
      const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
      document.addEventListener("keydown", handler)
      document.body.style.overflow = "hidden"
      return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = "" }
    }
  }, [isOpen, setOpen])

  if (!isOpen) return null

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/80" onClick={() => setOpen(false)} />
        <div className="relative z-50">{children}</div>
      </div>
    </DialogContext.Provider>
  )
}

function DialogContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>{children}</div>
}

function DialogTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>{children}</h2>
}

function DialogDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props}>{children}</p>
}

function DialogClose({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(DialogContext)
  return <button className={className} onClick={() => setOpen(false)} {...props}>{children}</button>
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose }
