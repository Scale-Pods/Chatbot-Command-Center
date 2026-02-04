"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { updateMeetingAttendance } from "@/app/actions/update-meeting-attendance"
import { useToast } from "@/hooks/use-toast"

interface MeetingAttendanceDropdownProps {
  phone: string
  attendanceStatus: "Attended" | "Not Attended"
  onStatusChange?: (newStatus: "Attended" | "Not Attended") => void
}

export function MeetingAttendanceDropdown({ phone, attendanceStatus, onStatusChange }: MeetingAttendanceDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleStatusChange = async (newStatus: "Attended" | "Not Attended") => {
    setIsLoading(true)
    try {
      const result = await updateMeetingAttendance({
        phone,
        attendanceStatus: newStatus,
      })

      if (result.success) {
        onStatusChange?.(newStatus)
        toast({
          title: "Success",
          description: "Attendance status updated",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update attendance status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Updating...</span>
            </div>
          ) : (
            <Badge
              variant="secondary"
              className={cn(
                "cursor-pointer transition-colors",
                attendanceStatus === "Attended"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
              )}
            >
              {attendanceStatus}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("Attended")} disabled={isLoading} className="gap-2">
          {attendanceStatus === "Attended" && <Check className="h-4 w-4" />}
          <span className={attendanceStatus !== "Attended" ? "ml-6" : ""}>Attended</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("Not Attended")} disabled={isLoading} className="gap-2">
          {attendanceStatus === "Not Attended" && <Check className="h-4 w-4" />}
          <span className={attendanceStatus !== "Not Attended" ? "ml-6" : ""}>Not Attended</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
