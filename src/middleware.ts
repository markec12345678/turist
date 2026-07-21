import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/auth/login", "/auth/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/socketio")) {
    return NextResponse.next()
  }

  if (publicPaths.includes(pathname)) {
    if (request.cookies.get("authjs.session-token") || request.cookies.get("__Secure-authjs.session-token")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
