"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Star, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Review {
  reviewId: string
  rowNumber?: number
  rating: number
  comment: string
  reviewerName?: string
  replied?: boolean
  userName?: string
  userId?: string
  updateType?: string
  suggestedReplies?: string[]
  [key: string]: unknown
}

interface ReviewsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ReviewsPanel({ isOpen, onClose }: ReviewsPanelProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)
  const [selectedReply, setSelectedReply] = useState<string | null>(null)
  const [customReply, setCustomReply] = useState("")
  const [repliedReviews, setRepliedReviews] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && reviews.length === 0) {
      loadReviews()
    }
  }, [isOpen])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] ReviewsPanel: Fetching reviews from webhook")
      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/7517f7ae-6509-4731-8e31-33849c2adc4a")

      console.log("[v0] ReviewsPanel: Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      console.log("[v0] ReviewsPanel: Response data:", text)

      if (!text) {
        console.log("[v0] ReviewsPanel: Empty response, setting empty reviews")
        setReviews([])
        return
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("[v0] ReviewsPanel: Failed to parse JSON:", parseError)
        setReviews([])
        toast({
          title: "Error",
          description: "Invalid response format from server",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] ReviewsPanel: Parsed data:", data)

      let reviewsArray: Review[] = []
      if (Array.isArray(data)) {
        reviewsArray = data
      } else if (data.review) {
        const review = data.review
        reviewsArray = [
          {
            ...review,
            reviewerName: review.reviewerName || "Anonymous",
            userName: data.userName || review.userName || "Unknown",
            userId: data.SessionID || data.userId || review.userId || "N/A",
            updateType: data.updateType || "Review Response",
            suggestedReplies: data.suggestedReplies || review.suggestedReplies || [],
          },
        ]
      } else if (data.reviews) {
        reviewsArray = data.reviews
      }

      console.log("[v0] ReviewsPanel: Found reviews:", reviewsArray.length)
      setReviews(reviewsArray)
    } catch (error) {
      console.error("[v0] ReviewsPanel: Error loading reviews:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load reviews",
        variant: "destructive",
      })
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReplySubmit = async () => {
    if (!selectedReviewId) return

    const reply = selectedReply || customReply
    if (!reply) {
      toast({
        title: "Error",
        description: "Please select or write a reply",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/7517f7ae-6509-4731-8e31-33849c2adc4a", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: selectedReviewId,
          reply: reply,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit reply")

      setRepliedReviews((prev) => new Set([...prev, selectedReviewId]))
      setSelectedReply(null)
      setCustomReply("")
      setSelectedReviewId(null)

      toast({
        title: "Success",
        description: "Reply sent successfully",
      })
    } catch (error) {
      console.error("[v0] Error submitting reply:", error)
      toast({
        title: "Error",
        description: "Failed to submit reply",
        variant: "destructive",
      })
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
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300" onClick={onClose} />}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-1/2 bg-background border-l border-border shadow-lg z-40 transition-transform duration-300 flex flex-col overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Google Reviews</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No reviews found</p>
            </div>
          ) : (
            reviews.map((review) => (
              <Card
                key={review.reviewId}
                className={`p-4 cursor-pointer transition-all ${
                  selectedReviewId === review.reviewId ? "border-primary bg-primary/5" : "hover:border-primary/50"
                } ${repliedReviews.has(review.reviewId) ? "opacity-60" : ""}`}
                onClick={() => {
                  if (!repliedReviews.has(review.reviewId)) {
                    setSelectedReviewId(review.reviewId)
                  }
                }}
              >
                {/* Reviewer Name */}
                <h3 className="text-lg font-medium text-foreground mb-2">{review.reviewerName || "Anonymous"}</h3>

                {/* Star Rating */}
                <div className="mb-3">
                  <StarRating rating={review.rating} />
                </div>

                {/* Review Comment */}
                <p className="text-sm text-foreground mb-4">{review.comment || "No written review provided."}</p>

                {/* User Information */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pt-3 border-t border-border">
                  <span>Review ID: {review.reviewId}</span>
                  {review.updateType && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">{review.updateType}</span>
                  )}
                </div>

                {/* Review Status */}
                {repliedReviews.has(review.reviewId) && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3 w-3" />
                    Replied
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Reply Section */}
        {selectedReviewId && !repliedReviews.has(selectedReviewId) && (
          <div className="border-t border-border p-6 space-y-4 flex-shrink-0 bg-card">
            {reviews.find((r) => r.reviewId === selectedReviewId)?.suggestedReplies && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Suggested Replies</p>
                <div className="space-y-2">
                  {reviews
                    .find((r) => r.reviewId === selectedReviewId)
                    ?.suggestedReplies?.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedReply(selectedReply === reply ? null : reply)
                          setCustomReply("")
                        }}
                        className={`w-full p-3 text-left text-sm rounded-lg border transition-all ${
                          selectedReply === reply
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
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
            )}

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
                className="w-full h-24 p-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Send Button */}
            <Button onClick={handleReplySubmit} disabled={!selectedReply && !customReply} className="w-full">
              Send Reply
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
