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

export async function fetchUsersFromWebhook(channel: string = "website"): Promise<User[]> {
  try {
    const WEBHOOK_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/493e8a5a-417b-4bef-81ba-49c83069c86d"
    
    // In a real app, you might select webhook based on channel
    // For now, we use the known website webhook as default source
    const response = await fetch(WEBHOOK_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    })

    if (!response.ok) {
      console.error(`Status: ${response.status}`)
      return []
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
    console.error("Error fetching users:", error)
    return []
  }
}
