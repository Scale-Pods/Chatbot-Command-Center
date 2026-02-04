"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MeetingAttendanceDropdown } from "@/components/meeting-attendance-dropdown"

export interface Meeting {
  phone: string
  name: string
  timeReceivedDate: string
  timeReceivedTime: string
  reason: string
  attendanceStatus: "Attended" | "Not Attended"
}

interface MeetingsTableProps {
  meetings: Meeting[]
  onMeetingClick?: (phone: string) => void
}

export function MeetingsTable({ meetings, onMeetingClick }: MeetingsTableProps) {
  const [localAttendanceStatus, setLocalAttendanceStatus] = useState<Record<string, "Attended" | "Not Attended">>(
    meetings.reduce(
      (acc, meeting) => ({
        ...acc,
        [meeting.phone]: meeting.attendanceStatus,
      }),
      {},
    ),
  )

  const handleAttendanceChange = (phone: string, newStatus: "Attended" | "Not Attended") => {
    setLocalAttendanceStatus((prev) => ({
      ...prev,
      [phone]: newStatus,
    }))
  }

  if (meetings.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center text-center h-[300px]">
        <p className="text-muted-foreground">No meetings found</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-muted/30 border-b border-border transition-colors">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-semibold text-foreground">Name</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-foreground">Phone</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-foreground">Time Received Date</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-foreground">Time Received Time</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-foreground">Reason</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr
                key={meeting.phone}
                className={cn(
                  "border-b border-border transition-all cursor-pointer",
                  "hover:bg-accent hover:shadow-sm",
                )}
              >
                <td className="py-4 px-6">
                  <span className="font-medium text-foreground">{meeting.name}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-muted-foreground">{meeting.phone}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-foreground">{meeting.timeReceivedDate}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-foreground">{meeting.timeReceivedTime}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-foreground truncate" title={meeting.reason}>
                    {meeting.reason}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <MeetingAttendanceDropdown
                    phone={meeting.phone}
                    attendanceStatus={localAttendanceStatus[meeting.phone] || meeting.attendanceStatus}
                    onStatusChange={(newStatus) => handleAttendanceChange(meeting.phone, newStatus)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
