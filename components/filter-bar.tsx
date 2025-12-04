"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const categories = [
  { label: "All Events", value: "all" },
  { label: "Academic", value: "academic" },
  { label: "Sports", value: "sports" },
  { label: "Social", value: "social" },
  { label: "Arts", value: "arts" },
  { label: "Career", value: "career" },
]

const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Popular", value: "popular" },
]

interface FilterBarProps {
  currentFilter: string
  currentSort?: string
  onSortChange?: (sort: string) => void
}

export function FilterBar({ currentFilter, currentSort = "latest", onSortChange }: FilterBarProps) {
  const router = useRouter()
  const currentLabel = categories.find((c) => c.value === currentFilter)?.label || "All Events"
  const currentSortLabel = sortOptions.find((s) => s.value === currentSort)?.label || "Latest"

  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-fit bg-transparent">
            {currentLabel}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {categories.map((category) => (
            <DropdownMenuItem
              key={category.value}
              onClick={() => router.push(`/dashboard?filter=${category.value}`)}
              className={currentFilter === category.value ? "bg-primary/20" : ""}
            >
              {category.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-fit bg-transparent">
            {currentSortLabel}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSortChange?.(option.value)}
              className={currentSort === option.value ? "bg-primary/20" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
