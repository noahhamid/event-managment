"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

import { useState } from "react";

import type React from "react";
import { useOptimistic } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Smile,
  Send,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  likeEvent,
  dislikeEvent,
  addComment,
  addReaction,
} from "@/app/actions/events";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdBy: string;
    createdAt: Date;
    likes: string[];
    dislikes: string[];
    comments: Array<{
      _id: string;
      userId: string;
      username: string;
      text: string;
      createdAt: Date;
    }>;
    reactions: Array<{
      userId: string;
      emoji: string;
    }>;
    category?: string;
    date?: Date;
    location?: string;
  };
  currentUserId: string;
}

export function EventCard({ event, currentUserId }: EventCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isPending, startTransition] = useTransition();

  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    event.likes || [],
    (state, action: any) => {
      if (action.type === "LIKE") {
        return action.remove
          ? state.filter((id) => id !== currentUserId)
          : [...state, currentUserId];
      }
      if (action.type === "REMOVE_DISLIKE") {
        return state;
      }
      return state;
    }
  );

  const [optimisticDislikes, setOptimisticDislikes] = useOptimistic(
    event.dislikes || [],
    (state, action: any) => {
      if (action.type === "DISLIKE") {
        return action.remove
          ? state.filter((id) => id !== currentUserId)
          : [...state, currentUserId];
      }
      if (action.type === "REMOVE_LIKE") {
        return state;
      }
      return state;
    }
  );

  const [comments, setComments] = useOptimistic(
    event.comments || [],
    (state, action: any) => {
      if (action.type === "COMMENT") {
        return [...state, action.newComment];
      }
      return state;
    }
  );

  const [reactions, setReactions] = useOptimistic(
    event.reactions || [],
    (state, action: any) => {
      if (action.type === "REACTION") {
        const existingReactionIndex = state.findIndex(
          (r) => r.userId === currentUserId
        );
        return existingReactionIndex >= 0
          ? [
              ...state.slice(0, existingReactionIndex),
              { userId: currentUserId, emoji: action.emoji },
              ...state.slice(existingReactionIndex + 1),
            ]
          : [...state, { userId: currentUserId, emoji: action.emoji }];
      }
      return state;
    }
  );

  const hasLiked = optimisticLikes.includes(currentUserId);
  const hasDisliked = optimisticDislikes.includes(currentUserId);

  const handleLike = () => {
    startTransition(async () => {
      if (hasDisliked) {
        setOptimisticDislikes({ type: "REMOVE_LIKE" });
      }
      setOptimisticLikes({ type: "LIKE", remove: hasLiked });

      // Fire and forget - don't await
      likeEvent(event._id);
    });
  };

  const handleDislike = () => {
    startTransition(async () => {
      if (hasLiked) {
        setOptimisticLikes({ type: "REMOVE_DISLIKE" });
      }
      setOptimisticDislikes({ type: "DISLIKE", remove: hasDisliked });

      // Fire and forget - don't await
      dislikeEvent(event._id);
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    startTransition(async () => {
      const newComment = {
        _id: Math.random().toString(),
        userId: currentUserId,
        username: "You",
        text: commentText,
        createdAt: new Date(),
      };

      setComments({ type: "COMMENT", newComment });
      const text = commentText;
      setCommentText("");

      // Fire and forget - don't await
      addComment(event._id, text);
    });
  };

  const handleReaction = (emoji: string) => {
    startTransition(async () => {
      setReactions({ type: "REACTION", emoji });
      // Fire and forget - don't await
      addReaction(event._id, emoji);
    });
  };

  // Group reactions by emoji
  const reactionCounts =
    reactions.reduce(
      (acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  return (
    <Card className="overflow-hidden relative">
      {isPending && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Updating...</p>
          </div>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {event.createdBy.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{event.createdBy}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(event.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          {event.category && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {event.category}
            </span>
          )}
        </div>
      </CardHeader>

      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <img
          src={event.imageUrl || "/placeholder.svg"}
          alt={event.title}
          className="h-full w-full object-cover"
        />
      </div>

      <CardContent className="pt-4">
        <h3 className="mb-2 text-xl font-bold">{event.title}</h3>
        <p className="mb-3 text-muted-foreground leading-relaxed">
          {event.description}
        </p>

        {(event.date || event.location) && (
          <div className="mb-3 space-y-1">
            {event.date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm font-medium">
          <span>{optimisticLikes?.length || 0} likes</span>
          <span>{comments?.length || 0} comments</span>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3 pt-0">
        <div className="flex w-full items-center gap-2">
          <Button
            variant={hasLiked ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={handleLike}
            disabled={isPending}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Like
          </Button>

          <Button
            variant={hasDisliked ? "destructive" : "outline"}
            size="sm"
            className="flex-1"
            onClick={handleDislike}
            disabled={isPending}
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Dislike
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => setShowComments(!showComments)}
            disabled={isPending}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Comment
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex gap-2">
                {["❤️", "🔥", "👏", "🎉", "😍", "🤩"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-2xl transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex w-full flex-wrap gap-2">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <span
                key={emoji}
                className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
              >
                <span>{emoji}</span>
                <span className="font-medium">{count}</span>
              </span>
            ))}
          </div>
        )}

        {showComments && (
          <div className="w-full space-y-3 border-t pt-3">
            <form onSubmit={handleComment} className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isPending}
              />
              <Button type="submit" size="icon" disabled={isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {comments && comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comment.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-lg bg-muted p-2">
                      <p className="text-sm font-semibold">
                        {comment.username}
                      </p>
                      <p className="text-sm">{comment.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
