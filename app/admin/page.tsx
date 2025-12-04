import { redirect } from "next/navigation"
import { getAdminSession, clearAdminSession } from "@/lib/auth-utils"
import { getAllEventsForAdmin } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Shield, Plus, LogOut, TrendingUp } from "lucide-react"
import Link from "next/link"
import { AdminEventList } from "@/components/admin-event-list"
import { Card, CardContent } from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const isAdmin = await getAdminSession()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  const result = await getAllEventsForAdmin()

  const handleLogout = async () => {
    "use server"
    await clearAdminSession()
    redirect("/")
  }

  const totalEvents = result.events?.length || 0
  const totalLikes = result.events?.reduce((sum, e) => sum + (e.likesCount || 0), 0) || 0
  const totalComments = result.events?.reduce((sum, e) => sum + (e.commentsCount || 0), 0) || 0
  const totalEngagement = totalLikes + totalComments

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container px-4 md:px-6 flex h-16 items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-6">
            <Button size="sm" asChild>
              <Link href="/admin/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>

            <form action={handleLogout}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-6 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">Manage Events</h2>
          <p className="text-muted-foreground">Create, edit, and monitor all campus events</p>
        </div>

        {totalEvents > 0 && (
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{totalEvents}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{totalLikes}</p>
                  <p className="text-xs text-muted-foreground">Total Likes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{totalComments}</p>
                  <p className="text-xs text-muted-foreground">Total Comments</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold">{totalEngagement}</p>
                  <p className="text-xs text-muted-foreground">Total Engagement</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {result.error ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-muted-foreground">{result.error}</p>
          </div>
        ) : result.events && result.events.length > 0 ? (
          <AdminEventList events={result.events} />
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed">
            <p className="text-lg text-muted-foreground">No events yet</p>
            <Button asChild>
              <Link href="/admin/create">
                <Plus className="mr-2 h-4 w-4" />
                Create your first event
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
