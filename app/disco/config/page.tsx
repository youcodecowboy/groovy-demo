"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Users, Workflow, Monitor } from "lucide-react"

export default function DiscoConfigPage() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [selectedWorkflow, setSelectedWorkflow] = useState("default")

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Disco Configuration</h1>
        <p className="text-gray-600">Configure factory floor views and team assignments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="disco-enabled">Enable Disco Floor App</Label>
              <Switch
                id="disco-enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-workflow">Default Workflow</Label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Production</SelectItem>
                  <SelectItem value="custom">Custom Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refresh-interval">Auto-refresh Interval (seconds)</Label>
              <Input
                id="refresh-interval"
                type="number"
                defaultValue={30}
                min={5}
                max={300}
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {["Production", "Cutting", "Sewing", "Quality Control", "Packaging"].map((team) => (
                <div key={team} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{team}</Badge>
                    <span className="text-sm text-gray-600">5 members</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </div>
              ))}
            </div>
            
            <Button className="w-full" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Add New Team
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              Workflow Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { team: "Production", workflow: "Default Production", status: "active" },
                { team: "Cutting", workflow: "Cutting Process", status: "active" },
                { team: "Sewing", workflow: "Sewing Process", status: "active" },
                { team: "Quality Control", workflow: "QC Process", status: "active" },
                { team: "Packaging", workflow: "Packaging Process", status: "active" },
              ].map((item) => (
                <div key={item.team} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.team}</div>
                    <div className="text-sm text-gray-600">{item.workflow}</div>
                  </div>
                  <Badge variant={item.status === "active" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Card Layout</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="default">Grid</Button>
                <Button size="sm" variant="outline">List</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Items per page</Label>
              <Select defaultValue="12">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 items</SelectItem>
                  <SelectItem value="12">12 items</SelectItem>
                  <SelectItem value="24">24 items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-priority">Show Priority Colors</Label>
              <Switch id="show-priority" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-timers">Show Due Time Countdown</Label>
              <Switch id="show-timers" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Configuration</Button>
      </div>
    </div>
  )
}
