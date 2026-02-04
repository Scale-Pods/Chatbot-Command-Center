"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Mail, Globe, Clock, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { fetchUsersFromWebhook, type User } from "@/app/actions/fetch-users"
import { Button } from "@/components/ui/button"

interface UserListProps {
  users?: User[]
  selectedUser: User | null
  onSelectUser: (user: User) => void
  highlightedUserId?: string | null
}

export function UserList({ users = [], selectedUser, onSelectUser, highlightedUserId }: UserListProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Determine if we should show a loading state (optional, can be passed as prop but keeping simple)
  // If users array is empty, we just show empty state. Loading state is handled better by parent if needed.
  
  const getChannelIcon = (channel: string) => {
    const normalizedChannel = channel?.toLowerCase() || ""
    switch (normalizedChannel) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-secondary" />
      case "gmail":
      case "email":
        return <Mail className="h-4 w-4 text-primary" />
      case "website":
      case "web":
        return <Globe className="h-4 w-4 text-chart-4" />
      case "instagram":
        return <MessageSquare className="h-4 w-4 text-pink-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (users.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center text-center h-[600px]">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
        <p className="text-sm text-muted-foreground">No chat data available for this channel</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden h-[600px] transition-colors duration-300">
      <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Users ({users.length})</h3>
      </div>
      <div className="overflow-y-auto h-[calc(600px-57px)] scrollbar-thin">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={cn(
              "w-full p-4 border-b border-border hover:bg-accent transition-all text-left",
              selectedUser?.id === user.id && "bg-accent",
              highlightedUserId === user.id && "ring-2 ring-primary ring-inset animate-pulse",
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
                  {getChannelIcon(user.channel)}
                </div>
                {user.channel === "instagram" && user.session_id && (
                  <div className="text-xs text-muted-foreground mb-1 font-mono">
                    ID: {user.session_id}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Clock className="h-3 w-3" />
                  <span>{user.lastInteraction || "No interaction"}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}

