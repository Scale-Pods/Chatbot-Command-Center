"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Mail, Globe, Check, X } from "lucide-react"

interface IntegrationsModalProps {
  onClose: () => void
}

export function IntegrationsModal({ onClose }: IntegrationsModalProps) {
  const [integrations, setIntegrations] = useState({
    gmail: true,
    whatsapp: true,
    website: false,
  })

  const toggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const integrationsList = [
    {
      key: "gmail" as const,
      name: "Gmail",
      icon: Mail,
      description: "Connect your Gmail to receive and respond to emails",
      color: "text-red-500",
    },
    {
      key: "whatsapp" as const,
      name: "WhatsApp",
      icon: MessageSquare,
      description: "Integrate WhatsApp Business for customer messaging",
      color: "text-green-500",
    },
    {
      key: "website" as const,
      name: "Website",
      icon: Globe,
      description: "Add chat widget to your website",
      color: "text-blue-500",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl bg-card p-6 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Integrations</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your connected channels</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {integrationsList.map((integration) => {
            const Icon = integration.icon
            const isConnected = integrations[integration.key]

            return (
              <Card key={integration.key} className="p-4 transition-all hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg bg-muted ${integration.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{integration.name}</h3>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                            <Check className="h-3 w-3" />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                    </div>
                  </div>
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleIntegration(integration.key)}
                  >
                    {isConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </Card>
    </div>
  )
}
