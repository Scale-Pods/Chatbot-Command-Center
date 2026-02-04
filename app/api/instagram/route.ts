export async function GET() {
  try {
    const response = await fetch(
      "https://n8n.srv1010832.hstgr.cloud/webhook/instagramdata",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      },
    )

    if (!response.ok) {
      return Response.json({ error: "Failed to fetch Instagram data" }, { status: response.status })
    }

    const data = await response.json()


    let transformedUsers: any[] = []

    if (Array.isArray(data)) {
      transformedUsers = data.map((item: any) => ({
        id: item.insta_id || item.session_id || `insta-${Math.random()}`,
        session_id: item.insta_id || item.session_id,
        name: item.name || `Instagram User ${item.insta_id || ""}`,
        channel: "instagram",
        lastInteraction: item.conversation?.[item.conversation.length - 1]?.time || item.created_at || new Date().toISOString(),
        summary: "Instagram conversation",
        messages: item.conversation || []
      }))
    } else if (data.insta_id && data.conversation) {
      // Single Instagram user format - convert to User object
      transformedUsers = [{
        id: data.insta_id,
        session_id: data.insta_id,
        name: data.name || `Instagram ${data.insta_id}`,
        channel: "instagram",
        lastInteraction: data.conversation?.[data.conversation.length - 1]?.time || "No interaction",
        summary: "Instagram conversation",
        messages: data.conversation
      }]
    } else if (Array.isArray(data.users)) {
       transformedUsers = data.users.map((item: any) => ({
        id: item.insta_id || item.session_id || `insta-${Math.random()}`,
        session_id: item.insta_id || item.session_id,
        name: item.name || `Instagram User ${item.insta_id || ""}`,
        channel: "instagram",
        lastInteraction: item.conversation?.[item.conversation.length - 1]?.time || item.created_at || new Date().toISOString(),
        summary: "Instagram conversation",
        messages: item.conversation || []
      }))
    }

    return Response.json(transformedUsers)
  } catch (error) {
    console.error("[v0] Instagram API error:", error)
    return Response.json({ error: "Failed to fetch Instagram data" }, { status: 500 })
  }
}
