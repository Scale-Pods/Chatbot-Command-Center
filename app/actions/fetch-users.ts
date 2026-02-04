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
  console.log("[v0] fetchUsersFromWebhook called with channel:", channel)
  
  try {
    // Create an AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    console.log("[v0] Fetching from webhook:", WEBHOOK_URL)
    const response = await fetch(WEBHOOK_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    console.log("[v0] Webhook response status:", response.status)

    if (!response.ok) {
      console.error(`[v0] Webhook returned error status: ${response.status}`)
      const mockData = getMockUsers(channel)
      console.log("[v0] Returning mock data due to error status. Mock users count:", mockData.length)
      return mockData
    }

    const data = await response.json()
    console.log("[v0] Raw webhook response data:", JSON.stringify(data, null, 2))
    
    let usersList: any[] = []

    if (Array.isArray(data)) {
      usersList = data
      console.log("[v0] Response is an array with", usersList.length, "items")
    } else if (data.users && Array.isArray(data.users)) {
      usersList = data.users
      console.log("[v0] Found data.users array with", usersList.length, "items")
    } else if (data.sessions && Array.isArray(data.sessions)) {
      usersList = data.sessions
      console.log("[v0] Found data.sessions array with", usersList.length, "items")
    } else if (data.data && Array.isArray(data.data)) {
      usersList = data.data
      console.log("[v0] Found data.data array with", usersList.length, "items")
    } else {
      console.log("[v0] Could not find any array in response. Available keys:", Object.keys(data))
    }

    // If no users found from webhook, return mock data
    if (usersList.length === 0) {
      const mockData = getMockUsers(channel)
      console.log("[v0] No users in webhook response, returning mock data. Mock users count:", mockData.length)
      return mockData
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
    
    console.log("[v0] Mapped users count:", mappedUsers.length)
    console.log("[v0] Final users to return:", JSON.stringify(mappedUsers, null, 2))
    return mappedUsers

  } catch (error) {
    // Return mock data on any error (timeout, network issues, etc.)
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.warn("[v0] Error fetching from webhook:", errorMsg)
    const mockData = getMockUsers(channel)
    console.log("[v0] Returning mock data due to error. Mock users count:", mockData.length)
    console.log("[v0] Mock users:", JSON.stringify(mockData, null, 2))
    return mockData
  }
}
