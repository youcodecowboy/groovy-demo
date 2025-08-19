"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Users, Building2, ArrowRight } from "lucide-react"

export function FooterCTAs() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      // In a real implementation, this would submit to your email service
      console.log("Email submitted:", email)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Investors & Partners */}
      <Card className="border-2 border-black bg-white">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-zinc-100">
              <Building2 className="h-6 w-6 text-zinc-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-3">
            Investors & Partners
          </h3>
          <p className="text-zinc-600 mb-6">
            Interested in partnering with us? Get access to our investor deck and partnership opportunities.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="outline">Series A</Badge>
            <Badge variant="outline">Manufacturing</Badge>
            <Badge variant="outline">B2B SaaS</Badge>
            <Badge variant="outline">Enterprise</Badge>
          </div>
          <Button className="w-full">
            Request Deck
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Join Us */}
      <Card className="border-2 border-black bg-white">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-zinc-100">
              <Users className="h-6 w-6 text-zinc-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-3">
            Join Us
          </h3>
          <p className="text-zinc-600 mb-6">
            We're building the future of manufacturing. Join our team and help digitize the physical world.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="outline">Engineering</Badge>
            <Badge variant="outline">Product</Badge>
            <Badge variant="outline">Sales</Badge>
            <Badge variant="outline">Operations</Badge>
          </div>
          <Button className="w-full">
            View Roles
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Email Capture - Full Width */}
      <div className="lg:col-span-2">
        <Card className="border-2 border-black bg-zinc-50">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-lg bg-white">
                <Mail className="h-6 w-6 text-zinc-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-3">
              Get Updates
            </h3>
            <p className="text-zinc-600 mb-6 max-w-md mx-auto">
              Get updates when we open wider access. No spam, just important product updates and announcements.
            </p>
            
            {!isSubscribed ? (
              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit">
                    Subscribe
                  </Button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200"
              >
                <Mail className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">Thanks for subscribing!</span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FooterCTAs
