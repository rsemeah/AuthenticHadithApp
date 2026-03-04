import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Handle server component cookie setting
        }
      },
    },
  })

  // Handle OAuth code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/?error=auth`)
    }
  }

  // Handle email confirmation (token_hash + type)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "email",
      token_hash,
    })
    if (error) {
      return NextResponse.redirect(`${origin}/?error=auth`)
    }
  }

  // If neither code nor token_hash, something went wrong
  if (!code && !token_hash) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  // Get user after auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("onboarded")
      .eq("user_id", user.id)
      .single()

    if (prefs?.onboarded) {
      // Check if they've selected a plan (have a subscriptions record)
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .single()

      if (subscription) {
        // Returning user with a plan — go home
        const response = NextResponse.redirect(`${origin}/home`)
        response.cookies.set("qbos_onboarded", "1", {
          path: "/",
          maxAge: 31536000,
          sameSite: "lax",
        })
        response.cookies.set("qbos_plan_selected", "1", {
          path: "/",
          maxAge: 31536000,
          sameSite: "lax",
        })
        return response
      } else {
        // Onboarded but never selected a plan — go to pricing
        const response = NextResponse.redirect(`${origin}/pricing`)
        response.cookies.set("qbos_onboarded", "1", {
          path: "/",
          maxAge: 31536000,
          sameSite: "lax",
        })
        return response
      }
    }
  }

  // New user or not yet onboarded — send to onboarding
  return NextResponse.redirect(`${origin}/onboarding`)
}
