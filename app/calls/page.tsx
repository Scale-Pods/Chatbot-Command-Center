"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CallRequest {
  phone: string
  name: string
  timeReceivedDate: string
  timeReceivedTime: string
  reason: string
  attendanceStatus: "Attended" | "Not Attended"
}

export default function CallAssistancePage() {
  const [calls, setCalls] = useState<CallRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusMap, setStatusMap] = useState<Record<string, "Attended" | "Not Attended">>({})
  const { toast } = useToast()

  useEffect(() => {
    async function loadCalls() {
      setIsLoading(true)
      try {
        const webhookUrl = "https://n8n.srv1010832.hstgr.cloud/webhook-test/3f525903-059e-4b81-855b-337852ef85f3"

        console.log("[v0] CallsPage: Fetching from webhook:", webhookUrl)

        const response = await fetch(webhookUrl)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseText = await response.text()
        console.log("[v0] CallsPage: Raw webhook response:", responseText)

        if (!responseText) {
          throw new Error("Empty response from webhook")
        }

        const data = JSON.parse(responseText)
        console.log("[v0] CallsPage: Parsed data:", data)

        const meetingsData = data.meetings || []
        console.log("[v0] CallsPage: Meetings array:", meetingsData)

        setCalls(meetingsData)

        // Initialize status map
        const initialStatusMap = meetingsData.reduce(
          (acc: Record<string, string>, call: CallRequest) => ({
            ...acc,
            [call.phone]: call.attendanceStatus,
          }),
          {},
        )
        setStatusMap(initialStatusMap)
      } catch (error) {
        console.error("[v0] CallsPage: Error loading calls:", error)
        toast({
          title: "Error",
          description: "Failed to load call requests",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCalls()
  }, [toast])

  const handleStatusChange = (phone: string, newStatus: "Attended" | "Not Attended") => {
    setStatusMap((prev) => ({
      ...prev,
      [phone]: newStatus,
    }))
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card sticky top-0 z-50 transition-colors duration-300">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">📞 Call Assistance Required</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm font-medium text-muted-foreground">Scalepods</span>
            <Avatar className="h-9 w-9">
              <AvatarImage src="/person-holding-keys.png" />
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-6">
          <p className="text-muted-foreground">Manage and track all incoming call assistance requests</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading call requests...</p>
            </div>
          </div>
        ) : calls.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center h-[300px]">
            <Phone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No call assistance requests at this time</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {calls.map((call) => (
              <Card key={call.phone} className="p-4 hover:bg-accent transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-foreground font-semibold">{call.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-foreground font-mono">{call.phone}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time Received</p>
                    <p className="text-foreground">
                      {call.timeReceivedDate} at {call.timeReceivedTime}
                    </p>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">Reason</p>
                    <p className="text-foreground">{call.reason}</p>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3 flex gap-3 items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Attendance Status</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant={statusMap[call.phone] === "Attended" ? "default" : "outline"}
                          onClick={() => handleStatusChange(call.phone, "Attended")}
                          className="gap-2"
                        >
                          ✅ Attended
                        </Button>
                        <Button
                          size="sm"
                          variant={statusMap[call.phone] === "Not Attended" ? "default" : "outline"}
                          onClick={() => handleStatusChange(call.phone, "Not Attended")}
                          className="gap-2"
                        >
                          ❌ Not Attended
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
