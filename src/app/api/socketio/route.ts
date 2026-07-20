import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ status: "ok", message: "Socket.io server should be run via custom server (server.ts)" })
}
