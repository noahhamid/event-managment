import { redirect, notFound } from "next/navigation"
import { getAdminSession } from "@/lib/auth-utils"
import { getEventDetails } from "@/app/actions/admin"
import { EventForm } from "@/components/event-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const isAdmin = await getAdminSession()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  const { id } = await params
  const result = await getEventDetails(id)

  if (result.error || !result.event) {
    notFound()
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
          <h1 className="mb-2 text-3xl font-bold">Edit Event</h1>
          <p className="mb-8 text-muted-foreground">Update the event details below</p>

          <EventForm event={result.event} />
        </div>
      </div>
    </div>
  )
}
