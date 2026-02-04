"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HumanSupportChatProps {
  sessionId: string
}

export function HumanSupportChat({ sessionId }: HumanSupportChatProps) {
  const [needsHuman, setNeedsHuman] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{ text: string; timestamp: string }>>([])
  const [isChatOpen, setIsChatOpen] = useState(false) // added state to toggle chat visibility
  const { toast } = useToast()

  // Check if user needs human support
  useEffect(() => {
    async function checkHumanSupport() {
      try {
        const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/493e8a5a-417b-4bef-81ba-49c83069c86d")
        const text = await response.text()
        if (!text) {
          console.log("[v0] Empty response from webhook")
          setNeedsHuman(false)
          return
        }

        let data
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error("[v0] HumanSupportChat: Failed to parse JSON:", parseError)
          setNeedsHuman(false)
          return
        }

        console.log("[v0] HumanSupportChat: Fetched data from webhook", data)

        const users = data.users || []
        console.log("[v0] HumanSupportChat: Looking for SessionID:", sessionId, "in", users.length, "users")

        // Find user with matching SessionID and check "Need Human" column
        const user = users.find((u: any) => u.SessionID === sessionId || u.id === sessionId)

        if (user) {
          console.log("[v0] HumanSupportChat: Found user:", user)
          console.log("[v0] HumanSupportChat: Need Human value:", user["Need Human"])

          if (user["Need Human"]?.toLowerCase() === "yes") {
            console.log("[v0] HumanSupportChat: User needs human support - showing chat")
            setNeedsHuman(true)
          } else {
            console.log("[v0] HumanSupportChat: User does not need human support")
            setNeedsHuman(false)
          }
        } else {
          console.log("[v0] HumanSupportChat: User not found with SessionID:", sessionId)
          setNeedsHuman(false)
        }
      } catch (error) {
        console.error("[v0] Error checking human support:", error)
        setNeedsHuman(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkHumanSupport()
  }, [sessionId])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsSending(true)
    const timestamp = new Date().toLocaleString()

    try {
      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/1b02d7a3-b3d5-4a48-8e86-a518c9e43caf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: message.trim(),
          timestamp,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Add message to local chat history
      setChatHistory((prev) => [...prev, { text: message.trim(), timestamp }])
      setMessage("")

      toast({
        title: "Message sent",
        description: "Your message has been sent to the support team",
      })
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isChecking) {
    return null
  }

  if (!needsHuman) {
    return null
  }

  return (
    <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Human Support Chat</h4>
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          size="sm"
          variant={isChatOpen ? "default" : "outline"}
          className="ml-auto"
        >
          {isChatOpen ? "Close" : "Chat"}
        </Button>
      </div>

      {isChatOpen && (
        <>
          {/* Chat History */}
          <div className="mb-3 max-h-32 overflow-y-auto bg-background rounded p-2 space-y-2 text-sm">
            {chatHistory.length === 0 ? (
              <p className="text-muted-foreground text-xs">No messages yet</p>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} className="text-sm text-foreground">
                  {msg.text}
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Type your message for human support..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-20 text-sm"
              disabled={isSending}
            />
            <Button onClick={handleSendMessage} disabled={!message.trim() || isSending} size="sm" className="w-full">
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
