"use client"

import { useState } from "react"
import { AdminMessages } from "@/components/admin/admin-messages"
import { MessagesPanel } from "@/components/factory/messages-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Bot, User } from "lucide-react"

export default function TestMessagingPage() {
  const [activeView, setActiveView] = useState<"admin" | "floor">("admin")
  const [isFloorMessagesOpen, setIsFloorMessagesOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">🧪 Messaging System Test</h1>
          <p className="text-gray-600">
            Test real-time messaging between Admin and Floor users
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-4">
          <Button
            variant={activeView === "admin" ? "default" : "outline"}
            onClick={() => setActiveView("admin")}
            className="flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Admin View
          </Button>
          <Button
            variant={activeView === "floor" ? "default" : "outline" : "outline"}
            onClick={() => setActiveView("floor")}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Floor View
          </Button>
        </div>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              How to Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  Admin Side
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Switch to "Admin View" above</li>
                  <li>• Type a message in the input field</li>
                  <li>• Click "Send" or press Enter</li>
                  <li>• Message will be sent to Floor Worker</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Floor Side
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Switch to "Floor View" above</li>
                  <li>• Click the "Messages" button in footer</li>
                  <li>• Type a reply message</li>
                  <li>• Send message back to Admin</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Open both views in separate browser tabs for real-time testing</li>
                <li>• Messages are stored in Convex and persist between sessions</li>
                <li>• Unread message counts update automatically</li>
                <li>• Try sending messages from both sides simultaneously</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Active View */}
        {activeView === "admin" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Admin Interface</h2>
              <Badge variant="secondary">admin@demo</Badge>
            </div>
            <AdminMessages />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold">Floor Interface</h2>
              <Badge variant="secondary">floor@demo</Badge>
            </div>
            
            {/* Simulated Floor App */}
            <div className="bg-gray-900 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🏭 Factory Floor</h3>
                <div className="text-sm text-gray-300">Production Line</div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Current Item</h4>
                  <div className="text-sm text-gray-300">
                    Item: TEST-ITEM-123 | Stage: Assembly | Status: Active
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• Item scanned at 2:34 PM</div>
                    <div>• Stage completed at 2:35 PM</div>
                    <div>• Quality check pending</div>
                  </div>
                </div>
              </div>
              
              {/* Floor Footer with Messages Button */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      📱 Scan
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      📦 Move
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 flex items-center gap-2"
                    onClick={() => setIsFloorMessagesOpen(true)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Messages
                    <Badge variant="destructive" className="ml-1 w-4 h-4 text-xs p-0">
                      2
                    </Badge>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floor Messages Panel */}
        <MessagesPanel 
          isOpen={isFloorMessagesOpen}
          onClose={() => setIsFloorMessagesOpen(false)}
          currentUserId="floor@demo"
        />
      </div>
    </div>
  )
} 