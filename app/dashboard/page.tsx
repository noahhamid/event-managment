import { redirect } from "next/navigation"
import { getUserSession } from "@/lib/auth-utils"
import { getEvents } from "@/app/actions/events"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import { LogOut, Sparkles, User } from "lucide-react"
import { ClientDashboard } from "@/components/client-dashboard"
import { LoadingLink } from "@/components/loading-link"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await getUserSession()

  if (!session) {
    redirect("/signin")
  }

  const params = await searchParams
  const filter = params.filter || "all"
  const result = await getEvents(filter)

  const handleLogout = async () => {
    "use server"
    await logout()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 md:px-6 flex h-16 items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Campus Events</h1>
          </div>

          <div className="flex items-center gap-6">
            <LoadingLink href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{session.username}</span>
            </LoadingLink>

            <form action={handleLogout}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-6 py-8 md:py-12">
        <ClientDashboard
          initialEvents={result.events || []}
          currentFilter={filter}
          currentUserId={session.userId}
          error={result.error}
        />
      </main>
    </div>
  )
}
