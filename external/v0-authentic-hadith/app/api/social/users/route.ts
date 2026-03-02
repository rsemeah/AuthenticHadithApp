import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

/** GET /api/social/users?q=<query> — search for users by display name */
export async function GET(req: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""

  if (q.length < 2) return NextResponse.json({ users: [] })

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, name, avatar_url")
    .ilike("name", `%${q}%`)
    .neq("user_id", user.id)
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Annotate each result with whether the current user already follows them
  const ids = (profiles ?? []).map((p) => p.user_id)
  let followedSet = new Set<string>()

  if (ids.length > 0) {
    const { data: follows } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", ids)

    followedSet = new Set((follows ?? []).map((f) => f.following_id))
  }

  return NextResponse.json({
    users: (profiles ?? []).map((p) => ({
      ...p,
      is_following: followedSet.has(p.user_id),
    })),
  })
}
