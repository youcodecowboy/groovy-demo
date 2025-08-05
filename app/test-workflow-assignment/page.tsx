"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { Package, User, MapPin, Bell } from "lucide-react"

export default function TestWorkflowAssignment() {
  const [itemId, setItemId] = useState("")
  const [selectedStage, setSelectedStage] = useState("")
  const [enteredBy, setEnteredBy] = useState("")
  
  const { toast } = useToast()
  
  // Fetch data
  const items = useQuery(api.items.getAll) || []
  const locations = useQuery(api.locations.getActive) || []
  const users = useQuery(api.users.getActive) || []
  const notifications = useQuery(api.notifications.getNotifications, { userId: "test-user", limit: 10 }) || []
  
  // Mutations
  const enterStage = useMutation(api.items.enterStage)
  
  // Sample workflow stages (in real app, this would come from the workflow)
  const sampleStages = [
    { id: "cut", name: "Cutting", locationId: "cutting-room", assignedUserId: "operator1" },
    { id: "sew", name: "Sewing", locationId: "sewing-station", assignedUserId: "operator2" },
    { id: "qc", name: "Quality Check", locationId: "qc-area", assignedUserId: "inspector1" },
  ]

  const handleEnterStage = async () => {
    if (!itemId || !selectedStage || !enteredBy) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const stage = sampleStages.find(s => s.id === selectedStage)
    if (!stage) {
      toast({
        title: "Invalid Stage",
        description: "Please select a valid stage",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await enterStage({
        itemId,
        stageId: stage.id,
        stageName: stage.name,
        locationId: stage.locationId,
        assignedUserId: stage.assignedUserId,
        enteredBy,
      })

      toast({
        title: "Success",
        description: result.message,
      })

      // Clear form
      setItemId("")
      setSelectedStage("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enter stage",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Workflow Assignment Test</h1>
        <p className="text-gray-600">Test the workflow assignment and notification system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Enter Stage Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Item ID</Label>
              <Input
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder="Enter item ID"
              />
            </div>
            
            <div>
              <Label>Stage</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stage" />
                </SelectTrigger>
                <SelectContent>
                  {sampleStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Entered By</Label>
              <Input
                value={enteredBy}
                onChange={(e) => setEnteredBy(e.target.value)}
                placeholder="User ID"
              />
            </div>

            <Button onClick={handleEnterStage} className="w-full">
              Enter Stage
            </Button>
          </CardContent>
        </Card>

        {/* Stage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Stage Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStage && (
              <div className="space-y-3">
                {sampleStages
                  .filter(stage => stage.id === selectedStage)
                  .map(stage => (
                    <div key={stage.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Stage:</span>
                        <span>{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Location:</span>
                        <span>{locations.find(loc => loc._id === stage.locationId)?.name || stage.locationId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Assigned To:</span>
                        <span>{users.find(user => user._id === stage.assignedUserId)?.name || stage.assignedUserId}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Items ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.slice(0, 5).map(item => (
                <div key={item._id} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="font-medium">{item.itemId}</div>
                  <div className="text-gray-600">Stage: {item.currentStageId}</div>
                  <div className="text-gray-600">Assigned: {item.assignedTo || "None"}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.slice(0, 5).map(user => (
                <div key={user._id} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-gray-600">{user.role}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications ({notifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.slice(0, 5).map(notification => (
                <div key={notification._id} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-gray-600">{notification.message}</div>
                  <div className="text-xs text-gray-500">{notification.type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 