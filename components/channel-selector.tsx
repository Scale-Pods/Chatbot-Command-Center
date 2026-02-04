"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useState } from "react"
import { InstagramForm } from "@/components/instagram-form"
import { GmailOAuthForm } from "@/components/gmail-oauth-form"
import { WhatsAppSetupForm } from "@/components/whatsapp-setup-form"

interface ChannelSelectorProps {
  selectedChannel?: string | null
  onSelectChannel?: (channel: string) => void
}

export function ChannelSelector({ selectedChannel, onSelectChannel }: ChannelSelectorProps) {
  const [connectedChannels, setConnectedChannels] = useState<Record<string, boolean>>({
    website: true,
    whatsapp: true,
    gmail: true,
    instagram: true,
  })
  const [instagramFormOpen, setInstagramFormOpen] = useState(false)
  const [gmailFormOpen, setGmailFormOpen] = useState(false)
  const [whatsappFormOpen, setWhatsappFormOpen] = useState(false)

  const WhatsAppLogo = () => (
    <svg viewBox="0 0 1219.547 1225.016" className="h-8 w-8">
      <defs>
        <linearGradient
          id="whatsapp-gradient"
          x1="609.77"
          x2="609.77"
          y1="1190.114"
          y2="21.084"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#20b038" />
          <stop offset="1" stopColor="#60d66a" />
        </linearGradient>
      </defs>
      <path
        fill="url(#whatsapp-gradient)"
        d="M27.875 1190.114l82.211-300.18c-50.719-87.852-77.391-187.523-77.359-289.602.133-319.398 260.078-579.25 579.469-579.25 155.016.07 300.508 60.398 409.898 169.891 109.414 109.492 169.633 255.031 169.57 409.812-.133 319.406-260.094 579.281-579.445 579.281-.023 0 .016 0 0 0h-.258c-96.977-.031-192.266-24.375-276.898-70.5l-307.188 80.548z"
      />
      <path
        fill="#FFF"
        fillRule="evenodd"
        d="M462.273 349.294c-11.234-24.977-23.062-25.477-33.75-25.914-8.742-.375-18.75-.352-28.742-.352-10 0-26.25 3.758-39.992 18.766-13.75 15.008-52.5 51.289-52.5 125.078 0 73.797 53.75 145.102 61.242 155.117 7.5 10 103.758 166.266 256.203 226.383 126.695 49.961 152.477 40.023 179.977 37.523s88.734-36.273 101.234-71.297c12.5-35.016 12.5-65.031 8.75-71.305-3.75-6.25-13.75-10-28.75-17.5s-88.734-43.789-102.484-48.789-23.75-7.5-33.75 7.516c-10 15-38.727 48.773-47.477 58.773-8.75 10.023-17.5 11.273-32.5 3.773-15-7.523-63.305-23.344-120.609-74.438-44.586-39.75-74.688-88.844-83.438-103.859-8.75-15-.938-23.125 6.586-30.602 6.734-6.719 15-17.508 22.5-26.266 7.484-8.758 9.984-15.008 14.984-25.008 5-10.016 2.5-18.773-1.25-26.273s-32.898-81.67-46.234-111.326z"
        clipRule="evenodd"
      />
    </svg>
  )

  const InstagramLogo = () => (
    <svg viewBox="0 0 16 16" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient
          id="instagram-gradient"
          x1="1.464"
          x2="14.536"
          y1="14.536"
          y2="1.464"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFC107" />
          <stop offset=".507" stopColor="#F44336" />
          <stop offset=".99" stopColor="#9C27B0" />
        </linearGradient>
        <linearGradient
          id="instagram-gradient-2"
          x1="5.172"
          x2="10.828"
          y1="10.828"
          y2="5.172"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFC107" />
          <stop offset=".507" stopColor="#F44336" />
          <stop offset=".99" stopColor="#9C27B0" />
        </linearGradient>
        <linearGradient
          id="instagram-gradient-3"
          x1="11.923"
          x2="12.677"
          y1="4.077"
          y2="3.323"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFC107" />
          <stop offset=".507" stopColor="#F44336" />
          <stop offset=".99" stopColor="#9C27B0" />
        </linearGradient>
      </defs>
      <path
        fill="url(#instagram-gradient)"
        d="M11 0H5a5 5 0 0 0-5 5v6a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5zm3.5 11c0 1.93-1.57 3.5-3.5 3.5H5c-1.93 0-3.5-1.57-3.5-3.5V5c0-1.93 1.57-3.5 3.5-3.5h6c1.93 0 3.5 1.57 3.5 3.5v6z"
      />
      <path
        fill="url(#instagram-gradient-2)"
        d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6.5A2.503 2.503 0 0 1 5.5 8c0-1.379 1.122-2.5 2.5-2.5s2.5 1.121 2.5 2.5c0 1.378-1.122 2.5-2.5 2.5z"
      />
      <circle cx="12.3" cy="3.7" r=".533" fill="url(#instagram-gradient-3)" />
    </svg>
  )

  const GmailLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="h-8 w-8">
      <path
        fill="#ea4435"
        d="M16.58,19.1068l-12.69-8.0757A3,3,0,0,1,7.1109,5.97l9.31,5.9243L24.78,6.0428A3,3,0,0,1,28.22,10.9579Z"
      ></path>
      <path
        fill="#00ac47"
        d="M25.5,5.5h4a0,0,0,0,1,0,0v18a3,3,0,0,1-3,3h0a3,3,0,0,1-3-3V7.5a2,2,0,0,1,2-2Z"
        transform="rotate(180 26.5 16)"
      ></path>
      <path
        fill="#ffba00"
        d="M29.4562,8.0656c-.0088-.06-.0081-.1213-.0206-.1812-.0192-.0918-.0549-.1766-.0823-.2652a2.9312,2.9312,0,0,0-.0958-.2993c-.02-.0475-.0508-.0892-.0735-.1354A2.9838,2.9838,0,0,0,28.9686,6.8c-.04-.0581-.09-.1076-.1342-.1626a3.0282,3.0282,0,0,0-.2455-.2849c-.0665-.0647-.1423-.1188-.2146-.1771a3.02,3.02,0,0,0-.24-.1857c-.0793-.0518-.1661-.0917-.25-.1359-.0884-.0461-.175-.0963-.267-.1331-.0889-.0358-.1837-.0586-.2766-.0859s-.1853-.06-.2807-.0777a3.0543,3.0543,0,0,0-.357-.036c-.0759-.0053-.1511-.0186-.2273-.018a2.9778,2.9778,0,0,0-.4219.0425c-.0563.0084-.113.0077-.1689.0193a33.211,33.211,0,0,0-.5645.178c-.0515.022-.0966.0547-.1465.0795A2.901,2.901,0,0,0,23.5,8.5v5.762l4.72-3.3043a2.8878,2.8878,0,0,0,1.2359-2.8923Z"
      ></path>
      <path fill="#4285f4" d="M5.5,5.5h0a3,3,0,0,1,3,3v18a0,0,0,0,1,0,0h-4a2,2,0,0,1-2-2V8.5a3,3,0,0,1,3-3Z"></path>
      <path
        fill="#c52528"
        d="M2.5439,8.0656c.0088-.06.0081-.1213.0206-.1812.0192-.0918.0549-.1766.0823-.2652A2.9312,2.9312,0,0,1,2.7426,7.32c.02-.0475.0508-.0892.0736-.1354A2.9719,2.9719,0,0,1,3.0316,6.8c.04-.0581.09-.1076.1342-.1626a3.0272,3.0272,0,0,1,.2454-.2849c.0665-.0647.1423-.1188.2147-.1771a3.0005,3.0005,0,0,1,.24-.1857c.0793-.0518.1661-.0917.25-.1359A2.9747,2.9747,0,0,1,4.3829,5.72c.089-.0358.1838-.0586.2766-.0859s.1853-.06.2807-.0777a3.0565,3.0565,0,0,1,.357-.036c.076-.0053.1511-.0186.2273-.018a2.9763,2.9763,0,0,1,.4219.0425c.0563.0084.113.0077.169.0193a2.9056,2.9056,0,0,1,.286.0888,2.9157,2.9157,0,0,1,.2785.0892c.0514.022.0965.0547.1465.0795a2.9745,2.9745,0,0,1,.3742.21A2.9943,2.9943,0,0,1,8.5,8.5v5.762L3.78,10.9579A2.8891,2.8891,0,0,1,2.5439,8.0656Z"
      />
    </svg>
  )

  const channels = [
    {
      id: "website",
      name: "Website",
      icon: Globe,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Web chat widget",
      logoComponent: null,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: null,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "WhatsApp Business",
      logoComponent: WhatsAppLogo,
    },
    {
      id: "gmail",
      name: "Gmail",
      icon: null,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      description: "Email communications",
      logoComponent: GmailLogo,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: null,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      description: "Direct messages",
      logoComponent: InstagramLogo,
    },
  ]

  const handleConnect = (channelId: string) => {
    if (channelId === "instagram") {
      setInstagramFormOpen(true)
    } else if (channelId === "gmail") {
      setGmailFormOpen(true)
    } else if (channelId === "whatsapp") {
      setWhatsappFormOpen(true)
    } else {
      setConnectedChannels((prev) => ({
        ...prev,
        [channelId]: true,
      }))
    }
  }

  const handleDisconnect = (channelId: string) => {
    setConnectedChannels((prev) => ({
      ...prev,
      [channelId]: false,
    }))
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Connected Channels</h2>
        <p className="text-muted-foreground">Manage interactions across multiple communication platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((channel) => {
          const Icon = channel.icon
          const LogoComponent = channel.logoComponent
          const isSelected = selectedChannel === channel.id
          const isConnected = connectedChannels[channel.id]

          return (
            <Card
              key={channel.id}
              onClick={() => onSelectChannel?.(channel.id)}
              className={`p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? "ring-2 ring-primary shadow-lg" : ""
              }`}
            >
              <div className={`${channel.bgColor} p-4 rounded-lg mb-4 flex items-center justify-center h-16 w-16`}>
                {LogoComponent ? (
                  <div className={channel.color}>
                    <LogoComponent />
                  </div>
                ) : (
                  <Icon className={`h-8 w-8 ${channel.color}`} />
                )}
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-1">{channel.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{channel.description}</p>

              <div className="flex gap-2 w-full mt-auto">
                {isConnected ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDisconnect(channel.id)
                    }}
                    className="flex-1"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleConnect(channel.id)
                    }}
                    className="flex-1"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <GmailOAuthForm open={gmailFormOpen} onOpenChange={setGmailFormOpen} />
      <InstagramForm open={instagramFormOpen} onOpenChange={setInstagramFormOpen} />
      <WhatsAppSetupForm open={whatsappFormOpen} onOpenChange={setWhatsappFormOpen} />
    </div>
  )
}
