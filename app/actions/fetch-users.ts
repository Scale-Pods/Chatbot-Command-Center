"use server"

export type User = {
  id: string
  session_id: string
  name: string
  email?: string
  phone?: string
  channel: string
  lastInteraction: string
  status: string
  avatar: string
  summary: string
  aiResponse?: string
  messages: any[]
}

// Mock data for development/fallback when webhook is unavailable
const getMockUsers = (channel: string): User[] => [
  {
    id: "user-1",
    session_id: "session-001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 555-0101",
    channel: channel,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: "active",
    avatar: "",
    summary: "Customer inquiring about product pricing and availability.",
    messages: [
      { role: "user", content: "Hi, I'm interested in your products" },
      { role: "assistant", content: "Hello! I'd be happy to help you with information about our products." }
    ]
  },
  {
    id: "user-2",
    session_id: "session-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 555-0102",
    channel: channel,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: "waiting",
    avatar: "",
    summary: "Support request regarding order delivery status.",
    messages: [
      { role: "user", content: "Where is my order #12345?" },
      { role: "assistant", content: "Let me check the status of your order for you." }
    ]
  },
  {
    id: "user-3",
    session_id: "session-003",
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "+1 555-0103",
    channel: channel,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "resolved",
    avatar: "",
    summary: "Technical question about API integration.",
    messages: [
      { role: "user", content: "How do I integrate with your API?" },
      { role: "assistant", content: "Our API documentation is available at docs.example.com" }
    ]
  }
]

export async function fetchUsersFromWebhook(channel: string = "website"): Promise<User[]> {
  const WEBHOOK_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/493e8a5a-417b-4bef-81ba-49c83069c86d"
  
  try {
    // Create an AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch(WEBHOOK_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Webhook returned status: ${response.status}`)
      return getMockUsers(channel)
    }

    const data = await response.json()
    let usersList: any[] = []

    if (Array.isArray(data)) {
      usersList = data
    } else if (data.users && Array.isArray(data.users)) {
      usersList = data.users
    } else if (data.sessions && Array.isArray(data.sessions)) {
      usersList = data.sessions
    } else if (data.data && Array.isArray(data.data)) {
      usersList = data.data
    }

    // If no users found from webhook, return mock data
    if (usersList.length === 0) {
      return getMockUsers(channel)
    }

    // Map to User type
    return usersList.map((u: any, index: number) => ({
      id: u.id || u.session_id || `user-${index}`,
      session_id: u.session_id || u.id,
      name: u.name || u.Name || "Anonymous User",
      email: u.email || u.Email || "",
      phone: u.phone || u.Phone || "",
      channel: u.channel || channel,
      lastInteraction: u.lastInteraction || u.LastActiveTime || u.created_at || new Date().toISOString(),
      status: u.status || u.Status || "active",
      avatar: u.avatar || "",
      summary: u.summary || u.ConversationSummary || "",
      messages: u.chat || u.messages || []
    })).filter(u => u.channel === channel)

  } catch (error) {
    // Return mock data on any error (timeout, network issues, etc.)
    console.warn("Webhook unavailable, using mock data:", error instanceof Error ? error.message : "Unknown error")
    return getMockUsers(channel)
  }
}
