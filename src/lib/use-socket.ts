"use client"

import { useEffect, useCallback, useRef } from "react"
import { getSocket } from "@/lib/socket"

export function useSocket(propertyId?: string) {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    if (propertyId) {
      socket.emit("join:property", propertyId)
    }

    return () => {}
  }, [propertyId])

  const on = useCallback(
    (event: string, handler: (...args: unknown[]) => void) => {
      const socket = socketRef.current
      if (socket) {
        socket.on(event, handler)
        return () => {
          socket.off(event, handler)
        }
      }
      return () => {}
    },
    []
  )

  const emit = useCallback((event: string, ...args: unknown[]) => {
    const socket = socketRef.current
    if (socket) {
      socket.emit(event, ...args)
    }
  }, [])

  return { on, emit, socket: socketRef.current }
}
