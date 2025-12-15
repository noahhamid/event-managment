"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Send,
  Loader2,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const EMOJI_LIST = ["❤️", "🔥", "👏", "🎉", "😍", "🤔"]

interface Event {
  _id: string
  title: string
  description: string
  imageUrl: string
  date: string
  category: string
  likes: string[]
  dislikes: string[]
  comments: { _id: string; userId: string; username: string; content: string; createdAt: string }[]
  reactions: { userId: string; emoji: string }[]
  likesCount: number
  dislikesCount: number
  commentsCount: number
}

export default function FeedPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("latest")
  const [category, setCategory] = useState("all")
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())

  const { data: userData, error: userError } = useSWR<{ user: any }>("/api/auth/me", fetcher)
  const {
    data: eventsData,
    error: eventsError,
    isLoading,
  } = useSWR<{ events: any[] }>(`/api/events?sort=${sort}&category=${category}&search=${search}`, fetcher, {
    refreshInterval: 5000,
  })

  useEffect(() => {
    if (userError) {
      router.push("/signin")
    }
  }, [userError, router])

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
  }

  const handleLike = useCallback(
    async (eventId: string) => {
      setLoadingActions((prev) => new Set(prev).add(`like-${eventId}`))
      try {
        await fetch(`/api/events/${eventId}/like`, { method: "POST" })
        mutate(`/api/events?sort=${sort}&category=${category}&search=${search}`)
      } finally {
        setLoadingActions((prev) => {
          const next = new Set(prev)
          next.delete(`like-${eventId}`)
          return next
        })
      }
    },
    [sort, category, search],
  )

  const handleDislike = useCallback(
    async (eventId: string) => {
      setLoadingActions((prev) => new Set(prev).add(`dislike-${eventId}`))
      try {
        await fetch(`/api/events/${eventId}/dislike`, { method: "POST" })
        mutate(`/api/events?sort=${sort}&category=${category}&search=${search}`)
      } finally {
        setLoadingActions((prev) => {
          const next = new Set(prev)
          next.delete(`dislike-${eventId}`)
          return next
        })
      }
    },
    [sort, category, search],
  )

  const handleComment = useCallback(
    async (eventId: string) => {
      const content = commentInputs[eventId]?.trim()
      if (!content) return

      setLoadingActions((prev) => new Set(prev).add(`comment-${eventId}`))
      try {
        await fetch(`/api/events/${eventId}/comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
        setCommentInputs((prev) => ({ ...prev, [eventId]: "" }))
        mutate(`/api/events?sort=${sort}&category=${category}&search=${search}`)
      } finally {
        setLoadingActions((prev) => {
          const next = new Set(prev)
          next.delete(`comment-${eventId}`)
          return next
        })
      }
    },
    [commentInputs, sort, category, search],
  )

  const handleReact = useCallback(
    async (eventId: string, emoji: string) => {
      await fetch(`/api/events/${eventId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })
      mutate(`/api/events?sort=${sort}&category=${category}&search=${search}`)
    },
    [sort, category, search],
  )

  const user = userData?.user
  const events = eventsData?.events || []

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/feed"
            className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
          >
            CampusHub
          </Link>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Tabs value={sort} onValueChange={setSort}>
              <TabsList>
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="earliest">Earliest</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={category} onValueChange={setCategory}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="sports">Sports</TabsTrigger>
                <TabsTrigger value="cultural">Cultural</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Events Feed */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : eventsError ? (
          <div className="text-center py-12 text-muted-foreground">Failed to load events</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No events found</div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video">
                  <Image
                    src={event.imageUrl || "/placeholder.svg?height=400&width=600&query=campus event"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/90 text-white capitalize">
                      {event.category}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{event.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {EMOJI_LIST.map((emoji) => {
                      const count = event.reactions?.filter((r) => r.emoji === emoji).length || 0
                      const hasReacted = event.reactions?.some((r) => r.userId === user.id && r.emoji === emoji)
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReact(event._id, emoji)}
                          className={`px-2 py-1 rounded-full text-sm transition-all hover:scale-110 ${
                            hasReacted ? "bg-purple-500/20 ring-1 ring-purple-500" : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {emoji} {count > 0 && <span className="ml-1">{count}</span>}
                        </button>
                      )
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <button
                      onClick={() => handleLike(event._id)}
                      disabled={loadingActions.has(`like-${event._id}`)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        event.likes?.includes(user.id) ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {event.likesCount}
                    </button>
                    <button
                      onClick={() => handleDislike(event._id)}
                      disabled={loadingActions.has(`dislike-${event._id}`)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        event.dislikes?.includes(user.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      {event.dislikesCount}
                    </button>
                    <button
                      onClick={() =>
                        setExpandedComments((prev) => {
                          const next = new Set(prev)
                          if (next.has(event._id)) next.delete(event._id)
                          else next.add(event._id)
                          return next
                        })
                      }
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {event.commentsCount}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments.has(event._id) && (
                    <div className="pt-4 border-t space-y-4">
                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          value={commentInputs[event._id] || ""}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [event._id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleComment(event._id)}
                        />
                        <Button
                          size="icon"
                          onClick={() => handleComment(event._id)}
                          disabled={loadingActions.has(`comment-${event._id}`) || !commentInputs[event._id]?.trim()}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        >
                          {loadingActions.has(`comment-${event._id}`) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {event.comments?.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No comments yet. Be the first!
                          </p>
                        ) : (
                          event.comments?.map((comment) => (
                            <div key={comment._id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                                  {comment.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-muted rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{comment.username}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
