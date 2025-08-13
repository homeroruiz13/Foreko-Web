import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { i18n } from './i18n.config'

import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  try {
    // @ts-ignore locales are readonly
    const locales: string[] = i18n.locales
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

    const locale = matchLocale(languages, locales, i18n.defaultLocale)
    return locale
  } catch (error) {
    // Fallback to default locale if there's an error
    return i18n.defaultLocale
  }
}

export function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname.startsWith('/images')
  ) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname
  
  // Check if this is a dashboard route (after locale)
  const isDashboardRoute = pathname.match(/^\/[a-z]{2}\/dashboard/) || pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  
  // Check if this is a sign-in route (after locale) 
  const isSignInRoute = pathname.match(/^\/[a-z]{2}\/sign-in/) || pathname === '/sign-in' || pathname.startsWith('/sign-in/')
  
  const jwtToken = request.cookies.get('auth-token')?.value
  const sessionToken = request.cookies.get('session-token')?.value
  const hasAuthTokens = jwtToken || sessionToken
  
  if (isDashboardRoute) {
    if (!hasAuthTokens) {
      // No authentication tokens, redirect to login
      const locale = getLocale(request)
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url))
    }
    
    // Note: We can't verify the token in middleware due to Edge Runtime limitations
    // Token verification will happen in the dashboard components themselves
  }
  
  if (isSignInRoute && hasAuthTokens) {
    // User is already authenticated but trying to access sign-in page
    // Redirect to dashboard (this provides additional protection at the middleware level)
    const locale = getLocale(request)
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }
  
  const pathnameIsMissingLocale = i18n.locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    )
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and `/images/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)']
}