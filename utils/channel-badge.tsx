import { Badge } from "@/components/ui/badge"
import { Globe, Mail, MessageSquare } from "lucide-react"

export function getChannelBadge(channel: string | undefined) {
  const normalizedChannel = channel?.toLowerCase() || ""
  
  switch (normalizedChannel) {
    case "website":
    case "web":
      return (
        <Badge variant="secondary" className="gap-1">
          <Globe className="h-3 w-3" />
          Website
        </Badge>
      )
    case "instagram":
      return (
        <Badge variant="outline" className="gap-1 border-pink-500 text-pink-500">
          <MessageSquare className="h-3 w-3" />
          Instagram
        </Badge>
      )
    case "gmail":
    case "email":
      return (
        <Badge variant="outline" className="gap-1 border-red-500 text-red-500">
          <Mail className="h-3 w-3" />
          Gmail
        </Badge>
      )
    case "whatsapp":
      return (
        <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
          <MessageSquare className="h-3 w-3" />
          WhatsApp
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <MessageSquare className="h-3 w-3" />
          {channel || "Unknown"}
        </Badge>
      )
  }
}
