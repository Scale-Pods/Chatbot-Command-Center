"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Mail, Globe, Send, LogOut, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getChannelBadge } from "@/utils/channel-badge"
import { getSummaryText } from "@/utils/summary-text"

type Message = {
  role: "user" | "assistant" | "agent" | "system" | "human"
  message: string
  time: string
  created_at?: string
  index?: number
  isOptimistic?: boolean
}

type User = {
  id: string // UI numeric ID for list rendering
  session_id: string // UUID for conversation identifier - use for all backend calls
  name: string
  email?: string
  phone?: string
  channel: string
  lastInteraction: string
  status: string
  avatar: string
  summary: string
  aiResponse?: string
  messages: Message[]
}

interface ConversationPanelProps {
  user: User
  onViewFullChat?: () => void
  channel?: "website" | "instagram" | "gmail"
  isConnected: boolean
  onToggleConnection: (connected: boolean) => void
}

const WEBHOOKS = {
  website: "https://n8n.srv1010832.hstgr.cloud/webhook/493e8a5a-417b-4bef-81ba-49c83069c86d",
  instagram: "https://n8n.srv1010832.hstgr.cloud/webhook/instagramdata",
  gmail: "https://n8n.srv1010832.hstgr.cloud/webhook/fcb73336-5bee-42f9-9c4b-cceac6b11d4e",
}
const SEND_MESSAGE_WEBHOOK = "https://n8n.srv1010832.hstgr.cloud/webhook/1b02d7a3-b3d5-4a48-8e86-a518c9e43caf"
const SUMMARY_WEBHOOK = "https://n8n.srv1010832.hstgr.cloud/webhook/2e02bc28-7267-494f-89eb-c4f212d693ac"
const POLL_INTERVAL = 30000 // 30 seconds

