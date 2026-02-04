"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface GmailOAuthFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GmailOAuthForm({ open, onOpenChange }: GmailOAuthFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    google_client_id: "",
    google_client_secret: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isFormValid = () => {
    return formData.google_client_id && formData.google_client_secret
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        google_client_id: formData.google_client_id,
        google_client_secret: formData.google_client_secret,
        submitted_at: new Date().toISOString(),
      }

      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/dc7906fc-906d-4553-9f05-eb1b67236eb0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to submit credentials")
      }

      setSuccess(true)
    } catch (err) {
      setError("Unable to save credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gmail OAuth Setup</DialogTitle>
          <DialogDescription>
            Provide your Google OAuth credentials to securely enable Gmail access via official Google APIs.
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
                  google_client_id: "",
                  google_client_secret: "",
                })
              }}
            >
              OK
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google Client ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Client ID</label>
              <Input
                type="text"
                placeholder="1234567890-abcxyz.apps.googleusercontent.com"
                value={formData.google_client_id}
                onChange={(e) => handleInputChange("google_client_id", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Found in Google Cloud Console → APIs & Services → Credentials
              </p>
            </div>

            {/* Google Client Secret */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Client Secret</label>
              <Input
                type="password"
                placeholder="••••••••••••••••••••"
                value={formData.google_client_secret}
                onChange={(e) => handleInputChange("google_client_secret", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Used only for OAuth authorization. Stored securely.</p>
            </div>

            {/* Security Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Security & Transparency</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                <li>• Credentials are encrypted and stored securely</li>
                <li>• Used only to authorize Gmail access</li>
                <li>• You can revoke access anytime from Google account settings</li>
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
                "Save Gmail Credentials"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
