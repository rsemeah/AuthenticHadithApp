import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

/** GET /api/social/posts — paginated social feed for the authenticated user */
export async function GET(req: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit  = Math.min(parseInt(searchParams.get("limit")  ?? "20", 10), 50)
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0",  10), 0)

  const { data, error } = await supabase.rpc("get_social_feed", {
    p_user_id: user.id,
    p_limit:   limit,
    p_offset:  offset,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posts: data ?? [] })
}

const VALID_VISIBILITIES = new Set(["public", "followers", "private"])

/** POST /api/social/posts — create a new hadith post */
export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { collection, hadith_number, hadith_id, reflection, visibility } = body

  // Validate
  const trimmed = typeof reflection === "string" ? reflection.trim() : ""
  if (trimmed.length < 10) {
    return NextResponse.json({ error: "Reflection must be at least 10 characters" }, { status: 400 })
  }
  if (trimmed.length > 1000) {
    return NextResponse.json({ error: "Reflection must be 1000 characters or fewer" }, { status: 400 })
  }
  if (!VALID_VISIBILITIES.has(visibility)) {
    return NextResponse.json({ error: "visibility must be public, followers, or private" }, { status: 400 })
  }
  // If one half of the hadith reference is provided, require the other
  if (Boolean(collection) !== Boolean(hadith_number)) {
    return NextResponse.json(
      { error: "Provide both collection and hadith_number, or neither" },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from("hadith_posts")
    .insert({
      author_id:    user.id,
      collection:   collection    || null,
      hadith_number: hadith_number || null,
      hadith_id:    hadith_id     || null,
      reflection:   trimmed,
      visibility,
    })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ post_id: data.id }, { status: 201 })
}
