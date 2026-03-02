import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

const VALID_REASONS = new Set([
  "inappropriate",
  "misinformation",
  "offensive",
  "spam",
  "other",
])

/** POST /api/social/posts/[postId]/report — submit a content report */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { postId } = await params
  const { reason, details } = await req.json()

  if (!VALID_REASONS.has(reason)) {
    return NextResponse.json(
      { error: `reason must be one of: ${[...VALID_REASONS].join(", ")}` },
      { status: 400 },
    )
  }

  const { error } = await supabase
    .from("post_reports")
    .insert({
      post_id:     postId,
      reporter_id: user.id,
      reason,
      details: details ? String(details).slice(0, 500) : null,
    })

  if (error) {
    // Already reported by this user
    if (error.code === "23505") {
      return NextResponse.json({ error: "You have already reported this post" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Report submitted. Thank you for helping keep the community safe." })
}
