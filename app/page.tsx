"use client"

import { useRef } from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MessageSquare, Settings, Search, Mail, Globe, X, Phone, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { StatsCards } from "@/components/stats-cards"
import { UserList } from "@/components/user-list"
import { ConversationPanel } from "@/components/conversation-panel"
import { fetchUsersFromWebhook, type User } from "@/app/actions/fetch-users"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChannelSelector } from "@/components/channel-selector"
import ChatModal from "@/components/chat-modal"
import { useToast } from "@/hooks/use-toast"
import CallAssistanceSection from "@/components/call-assistance-section"
import { ReviewsPanel } from "@/components/reviews-panel"

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [instagramUsers, setInstagramUsers] = useState<User[]>([])
  const [gmailUsers, setGmailUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [connectedUserIds, setConnectedUserIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  // Load connected sessions from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("connected_sessions")
      if (stored) {
        setConnectedUserIds(new Set(JSON.parse(stored)))
      }
    } catch (e) {
      console.error("Failed to load connected sessions", e)
    }
  }, [])

  // Save connected sessions whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("connected_sessions", JSON.stringify(Array.from(connectedUserIds)))
    } catch (e) {
      console.error("Failed to save connected sessions", e)
    }
  }, [connectedUserIds])
  const [channelFilter, setChannelFilter] = useState<string | null>(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [highlightedUserId, setHighlightedUserId] = useState<string | null>(null)
  const [callAssistanceCount, setCallAssistanceCount] = useState(0)
  const [scheduledMeetingsCount, setScheduledMeetingsCount] = useState(0)
  const [websiteLeadsCount, setWebsiteLeadsCount] = useState(0)
  const [showReviews, setShowReviews] = useState(false)
  const [activeChannel, setActiveChannel] = useState<"website" | "instagram" | "gmail">("website")
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Fetch Instagram users from webhook
  const fetchInstagramUsers = async () => {
    try {
      const response = await fetch("/api/instagram")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const instagramData = await response.json()
      // API now returns array of properly formatted User objects
      const instagramUsersList = Array.isArray(instagramData) ? instagramData : []
      setInstagramUsers(instagramUsersList)
    } catch (error) {
      console.error("[v0] Error fetching Instagram users:", error)
    }
  }

  // Fetch Gmail users from webhook
  const fetchGmailUsers = async () => {
    try {
      const response = await fetch("/api/gmail")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const gmailData = await response.json()
      let gmailUsersList: any[] = []

      if (Array.isArray(gmailData)) {
        gmailUsersList = gmailData
      } else if (gmailData.users && Array.isArray(gmailData.users)) {
        gmailUsersList = gmailData.users
      } else if (gmailData.sessions && Array.isArray(gmailData.sessions)) {
        gmailUsersList = gmailData.sessions
      } else if (gmailData.data && Array.isArray(gmailData.data)) {
        gmailUsersList = gmailData.data
      }

      setGmailUsers(gmailUsersList)
    } catch (error) {
      console.error("[v0] Error fetching Gmail users:", error)
    }
  }


  const handleRefresh = async () => {
    setIsLoadingUsers(true)
    try {
      switch (activeChannel) {
        case "instagram":
          await fetchInstagramUsers()
          break
        case "gmail":
          await fetchGmailUsers()
          break
        case "website":
        default:
          const fetchedUsers = await fetchUsersFromWebhook("website")
          setUsers(fetchedUsers)
          break
      }
      toast({
        title: "Refreshed",
        description: `Latest data loaded for ${activeChannel}`,
      })
    } catch (error) {
      console.error("Refresh failed:", error)
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    async function loadUsers() {
      setIsLoadingUsers(true)
      try {
        // Fetch Website users - send "website" as channel
        const fetchedUsers = await fetchUsersFromWebhook("website")
        setUsers(fetchedUsers)
        if (fetchedUsers.length > 0) {
          setSelectedUser(fetchedUsers[0])
        }

        // Initial fetch for Instagram and Gmail
        await fetchInstagramUsers()
        await fetchGmailUsers()
      } catch (error) {
        console.error("[v0] Error loading users:", error)
        toast({
          title: "Error",
          description: "Failed to load users from webhook",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [toast])

  // Poll only the active channel every 10 seconds
  useEffect(() => {
    const pollActiveChannel = async () => {
      // Don't poll if page is hidden
      if (typeof document !== "undefined" && document.hidden) {
        return
      }

      switch (activeChannel) {
        case "instagram":
          await fetchInstagramUsers()
          break
        case "gmail":
          await fetchGmailUsers()
          break
        case "website":
        default:
          const fetchedUsers = await fetchUsersFromWebhook("website")
          setUsers(fetchedUsers)
          break
      }
    }

    // Reset selected user when channel changes to prevent cross-polling
    setSelectedUser(null)

    pollActiveChannel() // Fetch immediately on channel switch
    pollingIntervalRef.current = setInterval(pollActiveChannel, 30000)

    // Poll immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollActiveChannel()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [activeChannel])

  const getCurrentChannelUsers = () => {
    switch (activeChannel) {
      case "instagram":
        return instagramUsers
      case "gmail":
        return gmailUsers
      case "website":
      default:
        return users
    }
  }

  // Clear selected user when switching channels
  useEffect(() => {
    setSelectedUser(null)
  }, [activeChannel])

  const currentUsers = getCurrentChannelUsers()
  const filteredUsers = currentUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChannel = !channelFilter || user.channel === channelFilter
    return matchesSearch && matchesChannel
  })

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card sticky top-0 z-50 transition-colors duration-300">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="https://framerusercontent.com/images/sTvMZBHEzwH4fTjPgKO2PS3htho.png?scale-down-to=2048&width=2363&height=2363" alt="Scalepods" width={32} height={32} className="rounded" />
              <h1 className="text-xl font-semibold text-foreground">Chatbot Command Center</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm font-medium text-muted-foreground">Scalepods</span>
            <Avatar className="h-9 w-9">
              <AvatarImage src="/person-holding-keys.png" />
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            <Link href="/calls">
              <Button variant="ghost" size="icon" title="Call Assistance">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Stats Cards */}

        <StatsCards
          websiteCount={users.length}
          instagramCount={instagramUsers.length}
          whatsappCount={0}
          gmailCount={gmailUsers.length}
          callAssistanceCount={[...users, ...instagramUsers, ...gmailUsers].filter(u => u.status?.toLowerCase().includes("call")).length}
          scheduledMeetingsCount={[...users, ...instagramUsers, ...gmailUsers].filter(u => u.status?.toLowerCase().includes("meeting")).length}
        />

        <ChannelSelector selectedChannel={channelFilter} onSelectChannel={setChannelFilter} />

        {/* Main Content: Conversations - Horizontal Scrollable Tabs */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-400px)]">
          <div className="mb-4 flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-1">User Conversations</h2>
              <p className="text-muted-foreground text-sm">Monitor and manage all chatbot interactions</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoadingUsers} title="Refresh Data">
                <RefreshCw className={`h-4 w-4 ${isLoadingUsers ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                variant={activeChannel === "website" ? "default" : "outline"}
                onClick={() => setActiveChannel("website")}
                className="gap-2"
              >
                <Globe className="h-4 w-4" />
                Website
              </Button>
              <Button
                variant={activeChannel === "instagram" ? "default" : "outline"}
                onClick={() => setActiveChannel("instagram")}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Instagram
              </Button>
              <Button
                variant={activeChannel === "gmail" ? "default" : "outline"}
                onClick={() => setActiveChannel("gmail")}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Gmail
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

          </div>

          <div className="flex gap-6 flex-1 min-h-0">
            {/* User List */}
            {isLoadingUsers ? (
              <div className="flex items-center justify-center bg-card rounded-lg w-1/4 flex-shrink-0">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              </div>
            ) : (
              <div className="w-1/4 flex-shrink-0 min-h-0">
                <UserList
                  users={filteredUsers}
                  selectedUser={selectedUser}
                  onSelectUser={setSelectedUser}
                  highlightedUserId={highlightedUserId}
                />
              </div>
            )}

            <div className="flex-1 min-h-0">
              {selectedUser && (
                <ConversationPanel
                  key={selectedUser.id}
                  user={selectedUser}
                  onViewFullChat={() => setShowChatModal(true)}
                  channel={activeChannel}
                  isConnected={connectedUserIds.has(selectedUser.session_id || selectedUser.id)}
                  onToggleConnection={(connected) => {
                    setConnectedUserIds((prev) => {
                      const newSet = new Set(prev)
                      const id = selectedUser.session_id || selectedUser.id
                      if (connected) newSet.add(id)
                      else newSet.delete(id)
                      return newSet
                    })
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Call Assistance Required section at bottom of home page */}
        <CallAssistanceSection />
      </main>

      {/* Fixed reviews button on right side */}
      <button
        onClick={() => setShowReviews(!showReviews)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-8 rounded-l-lg shadow-lg transition-all duration-300 flex items-center justify-center z-40"
        title="View Reviews"
      >
        <span
          className="text-sm font-semibold tracking-wider writing-mode-vertical"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          REVIEWS
        </span>
      </button>

      {/* Reviews Panel */}
      <ReviewsPanel isOpen={showReviews} onClose={() => setShowReviews(false)} />

      {/* Chat Modal */}
      {showChatModal && selectedUser && <ChatModal user={selectedUser} onClose={() => setShowChatModal(false)} />}
    </div>
  )
}
