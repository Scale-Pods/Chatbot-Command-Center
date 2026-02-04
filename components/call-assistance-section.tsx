"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail } from "lucide-react"
import { useState, useEffect } from "react"

const CallAssistanceSection = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [meetings, setMeetings] = useState([])
  const [scheduledMeetings, setScheduledMeetings] = useState([])
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(true)
  const [attendanceStatus, setAttendanceStatus] = useState({})
  const [leads, setLeads] = useState([])
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)
  const [leadsPage, setLeadsPage] = useState(1)
  const leadsPerPage = 10

  const convertISTToLocal = (dateString, timeString) => {
    if (!dateString || !timeString) return "TBD"

    try {
      // Parse date in DD/MM/YYYY format and time in HH:MM format
      const [day, month, year] = dateString.split("/")
      const [hours, minutes] = timeString.split(":")

      // Create a date string in ISO format, assuming IST (UTC+5:30)
      const dateObj = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00+05:30`)

      // Format for display in local timezone
      const localTime = dateObj.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })

      return localTime
    } catch (error) {
      console.error("[v0] Error converting timezone:", error)
      return `${dateString} at ${timeString}`
    }
  }

  const fetchMeetings = async () => {
    try {
      console.log("[v0] Fetching call assistance from webhook...")
      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/3f525903-059e-4b81-855b-337852ef85f3")

      if (!response.ok || response.status === 204) {
        console.log("[v0] Webhook returned empty or error response")
        setMeetings([])
        setIsLoading(false)
        return
      }

      const responseText = await response.text()
      if (!responseText || responseText.trim() === "") {
        console.log("[v0] Call assistance webhook returned empty response body")
        setMeetings([])
      } else {
        try {
          const data = JSON.parse(responseText)
          console.log("[v0] Call assistance webhook response:", data)
          if (data.meetings) {
            setMeetings(data.meetings)
          } else {
            setMeetings([])
          }
        } catch (parseError) {
          console.error("[v0] Failed to parse call assistance JSON:", parseError)
          setMeetings([])
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching call assistance:", error)
      setMeetings([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchScheduledMeetings = async () => {
    try {
      console.log("[v0] Fetching scheduled meetings from webhook...")
      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/9f31cf56-c721-4cc8-96b4-ac9c70574de3")

      if (!response.ok || response.status === 204) {
        console.log("[v0] Webhook returned empty or error response")
        setScheduledMeetings([])
        setIsLoadingScheduled(false)
        return
      }

      const responseText = await response.text()
      if (!responseText || responseText.trim() === "") {
        console.log("[v0] Scheduled meetings webhook returned empty response body")
        setScheduledMeetings([])
      } else {
        try {
          const data = JSON.parse(responseText)
          console.log("[v0] Scheduled meetings webhook response:", data)
          if (Array.isArray(data)) {
            setScheduledMeetings(data)
          } else if (data.meetings && Array.isArray(data.meetings)) {
            setScheduledMeetings(data.meetings)
          } else {
            setScheduledMeetings([])
          }
        } catch (parseError) {
          console.error("[v0] Failed to parse scheduled meetings JSON:", parseError)
          setScheduledMeetings([])
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching scheduled meetings:", error)
      setScheduledMeetings([])
    } finally {
      setIsLoadingScheduled(false)
    }
  }

  const fetchLeads = async () => {
    try {
      console.log("[v0] Fetching website leads from webhook...")
      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/b58a93d0-78f4-4b2b-9205-3283065ceafc")

      if (!response.ok || response.status === 204) {
        console.log("[v0] Webhook returned empty or error response")
        setLeads([])
        setIsLoadingLeads(false)
        return
      }

      const responseText = await response.text()
      if (!responseText || responseText.trim() === "") {
        console.log("[v0] Website leads webhook returned empty response body")
        setLeads([])
      } else {
        try {
          const data = JSON.parse(responseText)
          console.log("[v0] Website leads webhook response:", data)
          if (Array.isArray(data)) {
            setLeads(data)
          } else if (data.meetings && Array.isArray(data.meetings)) {
            setLeads(data.meetings)
          } else if (data.leads && Array.isArray(data.leads)) {
            setLeads(data.leads)
          } else {
            setLeads([])
          }
        } catch (parseError) {
          console.error("[v0] Failed to parse website leads JSON:", parseError)
          setLeads([])
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching website leads:", error)
      setLeads([])
    } finally {
      setIsLoadingLeads(false)
    }
  }

  useEffect(() => {
    // Load saved attendance status from localStorage on mount
    const savedStatus = localStorage.getItem("callAttendanceStatus")
    if (savedStatus) {
      try {
        setAttendanceStatus(JSON.parse(savedStatus))
      } catch (e) {
        console.error("[v0] Failed to parse saved attendance status:", e)
      }
    }

    // Initial fetch on mount
    fetchMeetings()
    fetchScheduledMeetings()
    fetchLeads()
  }, [])

  useEffect(() => {
    localStorage.setItem("callAttendanceStatus", JSON.stringify(attendanceStatus))
  }, [attendanceStatus])

  const handleAttendanceChange = (phone, status) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [phone]: status,
    }))
  }

  const paginatedLeads = leads.slice((leadsPage - 1) * leadsPerPage, leadsPage * leadsPerPage)
  const totalLeadsPages = Math.ceil(leads.length / leadsPerPage)

  if (isLoading || isLoadingScheduled || isLoadingLeads) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-40 bg-card rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Call Assistance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Assistance Section */}
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Call Assistance Required</h2>
            <p className="text-muted-foreground">
              {meetings.length} {meetings.length === 1 ? "call request" : "call requests"} pending
            </p>
          </div>

          {meetings.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center h-40">
              <Phone className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No call requests at this time</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {meetings.map((request, index) => {
                const status = attendanceStatus[request.phone]
                const timeReceived = `${request.timeReceivedDate} ${request.timeReceivedTime}`

                return (
                  <Card key={index} className="p-4 transition-colors hover:bg-muted/50">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{request.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{request.name}</h3>
                            <a
                              href={`tel:${request.phone}`}
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <Phone className="h-3 w-3" />
                              {request.phone}
                            </a>
                          </div>
                        </div>
                        <Badge
                          variant={
                            status === "attended" ? "default" : status === "not_attended" ? "destructive" : "secondary"
                          }
                        >
                          {status === "attended" ? "Attended" : status === "not_attended" ? "Not Attended" : "Pending"}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground font-medium">Time Received</p>
                          <p className="text-foreground">{timeReceived}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Reason</p>
                          <p className="text-foreground line-clamp-2">{request.reason}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant={status === "attended" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAttendanceChange(request.phone, "attended")}
                          className="flex-1"
                        >
                          ✓ Attended
                        </Button>
                        <Button
                          variant={status === "not_attended" ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleAttendanceChange(request.phone, "not_attended")}
                          className="flex-1"
                        >
                          ✕ Not Attended
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Meetings Scheduled Section */}
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Meetings Scheduled</h2>
            <p className="text-muted-foreground">
              {scheduledMeetings.length} {scheduledMeetings.length === 1 ? "meeting" : "meetings"} scheduled
            </p>
          </div>

          {scheduledMeetings.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center h-40">
              <Phone className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No scheduled meetings</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {scheduledMeetings.map((meeting, index) => {
                const meetingDateTime =
                  meeting.meetingDate && meeting.meetingTime
                    ? convertISTToLocal(meeting.meetingDate, meeting.meetingTime)
                    : "TBD"

                return (
                  <Card key={index} className="p-4 transition-colors hover:bg-muted/50">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{meeting.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{meeting.name || "Client"}</h3>
                            {meeting.phone && (
                              <a
                                href={`tel:${meeting.phone}`}
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <Phone className="h-3 w-3" />
                                {meeting.phone}
                              </a>
                            )}
                          </div>
                        </div>
                        <Badge variant="default">{meeting.attendanceStatus || "Scheduled"}</Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground font-medium">Meeting Time</p>
                          <p className="text-foreground">{meetingDateTime}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Reason</p>
                          <p className="text-foreground line-clamp-2">{meeting.reason || "No details"}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Website Lead Form Section */}
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Website Lead Form</h2>
          <p className="text-muted-foreground">
            {leads.length} {leads.length === 1 ? "lead" : "leads"} received
          </p>
        </div>

        {leads.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center h-40">
            <Phone className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No leads at this time</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {paginatedLeads.map((lead, index) => (
                <Card key={index} className="p-4 transition-colors hover:bg-muted/50">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{lead.name?.charAt(0).toUpperCase() || "L"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{lead.name || "Lead"}</h3>
                          {lead.email && (
                            <a
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              {lead.email}
                            </a>
                          )}
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {Object.entries(lead).map(([key, value]) => {
                        if (
                          key === "name" ||
                          key === "email" ||
                          key === "phone" ||
                          !value ||
                          typeof value === "object"
                        ) {
                          return null
                        }
                        return (
                          <div key={key}>
                            <p className="text-muted-foreground font-medium capitalize">{key.replace(/_/g, " ")}</p>
                            <p className="text-foreground line-clamp-2">{String(value)}</p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {totalLeadsPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLeadsPage(Math.max(1, leadsPage - 1))}
                  disabled={leadsPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalLeadsPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === leadsPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLeadsPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLeadsPage(Math.min(totalLeadsPages, leadsPage + 1))}
                  disabled={leadsPage === totalLeadsPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CallAssistanceSection
