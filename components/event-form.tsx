"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createEvent, updateEvent } from "@/app/actions/admin"
import { Loader2, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EventFormProps {
  event?: any
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [category, setCategory] = useState(event?.category || "academic")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(event?.imageUrl || "")
  const [useFileUpload, setUseFileUpload] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("category", category)

    if (useFileUpload && imageFile) {
      const reader = new FileReader()
      reader.onload = async () => {
        formData.set("imageUrl", reader.result as string)
        const result = event ? await updateEvent(event._id, formData) : await createEvent(formData)

        if (result.error) {
          setError(result.error)
          setLoading(false)
        } else {
          router.push("/admin")
          router.refresh()
        }
      }
      reader.readAsDataURL(imageFile)
    } else {
      const result = event ? await updateEvent(event._id, formData) : await createEvent(formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.push("/admin")
        router.refresh()
      }
    }
  }

  return (
    <Card className="relative">
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">{event ? "Updating event..." : "Creating event..."}</p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Spring Festival 2025"
              defaultValue={event?.title}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell students about this event..."
              rows={4}
              defaultValue={event?.description}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={useFileUpload ? "default" : "outline"}
                onClick={() => setUseFileUpload(true)}
                disabled={loading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload from Device
              </Button>
              <Button
                type="button"
                variant={!useFileUpload ? "default" : "outline"}
                onClick={() => setUseFileUpload(false)}
                disabled={loading}
              >
                Use Image URL
              </Button>
            </div>

            {useFileUpload ? (
              <div className="space-y-2">
                <Label htmlFor="imageFile">Select Image File *</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  required={useFileUpload}
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-40 w-full rounded object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  defaultValue={event?.imageUrl}
                  required={!useFileUpload}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={event?.date ? new Date(event.date).toISOString().split("T")[0] : ""}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., Main Auditorium"
              defaultValue={event?.location}
              disabled={loading}
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {event ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{event ? "Update Event" : "Create Event"}</>
            )}
          </Button>

          <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={loading}>
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
