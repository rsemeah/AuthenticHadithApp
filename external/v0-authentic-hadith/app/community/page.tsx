"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Users, Compass, Search, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { PostCard, type FeedPost } from "@/components/social/post-card"
import { PostComposer } from "@/components/social/post-composer"
import { UserCard, type SocialUser } from "@/components/social/user-card"

type Tab = "feed" | "discover"

// ─── Skeleton loaders ──────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="premium-card rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded bg-muted" />
          <div className="h-2.5 w-16 rounded bg-muted" />
        </div>
      </div>
      <div className="h-2.5 w-32 rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-4/6 rounded bg-muted" />
      </div>
    </div>
  )
}

function UserSkeleton() {
  return (
    <div className="premium-card rounded-xl px-4 py-3.5 flex items-center gap-3 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-36 rounded bg-muted" />
        <div className="h-2.5 w-20 rounded bg-muted" />
      </div>
      <div className="h-8 w-20 rounded-lg bg-muted" />
    </div>
  )
}

// ─── Empty states ──────────────────────────────────────────────────────────────

function EmptyFeed() {
  return (
    <div className="text-center py-16 space-y-3">
      <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 flex items-center justify-center mx-auto">
        <Users className="w-7 h-7 text-[#C5A059]" />
      </div>
      <h3 className="font-semibold text-foreground">Your feed is quiet</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Follow fellow learners to see their hadith reflections here, or share your own above.
      </p>
    </div>
  )
}

// ─── Tab button ────────────────────────────────────────────────────────────────

interface TabButtonProps {
  active:   boolean
  onClick:  () => void
  icon:     React.ComponentType<{ className?: string }>
  children: React.ReactNode
}

function TabButton({ active, onClick, icon: Icon, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-card shadow-sm text-foreground gold-text"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className={cn("w-4 h-4", active && "text-[#C5A059]")} />
      {children}
    </button>
  )
}

// ─── Feed section ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

function FeedSection() {
  const [posts, setPosts]       = useState<FeedPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]   = useState(true)
  const offsetRef               = useRef(0)

  const fetchPage = useCallback(async (offset: number, append: boolean) => {
    try {
      const res  = await fetch(`/api/social/posts?limit=${PAGE_SIZE}&offset=${offset}`)
      const data = await res.json()
      const page: FeedPost[] = data.posts ?? []

      setPosts((prev) => append ? [...prev, ...page] : page)
      setHasMore(page.length === PAGE_SIZE)
      offsetRef.current = offset + page.length
    } catch {
      /* swallow; user can retry */
    }
  }, [])

  const initialFetch = useCallback(async () => {
    setLoading(true)
    offsetRef.current = 0
    await fetchPage(0, false)
    setLoading(false)
  }, [fetchPage])

  useEffect(() => { initialFetch() }, [initialFetch])

  const loadMore = async () => {
    setLoadingMore(true)
    await fetchPage(offsetRef.current, true)
    setLoadingMore(false)
  }

  return (
    <div className="space-y-4">
      {/* Composer */}
      <PostComposer onPosted={initialFetch} />

      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={initialFetch}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Posts */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
      ) : posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.post_id} post={post} onReport={initialFetch} />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-5 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:border-[#C5A059]/50 hover:text-foreground transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Discover section ──────────────────────────────────────────────────────────

function DiscoverSection() {
  const [query, setQuery]       = useState("")
  const [users, setUsers]       = useState<SocialUser[]>([])
  const [loading, setLoading]   = useState(false)
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setUsers([]); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/social/users?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setUsers(data.users ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  const handleFollowChange = (userId: string, nowFollowing: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.user_id === userId ? { ...u, is_following: nowFollowing } : u)),
    )
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="premium-input w-full pl-9 text-sm"
          aria-label="Search for users"
        />
      </div>

      {/* Results */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <UserSkeleton key={i} />)
      ) : users.length > 0 ? (
        users.map((user) => (
          <UserCard key={user.user_id} user={user} onChange={handleFollowChange} />
        ))
      ) : query.trim().length >= 2 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No users found for "{query}"
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#1b5e43]/10 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7 text-[#1b5e43]" />
          </div>
          <h3 className="font-semibold text-foreground">Find people to follow</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Type a name above to discover fellow learners and follow their hadith reflections.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>("feed")

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold gold-text font-[family-name:var(--font-cinzel)]">
            Community
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Share reflections and follow fellow learners
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
          <TabButton
            active={tab === "feed"}
            onClick={() => setTab("feed")}
            icon={Users}
          >
            Feed
          </TabButton>
          <TabButton
            active={tab === "discover"}
            onClick={() => setTab("discover")}
            icon={Compass}
          >
            Discover People
          </TabButton>
        </div>

        {/* Tab content */}
        {tab === "feed"     && <FeedSection />}
        {tab === "discover" && <DiscoverSection />}
      </div>
    </div>
  )
}
