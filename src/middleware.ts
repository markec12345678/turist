import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/auth/login", "/auth/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/socketio|public).*)"],
}
