import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Sparkles, Users, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Campus Event Hub
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Discover Amazing Events on Campus
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-muted-foreground text-pretty">
              Stay connected with your campus community. Discover events, connect with peers, and never miss out on
              what's happening.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link href="/signup">Get Started</Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mx-auto mt-24 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Discover Events</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse through exciting campus events tailored to your interests
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Connect & Engage</h3>
              <p className="text-muted-foreground leading-relaxed">
                Like, comment, and react to events. Join the conversation
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Stay Updated</h3>
              <p className="text-muted-foreground leading-relaxed">
                Never miss trending events and campus announcements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