export function ConversationPanel({ user, channel = "website", isConnected, onToggleConnection }: ConversationPanelProps) {
  const CHAT_POLL_WEBHOOK = WEBHOOKS[channel]
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  // isConnected is now a prop
  const [chatMode, setChatMode] = useState<"AI" | "HUMAN">("AI")
  const [summaryData, setSummaryData] = useState<string>(user.summary || "")
  const { toast } = useToast()

  const lastSeenTimeRef = useRef<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastRenderedIndexRef = useRef<number>(-1)
  const sentMessagesRef = useRef<{ text: string; time: number; session_id: string }[]>([])

  // Load sent messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sent_messages")
      if (stored) {
        sentMessagesRef.current = JSON.parse(stored)
      }
    } catch (e) {
      console.error("Failed to load sent messages", e)
    }
  }, [])

  // Format timestamp in en-IN locale
  const formatTime = (isoTimestamp: string): string => {
    try {
      const date = new Date(isoTimestamp)
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    }
  }

  // Auto-scroll to bottom (within messages container only, not full page)
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant", block: "nearest" })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch summary data from dedicated webhook
  const fetchSummaryFromWebhook = async () => {
    // Skip summary fetch for Instagram - it uses a different data structure
    if (channel === "instagram") {
      return
    }

    try {
      const queryParams = new URLSearchParams({
        session_id: user.session_id,
      })

      const url = `${SUMMARY_WEBHOOK}?${queryParams.toString()}`
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        return
      }

      const text = await response.text()
      if (!text) {
        return
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        return
      }

      // Handle different response formats - find matching session_id
      let foundSummary = ""

      if (Array.isArray(data)) {
        const session = data.find((item: any) => item.session_id === user.session_id)
        if (session && (session.ConversationSummary || session.summary)) {
          foundSummary = session.ConversationSummary || session.summary
        }
      } else if (data.sessions && Array.isArray(data.sessions)) {
        const session = data.sessions.find((item: any) => item.session_id === user.session_id)
        if (session && (session.ConversationSummary || session.summary)) {
          foundSummary = session.ConversationSummary || session.summary
        }
      } else if (data.users && Array.isArray(data.users)) {
        const session = data.users.find((item: any) => item.session_id === user.session_id)
        if (session && (session.ConversationSummary || session.summary)) {
          foundSummary = session.ConversationSummary || session.summary
        }
      } else if (data.ConversationSummary || data.summary) {
        foundSummary = data.ConversationSummary || data.summary
      }

      if (foundSummary) {
        setSummaryData(foundSummary)
      }
    } catch (error) {
      console.log("[v0] Summary fetch error:", error)
    }
  }

  // Fetch chat messages from webhook (using GET with query params)
  const fetchChatMessages = async (isInitial: boolean = false) => {
    try {
      const queryParams = new URLSearchParams()

      // For Instagram, use insta_id; for others use session_id
      if (channel === "instagram") {
        queryParams.append("insta_id", user.session_id)
      } else {
        queryParams.append("session_id", user.session_id)
      }

      // Include after cursor for incremental updates
      if (!isInitial && lastSeenTimeRef.current) {
        queryParams.append("after", lastSeenTimeRef.current)
      }

      const url = `${CHAT_POLL_WEBHOOK}?${queryParams.toString()}`
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        console.log("[v0] Fetch failed with status:", response.status)
        return
      }

      const text = await response.text()
      if (!text) {
        console.log("[v0] Empty response")
        return
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.log("[v0] JSON parse error:", e)
        return
      }

      console.log("[v0] Parsed data:", data)

      // Extract summary from the chat response if available (Website channel feature)
      let foundSummaryInChat = ""
      if (Array.isArray(data)) {
        // Check if any item in the array has ConversationSummary
        const summaryItem = data.find((item: any) => item.ConversationSummary || item.summary)
        if (summaryItem) {
          foundSummaryInChat = summaryItem.ConversationSummary || summaryItem.summary
        }
      } else if (data.ConversationSummary || data.summary) {
        foundSummaryInChat = data.ConversationSummary || data.summary
      } else if (data.users && Array.isArray(data.users)) {
         // Check user list for summary
         const userSession = data.users.find((u: any) => u.session_id === user.session_id)
         if (userSession && (userSession.ConversationSummary || userSession.summary)) {
            foundSummaryInChat = userSession.ConversationSummary || userSession.summary
         }
      }

      if (foundSummaryInChat) {
        setSummaryData(foundSummaryInChat)
      }

      // Handle different response formats
      let messagesArray: any[] = []

      if (Array.isArray(data)) {
        messagesArray = data
      } else if (data.messages && Array.isArray(data.messages)) {
        messagesArray = data.messages
      } else if (data.chat && Array.isArray(data.chat)) {
        messagesArray = data.chat
      } else if (data.conversation && Array.isArray(data.conversation)) {
        // Instagram format
        messagesArray = data.conversation
      } else if (data.users && Array.isArray(data.users)) {
        // Find the matching user session using session_id (UUID) or insta_id
        const userSession = data.users.find((u: any) => 
          (u.session_id === user.session_id) || (u.insta_id === user.session_id)
        )
        if (userSession) {
          if (userSession.chat) {
            messagesArray = userSession.chat
          } else if (userSession.conversation) {
             messagesArray = userSession.conversation
          }
        }
      }

      console.log("[v0] Messages array:", messagesArray.length, "messages")

      if (messagesArray.length === 0) {
        console.log("[v0] No messages found")
        return
      }

      // Convert to internal format - use 'message' and 'time' fields from webhook
      const newMessages: Message[] = messagesArray
        .filter((msg: any) => msg.message)
        .map((msg: any) => {
          const timestamp = msg.time || msg.created_at || new Date().toISOString()
          let role = mapRole(msg.role)

          // Workaround for N8N backend issue: Agent messages returned as "user"
          // Check if this message matches a locally sent message from `sentMessagesRef`
          if (role === "user") {
            const msgTime = new Date(timestamp).getTime()
            const matchIndex = sentMessagesRef.current.findIndex(
              (sent) => 
                sent.text.trim() === msg.message.trim() && // Relaxed match with trim
                Math.abs(msgTime - sent.time) < 86400000 && // 24 hour window
                (sent.session_id === user.session_id || sent.session_id === user.id)
            )
            
            if (matchIndex !== -1) {
              console.log("[v0] Matched user message to local agent send:", msg.message)
              role = "agent"
            } else {
               // Debug log for failed match
               console.log("[v0] Failed to match user message:", msg.message, "Local sends:", sentMessagesRef.current.length)
            }
          }

          return {
            role,
            message: msg.message,
            time: formatTime(timestamp),
            created_at: timestamp,
          }
        })
        .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())

      // Deduplicate messages from backend
      // Aggressive dedup: Remove consecutive matches of same content + role
      const dedupedMessages: Message[] = [];
      newMessages.forEach((msg) => {
        if (dedupedMessages.length === 0) {
          dedupedMessages.push(msg);
        } else {
          const lastMsg = dedupedMessages[dedupedMessages.length - 1];
          // Check if current message is duplicate of the previous one
          // We check content, role, and strictly ensuring we don't show same thing twice in a row
          const isDuplicate = 
            msg.message.trim() === lastMsg.message.trim() && 
            msg.role === lastMsg.role;
            
          if (!isDuplicate) {
            dedupedMessages.push(msg);
          }
        }
      });
      
      console.log("[v0] Processed messages (deduped):", dedupedMessages.length)

      if (dedupedMessages.length === 0) {
        console.log("[v0] No valid messages after processing")
        return
      }

      // Update last seen timestamp to only fetch new messages
      const latestTimestamp = dedupedMessages[dedupedMessages.length - 1].created_at
      if (latestTimestamp) {
        lastSeenTimeRef.current = latestTimestamp
      }

      setMessages((prev) => {
        // Create a map of existing messages by content+timestamp (approx) to dedup
        // Use trimmed content for dedup verification
        const incomingContent = new Set(dedupedMessages.map((m) => m.message.trim()))
        
        // Keep optimistic messages that are NOT in the incoming list yet
        const pendingOptimistic = prev.filter(
          (m) => m.isOptimistic && !incomingContent.has(m.message.trim())
        )
        
        // Return mostly the server state + pending optimistic at the end
        // This strategy assumes server state is truth, but we overlay pending local sends
        return [...dedupedMessages, ...pendingOptimistic]
      })
    } catch (error) {
      console.log("[v0] Fetch error:", error)
    }
  }

  // Map webhook role to internal role
  const mapRole = (role: string): "user" | "assistant" | "agent" | "human" => {
    switch (role?.toUpperCase()) {
      case "USER":
        return "user"
      case "HUMAN":
        return "human" // New internal role for HUMAN to align right but distinct style if needed
      case "BOT":
      case "ASSISTANT":
      case "AGENT":
        return "agent" // Unified role for right-side alignment
      default:
        return "agent"
    }
  }

  // Handle connect to chat
  const handleConnectChat = async () => {
    onToggleConnection(true)
    
    const joinMsg = "An Agent Just Joined"

    // Add to sent messages for alignment
    const newSentMsg = {
      text: joinMsg,
      time: Date.now(),
      session_id: user.session_id,
    }
    sentMessagesRef.current.push(newSentMsg)
    localStorage.setItem("sent_messages", JSON.stringify(sentMessagesRef.current))

    // Send join message
    try {
      const response = await fetch(SEND_MESSAGE_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: user.session_id,
          message: joinMsg,
          role: "AGENT",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      // Refresh to show message
      fetchChatMessages(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join message.",
        variant: "destructive",
      })
    }
  }

  // Handle disconnect from chat
  const handleDisconnectChat = async () => {
    const disconnectMsg = "Disconnect"

    // Add to sent messages for alignment
    const newSentMsg = {
      text: disconnectMsg,
      time: Date.now(),
      session_id: user.session_id,
    }
    sentMessagesRef.current.push(newSentMsg)
    localStorage.setItem("sent_messages", JSON.stringify(sentMessagesRef.current))

    try {
      const response = await fetch(SEND_MESSAGE_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: user.session_id,
          message: disconnectMsg,
          role: "AGENT",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      onToggleConnection(false)
      toast({
        title: "Disconnected",
        description: "You have been disconnected from the chat.",
        variant: "default",
      })
      
      // Refresh to show message
      fetchChatMessages(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect from chat.",
        variant: "destructive",
      })
    }
  }

  // Handle send message for Instagram
  const handleSendInstagramMessage = async () => {
    if (!inputMessage.trim()) return

    setIsSending(true)
    
    // Optimistic UI
    const optimisticMsg: Message = {
      role: "agent",
      message: inputMessage,
      time: formatTime(new Date().toISOString()),
      created_at: new Date().toISOString(),
      isOptimistic: true
    }
    setMessages(prev => [...prev, optimisticMsg])
    setInputMessage("")

    try {
      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/4087eb9a-0452-4058-a70b-88c8f03cd9b4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insta_id: user.session_id,
          message: optimisticMsg.message,
          role: "AGENT",
        }),
      })

      // Add to sent messages ref for local correlation (fix for N8N returning "user" role)
      const newSentMsg = {
        text: optimisticMsg.message,
        time: Date.now(),
        session_id: user.session_id,
      }
      sentMessagesRef.current.push(newSentMsg)
      localStorage.setItem("sent_messages", JSON.stringify(sentMessagesRef.current))

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      toast({
        title: "Message Sent",
        description: "Your Instagram message has been sent.",
      })

      // Soft fetch to update state without clearing optimistic
      await fetchChatMessages(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send Instagram message.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Route to correct send handler based on channel
    if (channel === "instagram") {
      await handleSendInstagramMessage()
      return
    }

    const optimisticMsg: Message = {
      role: "agent",
      message: inputMessage,
      time: formatTime(new Date().toISOString()),
      created_at: new Date().toISOString(),
      isOptimistic: true
    }
    setMessages(prev => [...prev, optimisticMsg])
    setInputMessage("")

    // Original website/gmail send logic
    setIsSending(true)
    try {
      const response = await fetch(SEND_MESSAGE_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: user.session_id,
          message: optimisticMsg.message,
          role: "AGENT",
        }),
      })

      // Add to sent messages ref for local correlation and persistence
      const newSentMsg = {
        text: optimisticMsg.message,
        time: Date.now(),
        session_id: user.session_id || user.id,
      }
      sentMessagesRef.current.push(newSentMsg)
      localStorage.setItem("sent_messages", JSON.stringify(sentMessagesRef.current))

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      toast({
        title: "Message Sent",
        description: "Your message has been sent.",
      })

      // Soft fetch
      await fetchChatMessages(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Setup polling on user change
  useEffect(() => {
    // Reset messages only when session changes
    setMessages([])
    lastSeenTimeRef.current = null

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Initial fetch for chat and summary
    fetchChatMessages(true)
    fetchSummaryFromWebhook()

    // Start polling every 10 seconds for near-realtime feel
    pollingIntervalRef.current = setInterval(() => {
      fetchChatMessages(false)
      fetchSummaryFromWebhook()
    }, POLL_INTERVAL)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [user.session_id])

  return (
    <Card className="h-full flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="p-6 border-b border-border flex-shrink-0 bg-indigo-50/40 dark:bg-transparent">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground text-lg">{user.name || "User"}</h3>
                {user.email && (
                  <Badge variant="outline" className="font-normal text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </Badge>
                )}
                {user.phone && (
                  <Badge variant="outline" className="font-normal text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {user.phone}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1">Session: {user.session_id}</p>
              <div className="flex items-center gap-2 mt-1">{getChannelBadge(user.channel)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 pb-3 flex-shrink-0 border-b border-border/50">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Conversation Summary</h4>
            <div className="bg-indigo-50/30 dark:bg-muted/30 rounded-lg p-4 border border-indigo-100/50 dark:border-border transition-colors">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {channel === "gmail" ? user.summary : getSummaryText(summaryData)}
              </p>
            </div>
          </div>
          
          {channel === "gmail" && user.aiResponse && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">AI Response</h4>
              <div className="bg-indigo-100/30 dark:bg-muted/30 rounded-lg p-4 border border-indigo-200/50 dark:border-border transition-colors">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{user.aiResponse}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages & Input - Hidden for Gmail */ }
      {channel !== "gmail" && (
      <div className="flex-1 flex flex-col p-6 min-h-0 max-h-[500px]">
        <h4 className="text-sm font-semibold text-foreground mb-2 flex-shrink-0">Chat</h4>
        <div className="flex-1 overflow-y-auto bg-muted/30 dark:bg-muted/20 rounded-lg p-4 border border-border transition-colors space-y-3 flex flex-col">
          {messages.length > 0 ? (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "bg-white dark:bg-muted text-foreground border border-gray-100 dark:border-border shadow-sm"
                        : "bg-indigo-600 dark:bg-primary text-white dark:text-primary-foreground shadow-sm"
                    }`}
                  >
                    <p>{msg.message}</p>
                    {msg.time && <p className="text-xs opacity-70 mt-1">{msg.time}</p>}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Start a conversation below.</p>
          )}
        </div>

        {/* Input Section */}
        <div className="flex-shrink-0 mt-4 space-y-2">
          {!isConnected ? (
            <Button onClick={handleConnectChat} className="w-full" size="lg">
              Connect to Chat
            </Button>
          ) : (
            <>
              <Textarea
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="h-16 text-sm resize-none"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSendMessage()
                  }
                }}
              />
              <div className="flex gap-2">
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isSending} className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-primary dark:hover:bg-primary/90 text-white" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? "Sending..." : "Send"}
                </Button>
                <Button onClick={handleDisconnectChat} variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      )}
    </Card>
  )
}
