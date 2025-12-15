"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Calendar, ThumbsUp, ThumbsDown, MessageCircle, LogOut, Loader2, Eye } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Event {
  _id: string
  title: string
  description: string
  imageUrl: string
  date: string
  category: string
  likesCount: number
  dislikesCount: number
  commentsCount: number
  comments: { _id: string; username: string; content: string; createdAt: string }[]
  likedBy?: string[]
  dislikedBy?: string[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    date: "",
    category: "academic",
  })

  const { data: authData, error: authError } = useSWR("/api/admin/auth", fetcher)
  const {
    data: eventsData,
    error: eventsError,
    isLoading,
  } = useSWR(authData?.authenticated ? "/api/admin/events" : null, fetcher)

  useEffect(() => {
    if (authError || (authData && !authData.authenticated)) {
      router.push("/admin")
    }
  }, [authData, authError, router])

  const handleSignOut = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin")
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setIsCreateOpen(false)
        setFormData({ title: "", description: "", imageUrl: "", date: "", category: "academic" })
        mutate("/api/admin/events")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/events/${selectedEvent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setIsEditOpen(false)
        setSelectedEvent(null)
        mutate("/api/admin/events")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" })
    mutate("/api/admin/events")
  }

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      date: new Date(event.date).toISOString().slice(0, 16),
      category: event.category,
    })
    setIsEditOpen(true)
  }

  const openDetailsDialog = async (eventId: string) => {
    const res = await fetch(`/api/admin/events/${eventId}`)
    const data = await res.json()
    setSelectedEvent(data.event)
    setIsDetailsOpen(true)
  }

  const events = eventsData?.events || []
  const totals = eventsData?.totals || { totalEvents: 0, totalLikes: 0, totalDislikes: 0, totalComments: 0 }

  if (!authData?.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                Total Events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totals.totalEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-blue-500" />
                Total Likes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totals.totalLikes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                Total Dislikes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totals.totalDislikes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                Total Comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totals.totalComments}</p>
            </CardContent>
          </Card>
        </div>

        {/* Events Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Events Management</CardTitle>
              <CardDescription>Create, edit, and manage campus events</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>Fill in the details for the new event</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Event"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No events created yet</div>
            ) : (
              <div className="space-y-4">
                {events.map((event: Event) => (
                  <div
                    key={event._id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative h-20 w-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={event.imageUrl || "/placeholder.svg?height=80&width=128&query=event"}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{event.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{event.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="capitalize px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-xs">
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {event.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="h-4 w-4" />
                        {event.dislikesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {event.commentsCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDetailsDialog(event._id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{event.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(event._id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>Update the event details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date & Time</Label>
                <Input
                  id="edit-date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <DialogDescription>Event details and engagement analytics</DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={selectedEvent.imageUrl || "/placeholder.svg?height=300&width=500&query=event"}
                      alt={selectedEvent.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-muted-foreground">{selectedEvent.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="capitalize px-2 py-1 rounded-full bg-purple-500/10 text-purple-600">
                      {selectedEvent.category}
                    </span>
                  </div>
                </TabsContent>
                <TabsContent value="engagement" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <ThumbsUp className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">{selectedEvent.likesCount}</p>
                        <p className="text-sm text-muted-foreground">Likes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <ThumbsDown className="h-6 w-6 mx-auto text-red-500 mb-2" />
                        <p className="text-2xl font-bold">{selectedEvent.dislikesCount}</p>
                        <p className="text-sm text-muted-foreground">Dislikes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <MessageCircle className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold">{selectedEvent.commentsCount}</p>
                        <p className="text-sm text-muted-foreground">Comments</p>
                      </CardContent>
                    </Card>
                  </div>
                  {selectedEvent.likedBy && selectedEvent.likedBy.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Liked by:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.likedBy.map((username, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm">
                            {username}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedEvent.dislikedBy && selectedEvent.dislikedBy.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Disliked by:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.dislikedBy.map((username, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-red-500/10 text-red-600 text-sm">
                            {username}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="comments" className="space-y-4">
                  {selectedEvent.comments?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No comments yet</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedEvent.comments?.map((comment) => (
                        <div key={comment._id} className="p-3 rounded-lg bg-muted">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{comment.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
