import { Card } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, Phone } from "lucide-react"

type User = {
  id: string
  name: string
  channel: string
  lastInteraction: string
  status: string
  avatar: string
  summary: string
  messages: Array<{
    role: "user" | "assistant"
    message: string
    time: string
  }>
}

interface StatsCardsProps {
  websiteCount: number
  instagramCount: number
  whatsappCount: number
  gmailCount: number
  callAssistanceCount?: number
  scheduledMeetingsCount?: number
}

export function StatsCards({
  websiteCount = 0,
  instagramCount = 0,
  whatsappCount = 0,
  gmailCount = 0,
  callAssistanceCount = 0,
  scheduledMeetingsCount = 0,
}: StatsCardsProps) {
  const totalUsers = websiteCount + instagramCount + whatsappCount + gmailCount
  const meetingsBooked = callAssistanceCount + scheduledMeetingsCount
  const conversionRate = totalUsers > 0 ? Math.round((meetingsBooked / totalUsers) * 100) : 0

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Users Interacted */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Users Interacted</p>
            <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Website</p>
            <p className="text-sm font-semibold">{websiteCount}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Instagram</p>
            <p className="text-sm font-semibold">{instagramCount}</p>
          </div>
           <div className="text-center">
            <p className="text-[10px] text-muted-foreground mb-1">WhatsApp</p>
            <p className="text-sm font-semibold">{whatsappCount}</p>
          </div>
           <div className="text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Gmail</p>
            <p className="text-sm font-semibold">{gmailCount}</p>
          </div>
        </div>
      </Card>

      {/* Meetings Booked - with Call and Meet subsections */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Meetings Booked</p>
            <p className="text-3xl font-bold text-foreground">{meetingsBooked.toString()}</p>
          </div>
          <div className="bg-chart-3/10 p-3 rounded-lg">
            <Calendar className="h-5 w-5 text-chart-3" />
          </div>
        </div>
        <div className="flex gap-4 pt-4 border-t border-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Call</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{callAssistanceCount}</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Meet</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{scheduledMeetingsCount}</p>
          </div>
        </div>
      </Card>

      {/* Conversion Rate */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
            <p className="text-3xl font-bold text-foreground">{conversionRate}%</p>
          </div>
          <div className="bg-chart-4/10 p-3 rounded-lg">
            <TrendingUp className="h-5 w-5 text-chart-4" />
          </div>
        </div>
      </Card>
    </div>
  )
}
