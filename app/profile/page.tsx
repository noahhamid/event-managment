import { redirect } from "next/navigation"
import { getUserSession } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ThumbsUp, MessageCircle, Calendar, Trash2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog"
import { Suspense } from "react"
import LoadingSpinner from "@/components/loading-spinner" // Assuming LoadingSpinner is defined somewhere

function DeleteProfileDialog() {
  return (
    <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
      <div>
        <h3 className="font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
      </div>
      <form
        action={async (formData) => {
          "use server"
          const { deleteUserProfile } = await import("@/app/actions/auth")
          const email = formData.get("email") as string
          const password = formData.get("password") as string
          const result = await deleteUserProfile(email, password)
          if (result.success) {
            redirect("/")
          }
        }}
      >
        <div className="space-y-4">
          <input type="hidden" name="confirmed" value="true" />
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm your email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter your password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" variant="destructive" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete My Account
          </Button>
        </div>
      </form>
    </div>
  )
}

export default async function ProfilePage() {
  const session = await getUserSession()

  if (!session) {
    redirect("/signin")
  }

  const db = await getDatabase()
  const users = db.collection("users")
  const events = db.collection("events")

  const user = await users.findOne({ _id: new ObjectId(session.userId) })

  if (!user) {
    redirect("/signin")
  }

  // Get user's liked events
  const likedEvents = await events
    .find({ _id: { $in: user.likedPosts?.map((id: string) => new ObjectId(id)) || [] } })
    .toArray()

  // Get user's comments
  const commentedEvents = await events.find({ "comments.userId": session.userId }).toArray()

  const serializedUser = {
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    likedPosts: user.likedPosts || [],
    dislikedPosts: user.dislikedPosts || [],
    lastUsernameChange: user.lastUsernameChange,
  }

  const serializedLikedEvents = likedEvents.map((event: any) => ({
    ...event,
    _id: event._id.toString(),
    createdAt: event.createdAt,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        <div className="container py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mx-auto max-w-4xl space-y-8">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={serializedUser.profilePicture || "/placeholder.svg"}
                        alt={serializedUser.username}
                      />
                      <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                        {serializedUser.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-3xl">{serializedUser.username}</CardTitle>
                      <p className="text-muted-foreground">{serializedUser.email}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Member since{" "}
                        {new Date(serializedUser.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <ProfileSettingsDialog user={serializedUser} />
                </div>
              </CardHeader>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ThumbsUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{serializedUser.likedPosts?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Events Liked</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                    <MessageCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{commentedEvents.length}</p>
                    <p className="text-sm text-muted-foreground">Events Commented</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Calendar className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{serializedLikedEvents.length + commentedEvents.length}</p>
                    <p className="text-sm text-muted-foreground">Total Interactions</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liked Events */}
            {serializedLikedEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Liked Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serializedLikedEvents.slice(0, 5).map((event: any) => (
                      <div key={event._id} className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                          <img
                            src={event.imageUrl || "/placeholder.svg"}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                        </div>
                        {event.category && <Badge>{event.category}</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <DeleteProfileDialog />
          </div>
        </div>
      </Suspense>
    </div>
  )
}
