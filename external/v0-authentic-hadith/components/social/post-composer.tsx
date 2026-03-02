"use client"

import { useState } from "react"
import { PenLine, Globe, Users, Lock, X, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const COLLECTIONS = [
  { value: "sahih-bukhari",    label: "Sahih al-Bukhari" },
  { value: "sahih-muslim",     label: "Sahih Muslim" },
  { value: "sunan-abu-dawud",  label: "Sunan Abu Dawud" },
  { value: "jami-at-tirmidhi", label: "Jami at-Tirmidhi" },
  { value: "sunan-an-nasai",   label: "Sunan an-Nasai" },
  { value: "sunan-ibn-majah",  label: "Sunan Ibn Majah" },
  { value: "muwatta-malik",    label: "Muwatta Malik" },
  { value: "musnad-ahmad",     label: "Musnad Ahmad" },
]

type Visibility = "public" | "followers" | "private"

const VISIBILITY_OPTIONS: Array<{ value: Visibility; label: string; icon: typeof Globe; desc: string }> = [
  { value: "public",    label: "Public",    icon: Globe,  desc: "Anyone can see this" },
  { value: "followers", label: "Followers", icon: Users,  desc: "Only your followers" },
  { value: "private",   label: "Private",   icon: Lock,   desc: "Only you" },
]

interface PostComposerProps {
  /** Called after a post is successfully created */
  onPosted: () => void
}

export function PostComposer({ onPosted }: PostComposerProps) {
  const [open, setOpen] = useState(false)

  const [collection, setCollection]   = useState("")
  const [hadithNumber, setHadithNumber] = useState("")
  const [reflection, setReflection]   = useState("")
  const [visibility, setVisibility]   = useState<Visibility>("public")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const charsLeft = 1000 - reflection.length
  const canSubmit = reflection.trim().length >= 10 && !loading &&
    ((!collection && !hadithNumber) || (collection && hadithNumber))

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection:    collection    || undefined,
          hadith_number: hadithNumber  || undefined,
          reflection,
          visibility,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to post"); return }

      // Reset
      setCollection("")
      setHadithNumber("")
      setReflection("")
      setVisibility("public")
      setOpen(false)
      onPosted()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger — looks like a passive input to invite sharing */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3.5 premium-card rounded-2xl text-muted-foreground hover:border-[#C5A059]/40 transition-colors text-sm text-left"
      >
        <PenLine className="w-4 h-4 flex-shrink-0" />
        <span>Share a hadith reflection…</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create hadith post"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold gold-text">Share a Reflection</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hadith reference (optional) */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5" />
                Hadith Reference <span className="font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="premium-input flex-1 text-sm"
                >
                  <option value="">Select collection…</option>
                  {COLLECTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={hadithNumber}
                  onChange={(e) => setHadithNumber(e.target.value)}
                  placeholder="Hadith #"
                  className="premium-input w-28 text-sm"
                  aria-label="Hadith number"
                />
              </div>
              {Boolean(collection) !== Boolean(hadithNumber) && (
                <p className="text-xs text-destructive">
                  Please provide both a collection and hadith number.
                </p>
              )}
            </div>

            {/* Reflection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Your Reflection *
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value.slice(0, 1000))}
                placeholder="What does this hadith mean to you? Share a lesson, reminder, or personal insight…"
                className="premium-input w-full h-32 text-sm resize-none"
                autoFocus
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {reflection.trim().length < 10 && reflection.length > 0
                    ? `${10 - reflection.trim().length} more characters needed`
                    : null}
                </p>
                <p className={cn("text-xs", charsLeft < 50 ? "text-destructive" : "text-muted-foreground")}>
                  {charsLeft} left
                </p>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Who can see this?</p>
              <div className="flex gap-2">
                {VISIBILITY_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const selected = visibility === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setVisibility(opt.value)}
                      title={opt.desc}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-colors",
                        selected
                          ? "border-[#C5A059] bg-[#C5A059]/10 text-[#8A6E3A]"
                          : "border-border hover:border-[#C5A059]/50 text-muted-foreground",
                      )}
                    >
                      <Icon className={cn("w-4 h-4", selected && "text-[#C5A059]")} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 px-4 py-2.5 rounded-lg gold-button text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Posting…" : "Post Reflection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
