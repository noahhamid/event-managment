"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getEventDetails } from "@/app/actions/admin"
import { Loader2, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EventDetailsDialogProps {
  eventId: string
  open: boolean
  onClose: () => void
}

export function EventDetailsDialog({ eventId, open, onClose }: EventDetailsDialogProps) {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && eventId) {
      loadEvent()
    }
  }, [eventId, open])

  const loadEvent = async () => {
    setLoading(true)
    const result = await getEventDetails(eventId)
    if (result.event) {
      setEvent(result.event)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Event Details & Analytics</DialogTitle>
          <DialogDescription>Comprehensive view of event engagement and interactions</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : event ? (
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* Event Info */}
              <div>
                <h3 className="mb-2 text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <ThumbsUp className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <p className="text-2xl font-bold">{event.likes?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Likes</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <ThumbsDown className="mx-auto mb-2 h-5 w-5 text-destructive" />
                  <p className="text-2xl font-bold">{event.dislikes?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Dislikes</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <MessageCircle className="mx-auto mb-2 h-5 w-5 text-secondary" />
                  <p className="text-2xl font-bold">{event.comments?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
              </div>

              {/* Liked By */}
              {event.likedBy && event.likedBy.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold">Liked by</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.likedBy.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {user.username}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disliked By */}
              {event.dislikedBy && event.dislikedBy.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold">Disliked by</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.dislikedBy.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {user.username}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {event.comments && event.comments.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold">Comments</h4>
                  <div className="space-y-3">
                    {event.comments.map((comment: any) => (
                      <div key={comment._id} className="flex gap-3 rounded-lg border p-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="text-sm font-semibold">{comment.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reactions */}
              {event.reactions && event.reactions.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold">Reactions</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(
                      event.reactions.reduce((acc: any, r: any) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1
                        return acc
                      }, {}),
                    ).map(([emoji, count]) => (
                      <div key={emoji} className="flex items-center gap-1 rounded-full border bg-muted px-3 py-1">
                        <span className="text-lg">{emoji}</span>
                        <span className="text-sm font-semibold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground">Event not found</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
