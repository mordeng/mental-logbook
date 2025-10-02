import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("authjs.session-token") || request.cookies.get("__Secure-authjs.session-token")
  const isAuthenticated = !!sessionToken

  const { pathname } = request.nextUrl

  // Protected routes - redirect to login if not authenticated
  const isProtectedRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/stats") ||
    pathname.startsWith("/safety") ||
    pathname.startsWith("/settings")

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/journal/:path*", "/stats/:path*", "/safety/:path*", "/settings/:path*"],
}
