"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Check } from "lucide-react"

interface ReviewReplyCardProps {
  rating: number
  comment: string
  reviewId: string
  suggestedReplies: string[]
  onSendReply: (replyText: string) => void
  isReplied?: boolean
}

export function ReviewReplyCard({
  rating,
  comment,
  reviewId,
  suggestedReplies,
  onSendReply,
  isReplied = false,
}: ReviewReplyCardProps) {
  const [selectedReply, setSelectedReply] = useState<string | null>(null)
  const [customReply, setCustomReply] = useState("")

  const handleSendReply = () => {
    const reply = selectedReply || customReply
    if (reply) {
      onSendReply(reply)
      setSelectedReply(null)
      setCustomReply("")
    }
  }

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  )

  return (
    <Card className="p-4 space-y-4">
      {/* Star Rating */}
      <div>
        <StarRating rating={rating} />
      </div>

      {/* Comment Text */}
      <div>
        <p className="text-sm text-foreground">{comment || "No written review provided."}</p>
      </div>

      {/* Review ID */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">ID: {reviewId}</span>
        {isReplied && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3 w-3" />
            Replied
          </div>
        )}
      </div>

      {/* Suggested Replies */}
      {!isReplied && (
        <>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Suggested Replies</p>
            <div className="space-y-2">
              {suggestedReplies.slice(0, 3).map((reply, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedReply(selectedReply === reply ? null : reply)
                    setCustomReply("")
                  }}
                  className={`w-full p-3 text-left text-sm rounded-lg border transition-all ${
                    selectedReply === reply ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground line-clamp-2">{reply}</p>
                    {selectedReply === reply && <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reply */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Write Your Own Reply</p>
            <textarea
              value={customReply}
              onChange={(e) => {
                setCustomReply(e.target.value)
                setSelectedReply(null)
              }}
              placeholder="Write a custom response to this review…"
              className="w-full h-20 p-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              aria-label="Custom reply textarea"
            />
          </div>

          {/* Send Button */}
          <Button onClick={handleSendReply} disabled={!selectedReply && !customReply} className="w-full">
            Send Reply
          </Button>
        </>
      )}
    </Card>
  )
}
