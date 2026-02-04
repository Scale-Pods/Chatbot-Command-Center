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

// Mock data for development/testing when webhook is unavailable
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
      { role: "assistant", content: "Hello! I'd be happy to help you." }
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
    summary: "Support request regarding order status.",
    messages: [
      { role: "user", content: "Where is my order?" },
      { role: "assistant", content: "Let me check that for you." }
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
    summary: "Technical question resolved successfully.",
    messages: [
      { role: "user", content: "How do I integrate?" },
      { role: "assistant", content: "Check our documentation at docs.example.com" }
    ]
  }
]

export async function fetchUsersFromWebhook(channel: string = "website"): Promise<User[]> {
  try {
    const WEBHOOK_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/493e8a5a-417b-4bef-81ba-49c83069c86d"
    
    // Create abort controller with 5 second timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    console.log("[v0] Fetching from webhook with 5s timeout")
    
    // In a real app, you might select webhook based on channel
    // For now, we use the known website webhook as default source
    const response = await fetch(WEBHOOK_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[v0] Webhook status error: ${response.status}`)
      const mockData = getMockUsers(channel)
      console.log("[v0] Returning mock data due to error status")
      return mockData
    }

    const data = await response.json()
    console.log("[v0] Webhook response received, data keys:", Object.keys(data))
    
    let usersList: any[] = []

    if (Array.isArray(data)) {
      usersList = data
      console.log("[v0] Found array data with", usersList.length, "items")
    } else if (data.users && Array.isArray(data.users)) {
      usersList = data.users
      console.log("[v0] Found data.users array with", usersList.length, "items")
    } else if (data.sessions && Array.isArray(data.sessions)) {
      usersList = data.sessions
      console.log("[v0] Found data.sessions array with", usersList.length, "items")
    } else if (data.data && Array.isArray(data.data)) {
      usersList = data.data
      console.log("[v0] Found data.data array with", usersList.length, "items")
    }

    // If no users found, return mock data
    if (usersList.length === 0) {
      console.log("[v0] No users found in response, returning mock data")
      return getMockUsers(channel)
    }

    // Map to User type
    const mappedUsers = usersList.map((u: any, index: number) => ({
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

    console.log("[v0] Mapped", mappedUsers.length, "users for channel:", channel)
    return mappedUsers

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error fetching users:", errorMsg)
    console.log("[v0] Returning mock data due to error")
    return getMockUsers(channel)
  }
}
