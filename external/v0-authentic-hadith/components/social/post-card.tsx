"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Flag, Globe, Users, Lock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/** Shape returned by get_social_feed RPC */
export interface FeedPost {
  post_id:       string
  author_id:     string
  author_name:   string | null
  author_avatar: string | null
  collection:    string | null
  hadith_number: string | null
  hadith_id:     string | null
  reflection:    string
  visibility:    "public" | "followers" | "private"
  created_at:    string
}

const COLLECTION_LABELS: Record<string, string> = {
  "sahih-bukhari":    "Sahih al-Bukhari",
  "sahih-muslim":     "Sahih Muslim",
  "sunan-abu-dawud":  "Sunan Abu Dawud",
  "jami-at-tirmidhi": "Jami at-Tirmidhi",
  "sunan-an-nasai":   "Sunan an-Nasai",
  "sunan-ibn-majah":  "Sunan Ibn Majah",
  "muwatta-malik":    "Muwatta Malik",
  "musnad-ahmad":     "Musnad Ahmad",
}

const REPORT_REASONS = [
  { value: "misinformation", label: "Hadith misquoted or inaccurate" },
  { value: "inappropriate",  label: "Inappropriate content" },
  { value: "offensive",      label: "Offensive or disrespectful" },
  { value: "spam",           label: "Spam" },
  { value: "other",          label: "Other" },
] as const

type ReportReason = (typeof REPORT_REASONS)[number]["value"]

const VISIBILITY_ICONS = {
  public:    Globe,
  followers: Users,
  private:   Lock,
}

function AuthorAvatar({ name, avatar }: { name: string | null; avatar: string | null }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name ?? "Author"}
        className="w-9 h-9 rounded-full object-cover border border-[#C5A059]/20 flex-shrink-0"
      />
    )
  }

  return (
    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-[#C5A059] to-[#1b5e43]">
      {initials}
    </div>
  )
}

interface ReportDialogProps {
  postId: string
  onClose: () => void
}

function ReportDialog({ postId, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason>("misinformation")
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/social/posts/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      })
      if (res.ok || res.status === 409) setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6">
        {done ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle className="w-10 h-10 text-[#1b5e43] mx-auto" />
            <p className="font-medium">Report submitted</p>
            <p className="text-sm text-muted-foreground">
              Thank you for helping keep the community safe.
            </p>
            <button onClick={onClose} className="mt-2 px-4 py-2 rounded-lg emerald-button text-sm font-medium">
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-base font-semibold mb-1">Report this post</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Posts with multiple reports are automatically reviewed.
            </p>

            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors",
                    reason === r.value
                      ? "border-[#C5A059] bg-[#C5A059]/5"
                      : "border-border hover:border-[#C5A059]/50",
                  )}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-[#C5A059]"
                  />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>

            {reason === "other" && (
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Additional details (optional)"
                className="premium-input w-full h-20 text-sm resize-none mb-4"
                maxLength={500}
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface PostCardProps {
  post: FeedPost
  /** Called after the post is reported (e.g. to re-fetch feed) */
  onReport?: (postId: string) => void
}

export function PostCard({ post, onReport }: PostCardProps) {
  const [reporting, setReporting] = useState(false)

  const collectionLabel =
    post.collection ? (COLLECTION_LABELS[post.collection] ?? post.collection) : null

  const hadithRef =
    collectionLabel && post.hadith_number
      ? `${collectionLabel} #${post.hadith_number}`
      : null

  const VisibilityIcon = VISIBILITY_ICONS[post.visibility]

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <>
      <article className="premium-card rounded-2xl p-5 space-y-3">
        {/* Author row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <AuthorAvatar name={post.author_name} avatar={post.author_avatar} />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{post.author_name ?? "Unknown"}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{timeAgo}</span>
                <span>·</span>
                <VisibilityIcon className="w-3 h-3" />
                <span className="capitalize">{post.visibility}</span>
              </div>
            </div>
          </div>

          {/* Report button */}
          <button
            onClick={() => setReporting(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
            title="Report this post"
            aria-label="Report this post"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hadith reference badge */}
        {hadithRef && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#C5A059]/10 border border-[#C5A059]/20">
            <span className="text-xs font-medium gold-text">{hadithRef}</span>
          </div>
        )}

        {/* Reflection */}
        <p className="text-sm text-foreground leading-relaxed">{post.reflection}</p>
      </article>

      {reporting && (
        <ReportDialog
          postId={post.post_id}
          onClose={() => {
            setReporting(false)
            onReport?.(post.post_id)
          }}
        />
      )}
    </>
  )
}
