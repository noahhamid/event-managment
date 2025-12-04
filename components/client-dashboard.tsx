"use client"

import { useState, useMemo } from "react"
import { EventCard } from "@/components/event-card"
import { FilterBar } from "@/components/filter-bar"
import { SearchBar } from "@/components/search-bar"

interface ClientDashboardProps {
  initialEvents: any[]
  currentFilter: string
  currentUserId: string
  error?: string
}

export function ClientDashboard({ initialEvents, currentFilter, currentUserId, error }: ClientDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState("latest")

  const filteredEvents = useMemo(() => {
    let events = initialEvents

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.category?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query),
      )
    }

    if (sortOrder === "oldest") {
      events = [...events].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortOrder === "popular") {
      events = [...events].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    } else {
      events = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return events
  }, [initialEvents, searchQuery, sortOrder])

  return (
    <>
      <SearchBar onSearch={setSearchQuery} />
      <FilterBar currentFilter={currentFilter} currentSort={sortOrder} onSortChange={setSortOrder} />

      {error ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : filteredEvents && filteredEvents.length > 0 ? (
        <div className="mx-auto max-w-xl space-y-4">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} currentUserId={currentUserId} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">No events match your search</p>
          <p className="text-sm text-muted-foreground">Try different keywords or browse all events</p>
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">No events found</p>
          <p className="text-sm text-muted-foreground">Check back later for upcoming campus events</p>
        </div>
      )}
    </>
  )
}
