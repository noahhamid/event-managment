"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, MessageCircle, Smile, Edit, Trash2, Eye } from "lucide-react"
import { deleteEvent } from "@/app/actions/admin"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { EventDetailsDialog } from "./event-details-dialog"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AdminEventListProps {
  events: any[]
}

export function AdminEventList({ events }: AdminEventListProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setLoading(true)
    await deleteEvent(deleteId)
    setDeleteId(null)
    setLoading(false)
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event) => (
          <Card key={event._id} className="overflow-hidden relative">
            {loading && deleteId === event._id && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Deleting...</p>
                </div>
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold line-clamp-2 text-sm">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Badge className="text-xs flex-shrink-0">{event.category}</Badge>
              </div>
            </CardHeader>

            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img
                src={event.imageUrl || "/placeholder.svg"}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>

            <CardContent className="pt-2 pb-2">
              <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">{event.description}</p>

              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div>
                  <div className="flex items-center justify-center gap-0.5 text-muted-foreground">
                    <ThumbsUp className="h-3 w-3" />
                  </div>
                  <p className="font-semibold text-sm">{event.likesCount}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-0.5 text-muted-foreground">
                    <ThumbsDown className="h-3 w-3" />
                  </div>
                  <p className="font-semibold text-sm">{event.dislikesCount}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-0.5 text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                  </div>
                  <p className="font-semibold text-sm">{event.commentsCount}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-0.5 text-muted-foreground">
                    <Smile className="h-3 w-3" />
                  </div>
                  <p className="font-semibold text-sm">{event.reactionsCount}</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-1 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent text-xs h-8"
                onClick={() => setSelectedEventId(event._id)}
              >
                <Eye className="mr-1 h-3 w-3" />
                Details
              </Button>
              <Button size="sm" variant="outline" className="h-8 px-2 bg-transparent" asChild>
                <Link href={`/admin/edit/${event._id}`}>
                  <Edit className="h-3 w-3" />
                </Link>
              </Button>
              <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => setDeleteId(event._id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedEventId && (
        <EventDetailsDialog
          eventId={selectedEventId}
          open={!!selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
