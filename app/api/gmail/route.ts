export async function GET() {
  try {
    const response = await fetch(
      "https://n8n.srv1010832.hstgr.cloud/webhook/fcb73336-5bee-42f9-9c4b-cceac6b11d4e",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      },
    )

    if (!response.ok) {
      return Response.json({ error: "Failed to fetch Gmail data" }, { status: response.status })
    }

    const data = await response.json()
    // Helper to normalize data structure
    let gmailUsersList: any[] = []

    if (Array.isArray(data)) {
      gmailUsersList = data.map((item: any) => ({
        id: item.session_id || item.email || `gmail-${Math.random()}`,
        session_id: item.session_id || item.email,
        name: item.name || item.email || "Gmail User",
        channel: "gmail",
        lastInteraction: item.last_interaction || item.received_at || item.created_at || new Date().toISOString(),
        summary: `Subject: ${item.subject || "No Subject"}\n\n${item.body || "No Body"}`,
        aiResponse: item.ai_response || null,
        messages: item.messages || item.chat || (item.body ? [{ role: 'user', message: item.body, time: item.received_at }] : []) || []
      }))
    } else if (data.email && data.body) {
      // Single Gmail user format
       gmailUsersList = [{
        id: data.session_id || data.email || `gmail-${Math.random()}`,
        session_id: data.session_id || data.email,
        name: data.name || data.email || "Gmail User",
        channel: "gmail",
        lastInteraction: data.last_interaction || data.received_at || data.created_at || new Date().toISOString(),
        summary: data.summary || data.subject || "Gmail conversation",
        messages: data.messages || data.chat || (data.body ? [{ role: 'user', message: data.body, time: data.received_at }] : []) || []
      }]
    } else if (data.emails && Array.isArray(data.emails)) {
       gmailUsersList = data.emails.map((item: any) => ({
        id: item.session_id || item.email || `gmail-${Math.random()}`,
        session_id: item.session_id || item.email,
        name: item.name || item.email || "Gmail User",
        channel: "gmail",
        lastInteraction: item.last_interaction || item.received_at || item.created_at || new Date().toISOString(),
        summary: `Subject: ${item.subject || "No Subject"}\n\n${item.body || "No Body"}`,
        aiResponse: item.ai_response || null,
        messages: item.messages || item.chat || [
          ...(item.body ? [{ role: 'user', message: item.body, time: item.received_at }] : []),
          ...(item.ai_response ? [{ role: 'assistant', message: item.ai_response, time: item.received_at }] : [])
        ]
      }))
    } else if (data.users && Array.isArray(data.users)) {
      gmailUsersList = data.users.map((item: any) => ({
        id: item.session_id || item.email || `gmail-${Math.random()}`,
        session_id: item.session_id || item.email,
        name: item.name || item.email || "Gmail User",
        channel: "gmail",
        lastInteraction: item.last_interaction || item.created_at || new Date().toISOString(),
        summary: item.summary || "Gmail conversation",
        messages: item.messages || item.chat || []
      }))
    }

    return Response.json(gmailUsersList)
  } catch (error) {
    console.error("[v0] Gmail API error:", error)
    return Response.json({ error: "Failed to fetch Gmail data" }, { status: 500 })
  }
}
