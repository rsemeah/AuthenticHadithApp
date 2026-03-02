import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

/** POST /api/social/follow — follow a user */
export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { following_id } = await req.json()
  if (!following_id) return NextResponse.json({ error: "following_id required" }, { status: 400 })
  if (following_id === user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
  }

  const { error } = await supabase
    .from("user_follows")
    .insert({ follower_id: user.id, following_id })

  if (error) {
    // Unique violation — already following; treat as success
    if (error.code === "23505") return NextResponse.json({ message: "Already following" })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Followed" })
}

/** DELETE /api/social/follow — unfollow a user */
export async function DELETE(req: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { following_id } = await req.json()
  if (!following_id) return NextResponse.json({ error: "following_id required" }, { status: 400 })

  const { error } = await supabase
    .from("user_follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", following_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: "Unfollowed" })
}
