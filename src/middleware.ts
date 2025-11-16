import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

// Define protected routes
const protectedRoutes = ['/dashboard', '/jobs', '/admin']
const authRoutes = ['/login', '/signup']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  // Update session
  const response = await updateSession(request)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route))

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return Response.redirect(url)
  }

  // Redirect to appropriate dashboard if accessing auth routes while logged in
  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.is_admin ? '/admin/dashboard' : '/dashboard'
    return Response.redirect(url)
  }

  // Check admin access
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return Response.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
