"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  LogOut,
  Loader2,
  Eye,
  Upload,
  LinkIcon,
} from "lucide-react";

// Updated fetcher to handle 401s gracefully
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    // Attempt to read error message if available, otherwise throw generic
    const errorBody = await res
      .json()
      .catch(() => ({ message: res.statusText }));
    throw new Error(errorBody.message || "Auth failed");
  }
  return res.json();
};

interface Event {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  category: string;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  comments: {
    _id: string;
    username: string;
    content: string;
    createdAt: string;
  }[];
  likedBy?: string[];
  dislikedBy?: string[];
}

// Define the initial state object once
const initialFormData = {
  title: "",
  description: "",
  imageUrl: "",
  date: "",
  category: "academic",
};

export default function AdminDashboard() {
  const router = useRouter();

  // --- NEW LOGIN STATE ---
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // --- EXISTING STATE ---
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // New state for action errors
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">(
    "upload"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(initialFormData);

  // --- AUTH CHECK ---
  const {
    data: authData,
    error: authError,
    isLoading: authLoading,
  } = useSWR("/api/admin/auth", fetcher, {
    shouldRetryOnError: false,
    onError: () => {},
  });

  const {
    data: eventsData,
    error: eventsError,
    isLoading,
  } = useSWR(authData?.authenticated ? "/api/admin/events" : null, fetcher);

  // --- LOGIN HANDLER ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setLoginError(errorData.message || "Invalid password");
      } else {
        mutate("/api/admin/auth");
      }
    } catch (error) {
      setLoginError("Something went wrong during sign in");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    mutate("/api/admin/auth");
  };

  // --- EVENT HANDLERS ---

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setApiError(null); // Clear previous errors

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (!res.ok) {
        // If upload fails, set error and reset imageUrl to prevent broken image
        setApiError(data.error || "Image upload failed");
        setFormData((prev) => ({ ...prev, imageUrl: "" }));
        throw new Error(data.error);
      }

      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      console.error("Upload error:", err);
      // setApiError handled above or a generic error is caught here
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Success
        setIsCreateOpen(false);
        setFormData(initialFormData); // Clear state using initial object
        setImageInputMode("upload");
        mutate("/api/admin/events");
      } else {
        // Failure
        const errorData = await res.json();
        setApiError(errorData.message || "Failed to create event.");
      }
    } catch (err) {
      setApiError("A network error occurred during creation.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch(`/api/admin/events/${selectedEvent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Success
        setIsEditOpen(false);
        setSelectedEvent(null);
        setImageInputMode("upload");
        mutate("/api/admin/events");
      } else {
        // Failure
        const errorData = await res.json();
        setApiError(errorData.message || "Failed to update event.");
      }
    } catch (err) {
      setApiError("A network error occurred during update.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        setApiError(errorData.message || "Failed to delete event.");
      } else {
        mutate("/api/admin/events");
      }
    } catch (err) {
      setApiError("A network error occurred during deletion.");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      // Date formatting for input[type="datetime-local"] needs YYYY-MM-DDThh:mm
      date: new Date(event.date).toISOString().slice(0, 16),
      category: event.category,
    });
    setImageInputMode("upload");
    setApiError(null); // Clear errors before opening dialog
    setIsEditOpen(true);
  };

  const openDetailsDialog = async (eventId: string) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch event details.");

      const data = await res.json();
      setSelectedEvent(data.event);
      setIsDetailsOpen(true);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Failed to load event details."
      );
    } finally {
      setLoading(false);
    }
  };

  const events = eventsData?.events || [];
  const totals = eventsData?.totals || {
    totalEvents: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalComments: 0,
  };

  // --- CONDITIONAL RETURNS (Fixes the Loading Issue) ---

  // 1. Show Loading while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Show Login Form if not authenticated
  if (authError || !authData?.authenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Admin Access</CardTitle>
            <CardDescription className="text-center">
              Please enter the password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-500 font-medium">{loginError}</p>
              )}
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Image Input Component is good as is ---
  const ImageInput = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>Event Image</Label>
        <div className="flex gap-1 ml-auto">
          <Button
            type="button"
            variant={imageInputMode === "upload" ? "default" : "ghost"}
            size="sm"
            className={
              imageInputMode === "upload" ? "bg-purple-500 text-white" : ""
            }
            onClick={() => {
              setImageInputMode("upload");
              setApiError(null);
            }}
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
          <Button
            type="button"
            variant={imageInputMode === "url" ? "default" : "ghost"}
            size="sm"
            className={
              imageInputMode === "url" ? "bg-purple-500 text-white" : ""
            }
            onClick={() => {
              setImageInputMode("url");
              setApiError(null);
            }}
          >
            <LinkIcon className="h-3 w-3 mr-1" />
            URL
          </Button>
        </div>
      </div>

      {imageInputMode === "upload" ? (
        <div className="space-y-2">
          <input
            type="file"
            ref={isEdit ? editFileInputRef : fileInputRef}
            onChange={(e) => handleImageUpload(e, isEdit)}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full h-24 border-dashed flex flex-col gap-2 bg-transparent"
            onClick={() =>
              (isEdit ? editFileInputRef : fileInputRef).current?.click()
            }
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : formData.imageUrl ? (
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-24 rounded overflow-hidden">
                  <Image
                    src={formData.imageUrl || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  Click to change
                </span>
              </div>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload image
                </span>
              </>
            )}
          </Button>
        </div>
      ) : (
        <Input
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          placeholder="https://example.com/image.jpg"
        />
      )}

      {formData.imageUrl && imageInputMode === "url" && (
        <div className="relative h-24 w-full rounded-lg overflow-hidden">
          <Image
            src={formData.imageUrl || "/placeholder.svg"}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );

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
        {/* Global API Error Display */}
        {apiError && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{apiError}</p>
          </div>
        )}

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
              <CardDescription>
                Create, edit, and manage campus events
              </CardDescription>
            </div>
            <Dialog
              open={isCreateOpen}
              onOpenChange={(open) => {
                setIsCreateOpen(open);
                // Reset form state on dialog close
                if (!open) {
                  setFormData(initialFormData);
                  setImageInputMode("upload");
                  setApiError(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new event
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <ImageInput />
                  {apiError && (
                    <p className="text-sm text-red-500 font-medium">
                      {apiError}
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
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
                      disabled={loading || uploadingImage}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Create Event"
                      )}
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
            ) : eventsError ? (
              <div className="text-center py-12 text-destructive font-medium">
                Error loading events. Please check server logs.
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No events created yet
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event: Event) => (
                  <div
                    key={event._id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative h-20 w-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          event.imageUrl ||
                          "/placeholder.svg?height=80&width=128&query=event"
                        }
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{event.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {event.description}
                      </p>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetailsDialog(event._id)}
                        disabled={loading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(event)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{event.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(event._id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                "Delete"
                              )}
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

        {/* Edit Dialog - Updated with ImageInput component */}
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) {
              setImageInputMode("upload");
              setApiError(null);
            }
          }}
        >
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <ImageInput isEdit />
              {apiError && (
                <p className="text-sm text-red-500 font-medium">{apiError}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date & Time</Label>
                <Input
                  id="edit-date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
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
                  disabled={loading || uploadingImage}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog
          open={isDetailsOpen}
          onOpenChange={(open) => {
            setIsDetailsOpen(open);
            if (!open) {
              setSelectedEvent(null);
              setApiError(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <DialogDescription>
                Event details and engagement analytics
              </DialogDescription>
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
                      src={
                        selectedEvent.imageUrl ||
                        "/placeholder.svg?height=300&width=500&query=event"
                      }
                      alt={selectedEvent.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-muted-foreground">
                    {selectedEvent.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedEvent.date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
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
                        <p className="text-2xl font-bold">
                          {selectedEvent.likesCount}
                        </p>
                        <p className="text-sm text-muted-foreground">Likes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <ThumbsDown className="h-6 w-6 mx-auto text-red-500 mb-2" />
                        <p className="text-2xl font-bold">
                          {selectedEvent.dislikesCount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Dislikes
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <MessageCircle className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold">
                          {selectedEvent.commentsCount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Comments
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="comments" className="space-y-4">
                  {/* Display Comments here */}
                  {selectedEvent.comments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEvent.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="p-3 border rounded-lg bg-gray-50"
                        >
                          <p className="font-semibold text-sm">
                            {comment.username}
                          </p>
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No comments for this event yet.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
