"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface WhatsAppSetupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WhatsAppSetupForm({ open, onOpenChange }: WhatsAppSetupFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    whatsapp_access_token: "",
    whatsapp_business_account_id: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isFormValid = () => {
    return formData.whatsapp_access_token && formData.whatsapp_business_account_id
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        whatsapp_access_token: formData.whatsapp_access_token,
        whatsapp_business_account_id: formData.whatsapp_business_account_id,
        submitted_at: new Date().toISOString(),
      }

      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/9e8fe5d5-f5ea-4b98-9c87-58a80bfea5df", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        mode: "cors",
      })

      console.log("[v0] WhatsApp response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] WhatsApp error response:", errorText)
        throw new Error(`Failed to submit credentials: ${response.status}`)
      }

      setSuccess(true)
    } catch (err) {
      console.log("[v0] WhatsApp submission error:", err)
      setError("Unable to save credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>WhatsApp API Setup</DialogTitle>
          <DialogDescription>
            Provide your WhatsApp Cloud API credentials to enable WhatsApp messaging through our system.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-sm font-medium text-center">
              Connection will be processed soon. You will receive a notification once done.
            </p>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false)
                setSuccess(false)
                setFormData({
                  whatsapp_access_token: "",
                  whatsapp_business_account_id: "",
                })
              }}
            >
              OK
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* WhatsApp Access Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp Access Token</label>
              <Input
                type="password"
                placeholder="EAAG..."
                value={formData.whatsapp_access_token}
                onChange={(e) => handleInputChange("whatsapp_access_token", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Generated from Meta Developers → WhatsApp → API Setup</p>
            </div>

            {/* WhatsApp Business Account ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp Business Account ID (WABA ID)</label>
              <Input
                type="text"
                placeholder="123456789012345"
                value={formData.whatsapp_business_account_id}
                onChange={(e) => handleInputChange("whatsapp_business_account_id", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Found in Meta Business Manager → WhatsApp Accounts</p>
            </div>

            {/* Security Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Security & Transparency</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                <li>• Credentials are encrypted and stored securely</li>
                <li>• Used only to authenticate with WhatsApp Cloud API</li>
                <li>• You can revoke access anytime from Meta Business Manager</li>
                <li>• Never shared with third parties</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg text-sm text-red-700 dark:text-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={!isFormValid() || loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save WhatsApp Credentials"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
