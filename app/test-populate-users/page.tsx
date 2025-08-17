"use client"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function TestPopulateUsersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSeedingMessages, setIsSeedingMessages] = useState(false)
  const [isSeedingTasks, setIsSeedingTasks] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [messagesResult, setMessagesResult] = useState<any>(null)
  const [tasksResult, setTasksResult] = useState<any>(null)
  
  const createDemoTeamUsers = useMutation(api.users.createDemoTeamUsers)
  const seedDemoMessages = useMutation(api.messages.seedDemoMessages)
  const seedDemoTasks = useMutation(api.tasks.seedDemoTasks)
  const { toast } = useToast()

  const handlePopulateUsers = async () => {
    setIsLoading(true)
    try {
      const createdUsers = await createDemoTeamUsers({})
      setResult(createdUsers)
      toast({
        title: "Success!",
        description: `Created ${createdUsers.length} demo team users`,
      })
    } catch (error) {
      console.error("Error creating demo users:", error)
      toast({
        title: "Error",
        description: "Failed to create demo users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedMessages = async () => {
    setIsSeedingMessages(true)
    try {
      const createdMessages = await seedDemoMessages({})
      setMessagesResult(createdMessages)
      toast({
        title: "Success!",
        description: `Created ${createdMessages.length} demo messages`,
      })
    } catch (error) {
      console.error("Error seeding demo messages:", error)
      toast({
        title: "Error",
        description: "Failed to seed demo messages. Make sure demo users exist first.",
        variant: "destructive",
      })
    } finally {
      setIsSeedingMessages(false)
    }
  }

  const handleSeedTasks = async () => {
    setIsSeedingTasks(true)
    try {
      const createdTasks = await seedDemoTasks({})
      setTasksResult(createdTasks)
      toast({
        title: "Success!",
        description: `Created ${createdTasks.length} demo tasks`,
      })
    } catch (error) {
      console.error("Error seeding demo tasks:", error)
      toast({
        title: "Error",
        description: "Failed to seed demo tasks. Make sure demo users exist first.",
        variant: "destructive",
      })
    } finally {
      setIsSeedingTasks(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Populate Demo Team Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This will create demo users for all teams (production, cutting, sewing, quality, packaging) 
            with realistic names and roles for testing the Disco Floor Application.
          </p>
          
          <Button 
            onClick={handlePopulateUsers} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creating Users..." : "Create Demo Team Users"}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Created Users:</h3>
              <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seed Demo Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This will create realistic demo messages for each team with different priorities and timestamps.
            Make sure to create demo users first.
          </p>
          
          <Button 
            onClick={handleSeedMessages} 
            disabled={isSeedingMessages}
            className="w-full"
          >
            {isSeedingMessages ? "Creating Messages..." : "Seed Demo Messages"}
          </Button>

          {messagesResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Created Messages:</h3>
              <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                <pre className="text-sm">{JSON.stringify(messagesResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seed Demo Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This will create realistic demo tasks for each team with different priorities, due dates, and statuses.
            Make sure to create demo users first.
          </p>
          
          <Button 
            onClick={handleSeedTasks} 
            disabled={isSeedingTasks}
            className="w-full"
          >
            {isSeedingTasks ? "Creating Tasks..." : "Seed Demo Tasks"}
          </Button>

          {tasksResult && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Created Tasks:</h3>
              <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                <pre className="text-sm">{JSON.stringify(tasksResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
