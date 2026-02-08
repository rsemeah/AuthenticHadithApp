import { AuthForm } from "@/components/auth-form";
import { IslamicPattern } from "@/components/islamic-pattern";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen marble-bg flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#1a1f36] hover:text-[#C5A059] transition-colors"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="14" fill="#1B5E43" />
            <path
              d="M16 8L16 24M10 12L16 8L22 12M10 20L16 24L22 20"
              stroke="#C5A059"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-serif font-bold text-lg">Authentic Hadith</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl">
            {/* Islamic Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <IslamicPattern />
            </div>

            {/* Content */}
            <div className="relative p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-serif font-bold text-[#1a1f36] mb-2">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground">
                  Sign in to continue your journey
                </p>
              </div>

              <AuthForm />
            </div>
          </div>

          {/* Back to home link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-[#C5A059] transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
