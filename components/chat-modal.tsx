"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, MessageSquare, Mail, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type User = {
  id: number
  name: string
  channel: string
  lastInteraction: string
  status: string
  avatar: string
  summary: string
  messages: Array<{ sender: string; text: string; time: string }>
}

interface ChatModalProps {
  user: User
  onClose: () => void
}

export function ChatModal({ user, onClose }: ChatModalProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />
      case "gmail":
        return <Mail className="h-4 w-4" />
      case "website":
        return <Globe className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getChannelIcon(user.channel)}
              <h3 className="font-semibold text-foreground text-lg">{user.name}</h3>
            </div>
            <Badge variant="secondary" className="capitalize">
              {user.channel}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {user.messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === "user" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  message.sender === "user" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender === "user" ? "text-muted-foreground" : "text-primary-foreground/70"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ChatModal
