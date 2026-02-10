import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const locales = ["ar", "en", "fr"] as const
const defaultLocale = "en"

function extractLocale(pathname: string) {
  const seg = pathname.split("/")[1]
  return locales.includes(seg as any) ? (seg as (typeof locales)[number]) : null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // تجاهل assets وملفات Next والـ api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // لازم نثبت locale أولاً لأنه مشروعك مبني على /[locale]/*
  const locale = extractLocale(pathname) ?? defaultLocale
  const restPath = extractLocale(pathname)
    ? pathname.replace(`/${locale}`, "") || "/"
    : pathname

  // جهّز Response واحد وتعدّل عليه
  const response = NextResponse.next()

  // ✅ Edge-safe cookies handling (بدون request.cookies.set أبداً)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // صفحات auth ضمن نفس locale
  const isAuthRoute = restPath.startsWith("/auth")

  // ✅ إذا ما في user ومنه رايح على auth، حوّله على login مع locale
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/auth/login`
    return NextResponse.redirect(url)
  }

  // ✅ إذا user موجود وعم يحاول يفوت على auth، حوّله على dashboard مع locale
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/dashboard`
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
