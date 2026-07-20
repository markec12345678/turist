import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const publicRoutes = ["/auth/login", "/auth/register"]
const apiAuthRoutes = ["/api/auth"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  if (apiAuthRoutes.some((r) => pathname.startsWith(r))) return NextResponse.next()
  if (publicRoutes.includes(pathname)) {
    if (req.auth) return NextResponse.redirect(new URL("/", req.url))
    return NextResponse.next()
  }
  if (!req.auth) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
