"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function TestUsersPage() {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  
  // Mutations
  const createTestUsers = useMutation(api.seed.createTestUsers)
  const seedDemoData = useMutation(api.seed.seedDemoData)
  
  // Queries
  const users = useQuery(api.users.getAll)
  const messages = useQuery(api.messages.getConversation, {
    userId: "admin@demo",
    otherUserId: "floor@demo"
  })

  const handleCreateUsers = async () => {
    setIsCreating(true)
    try {
      const result = await createTestUsers()
      console.log("Create users result:", result)
      toast({
        title: "Success",
        description: `Users created! Admin: ${result.adminExists ? 'exists' : 'created'}, Floor: ${result.floorExists ? 'exists' : 'created'}`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to create users",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleSeedAll = async () => {
    setIsCreating(true)
    try {
      const result = await seedDemoData()
      console.log("Seed all result:", result)
      toast({
        title: "Success",
        description: "All demo data created including users, workflows, items, and messages!",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to create demo data",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">🧪 Test Users & Messaging</h1>
          <p className="text-gray-600">
            Create test users and verify messaging functionality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Users */}
          <Card>
            <CardHeader>
              <CardTitle>Create Test Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Users to Create:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">admin@demo</Badge>
                    <span>Admin User (admin role)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">floor@demo</Badge>
                    <span>Floor Worker (operator role)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateUsers}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? "Creating..." : "Create Users Only"}
                </Button>
                <Button 
                  onClick={handleSeedAll}
                  disabled={isCreating}
                  variant="outline"
                  className="flex-1"
                >
                  {isCreating ? "Creating..." : "Create All Demo Data"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Users */}
          <Card>
            <CardHeader>
              <CardTitle>Current Users</CardTitle>
            </CardHeader>
            <CardContent>
              {users ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-2">
                    Found {users.length} user(s):
                  </div>
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{user.name || user.email}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Loading users...</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Test Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {messages ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-600 mb-2">
                  Found {messages.length} message(s) between admin and floor:
                </div>
                {messages.map((message) => (
                  <div key={message._id} className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {message.senderId} → {message.recipientId}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {message.content.length > 100 
                        ? message.content.substring(0, 100) + "..." 
                        : message.content
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No messages found or loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <a href="/admin/messaging">Go to Admin Messaging</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/test-messaging">Go to Test Messaging</a>
          </Button>
        </div>
      </div>
    </div>
  )
} 