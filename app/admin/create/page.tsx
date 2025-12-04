import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/auth-utils"
import { EventForm } from "@/components/event-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CreateEventPage() {
  const isAdmin = await getAdminSession()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold">Create New Event</h1>
          <p className="mb-8 text-muted-foreground">Fill in the details to create a new campus event</p>

          <EventForm />
        </div>
      </div>
    </div>
  )
}
