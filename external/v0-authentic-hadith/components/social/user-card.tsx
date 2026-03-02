"use client"

import { useState } from "react"
import { UserPlus, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SocialUser {
  user_id:      string
  name:         string | null
  avatar_url:   string | null
  is_following: boolean
}

function Avatar({ name, avatar }: { name: string | null; avatar: string | null }) {
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
        alt={name ?? "User"}
        className="w-11 h-11 rounded-full object-cover border-2 border-[#C5A059]/20 flex-shrink-0"
      />
    )
  }

  return (
    <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-[#C5A059] to-[#1b5e43]">
      {initials}
    </div>
  )
}

interface UserCardProps {
  user: SocialUser
  /** Called after a follow/unfollow action completes */
  onChange?: (userId: string, nowFollowing: boolean) => void
}

export function UserCard({ user, onChange }: UserCardProps) {
  const [following, setFollowing]   = useState(user.is_following)
  const [loading, setLoading]       = useState(false)

  const toggleFollow = async () => {
    setLoading(true)
    const method = following ? "DELETE" : "POST"
    try {
      const res = await fetch("/api/social/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: user.user_id }),
      })
      if (res.ok || res.status === 200) {
        const nowFollowing = !following
        setFollowing(nowFollowing)
        onChange?.(user.user_id, nowFollowing)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="premium-card rounded-xl px-4 py-3.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={user.name} avatar={user.avatar_url} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{user.name ?? "Anonymous"}</p>
          <p className="text-xs text-muted-foreground">
            {following ? "Following" : "Learner"}
          </p>
        </div>
      </div>

      <button
        onClick={toggleFollow}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex-shrink-0 disabled:opacity-50",
          following
            ? "border border-border bg-muted hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            : "gold-button",
        )}
        aria-label={following ? `Unfollow ${user.name}` : `Follow ${user.name}`}
      >
        {following ? (
          <>
            <UserCheck className="w-3.5 h-3.5" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-3.5 h-3.5" />
            Follow
          </>
        )}
      </button>
    </div>
  )
}
