"use client"

import { Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MeetingStatusDropdownProps {
  status: "attended" | "unattended"
  onChange: (status: "attended" | "unattended") => void
}

export function MeetingStatusDropdown({ status, onChange }: MeetingStatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
          <Badge
            variant="secondary"
            className={cn(
              "cursor-pointer transition-colors",
              status === "attended"
                ? "bg-secondary/20 text-secondary hover:bg-secondary/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {status === "attended" ? "Attended" : "Unattended"}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange("attended")} className="gap-2">
          {status === "attended" && <Check className="h-4 w-4" />}
          <span className={status !== "attended" ? "ml-6" : ""}>Attended</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("unattended")} className="gap-2">
          {status === "unattended" && <Check className="h-4 w-4" />}
          <span className={status !== "unattended" ? "ml-6" : ""}>Unattended</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
