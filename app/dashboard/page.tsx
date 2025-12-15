"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Calendar, Settings, Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const router = useRouter()

  const { data: userData, error: userError } = useSWR("/api/auth/me", fetcher)
  const { data: statsData } = useSWR("/api/user/stats", fetcher)

  useEffect(() => {
    if (userError) {
      router.push("/signin")
    }
  }, [userError, router])

  const user = userData?.user
  const stats = statsData?.stats

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/feed"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Link>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <Button asChild variant="ghost" size="icon">
            <Link href="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <Button asChild className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Link href="/settings">Edit Profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-blue-500" />
                Likes Given
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.likesGiven || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                Dislikes Given
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.dislikesGiven || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-purple-500" />
                Comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.commentsCount || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                Events Interacted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.eventsInteracted || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions on CampusHub</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map(
                  (activity: { id: string; type: string; eventTitle: string; createdAt: string }, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          activity.type === "like"
                            ? "bg-blue-500/20"
                            : activity.type === "dislike"
                              ? "bg-red-500/20"
                              : "bg-purple-500/20"
                        }`}
                      >
                        {activity.type === "like" && <ThumbsUp className="h-4 w-4 text-blue-500" />}
                        {activity.type === "dislike" && <ThumbsDown className="h-4 w-4 text-red-500" />}
                        {activity.type === "comment" && <MessageCircle className="h-4 w-4 text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          You{" "}
                          {activity.type === "like"
                            ? "liked"
                            : activity.type === "dislike"
                              ? "disliked"
                              : "commented on"}{" "}
                          <span className="font-medium">{activity.eventTitle}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No recent activity yet. Start engaging with events!
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
