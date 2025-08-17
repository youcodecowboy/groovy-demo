"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { DiscoHeader } from "@/components/disco/disco-header"
import { DiscoFooter } from "@/components/disco/disco-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QRScanner } from "@/components/ui/qr-scanner"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Package,
  Calendar,
  AlertTriangle,
  Camera,
  ScanLine,
  FileText,
  Ruler,
  Eye,
  Play,
  Pause,
  Flag,
  History,
  Settings
} from "lucide-react"

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedTeam, setSelectedTeam] = useState<string>("production")
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<any>(null)
  const [actionData, setActionData] = useState<any>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const itemId = params.itemId as string

  // Get item details
  const item = useQuery(api.items.getItemsByTeam, { teamId: selectedTeam })
  const currentItem = item?.find((i: any) => i.itemId === itemId)

  // Mutations
  const advanceItem = useMutation(api.items.advanceItemWithValidation)

  // Auto-detect team from item's current stage
  useEffect(() => {
    if (currentItem?.currentStage?.name) {
      const stageName = currentItem.currentStage.name.toLowerCase()
      if (stageName.includes("cut")) setSelectedTeam("cutting")
      else if (stageName.includes("sew")) setSelectedTeam("sewing")
      else if (stageName.includes("qc") || stageName.includes("quality")) setSelectedTeam("quality")
      else if (stageName.includes("pack")) setSelectedTeam("packaging")
      else setSelectedTeam("production")
    }
  }, [currentItem])

  const handleScan = async (data: string) => {
    try {
      // Navigate to the scanned item's detail page
      const scannedItemId = data.replace("item:", "")
      router.push(`/disco/items/${scannedItemId}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process scan",
        variant: "destructive",
      })
    }
  }

  const handleActionClick = (action: any) => {
    setCurrentAction(action)
    setActionData({})
    setActionModalOpen(true)
  }

  const handleActionSubmit = async () => {
    if (!currentItem || !currentAction) return

    setIsProcessing(true)
    try {
      const completedActions = [{
        id: currentAction.id,
        type: currentAction.type,
        label: currentAction.label,
        data: actionData
      }]

      const result = await advanceItem({
        itemId: currentItem._id,
        userId: "disco-floor",
        completedActions,
        notes: `Completed: ${currentAction.label}`
      })

      if (result.status === "completed") {
        toast({
          title: "✅ Item Completed",
          description: "Item has been completed successfully",
        })
        router.push("/disco")
      } else {
        toast({
          title: "✅ Action Completed",
          description: `Advanced to ${result.nextStage?.name}`,
        })
        setActionModalOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete action",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const renderActionInput = (action: any) => {
    switch (action.type) {
      case "scan":
        return (
          <div className="space-y-2">
            <Label>Scan Value</Label>
            <Input
              placeholder="Enter or scan value"
              value={actionData.scannedValue || ""}
              onChange={(e) => setActionData({ ...actionData, scannedValue: e.target.value })}
            />
          </div>
        )
      
      case "note":
        return (
          <div className="space-y-2">
            <Label>{action.config?.notePrompt || "Notes"}</Label>
            <Textarea
              placeholder="Enter notes..."
              value={actionData.note || ""}
              onChange={(e) => setActionData({ ...actionData, note: e.target.value })}
              rows={3}
            />
          </div>
        )
      
      case "measurement":
        return (
          <div className="space-y-2">
            <Label>Measurement Value</Label>
            <Input
              type="number"
              placeholder={`Enter measurement in ${action.config?.measurementUnit || "units"}`}
              value={actionData.value || ""}
              onChange={(e) => setActionData({ ...actionData, value: parseFloat(e.target.value) })}
            />
          </div>
        )
      
      case "approval":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="approval"
                checked={actionData.approved || false}
                onCheckedChange={(checked) => setActionData({ ...actionData, approved: checked })}
              />
              <Label htmlFor="approval">Approve this action</Label>
            </div>
          </div>
        )
      
      case "photo":
        return (
          <div className="space-y-2">
            <Label>Photo Capture</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Photo capture functionality would be implemented here</p>
            </div>
          </div>
        )
      
      case "inspection":
        return (
          <div className="space-y-2">
            <Label>Inspection Checklist</Label>
            {action.config?.inspectionChecklist?.map((item: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Switch
                  id={`checklist-${index}`}
                  checked={actionData.checklist?.[index] || false}
                  onCheckedChange={(checked) => setActionData({
                    ...actionData,
                    checklist: { ...actionData.checklist, [index]: checked }
                  })}
                />
                <Label htmlFor={`checklist-${index}`}>{item}</Label>
              </div>
            ))}
          </div>
        )
      
      default:
        return <div>Unknown action type</div>
    }
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-white">
        <DiscoHeader currentTeam={selectedTeam} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Item Not Found</h2>
            <p className="text-gray-600 mb-4">Item {itemId} was not found in the current team's queue.</p>
            <Button onClick={() => router.push("/disco")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Queue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const requiredActions = currentItem.requiredActions?.filter((a: any) => a.required) || []
  const optionalActions = currentItem.requiredActions?.filter((a: any) => !a.required) || []

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <DiscoHeader currentTeam={selectedTeam} />
      
      {/* Main Content */}
      <div className="flex-1 pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.push("/disco")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Queue
          </Button>

          {/* Item Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">#{currentItem.itemId}</h1>
                <p className="text-gray-600">{currentItem.metadata?.brand || "Unknown Brand"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {currentItem.currentStage?.name || "Unknown Stage"}
                </Badge>
                <Badge variant={currentItem.status === "active" ? "default" : "secondary"}>
                  {currentItem.status}
                </Badge>
              </div>
            </div>

            {/* Item Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Order:</span>
                    <p className="font-medium">{currentItem.metadata?.purchaseOrderId || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Customer:</span>
                    <p className="font-medium">{currentItem.metadata?.brand || "Unknown"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location & Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Location:</span>
                    <p className="font-medium">{currentItem.currentLocationId || "Unassigned"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Assigned To:</span>
                    <p className="font-medium">{currentItem.assignedTo || "Unassigned"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Started:</span>
                    <p className="font-medium">
                      {new Date(currentItem.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Est. Duration:</span>
                    <p className="font-medium">
                      {currentItem.currentStage?.estimatedDuration || 4}h
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Required Actions Section */}
          {requiredActions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Required Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredActions.map((action: any) => (
                  <Card key={action.id} className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                        {action.type === "scan" && <ScanLine className="w-4 h-4" />}
                        {action.type === "note" && <FileText className="w-4 h-4" />}
                        {action.type === "measurement" && <Ruler className="w-4 h-4" />}
                        {action.type === "approval" && <CheckCircle className="w-4 h-4" />}
                        {action.type === "photo" && <Camera className="w-4 h-4" />}
                        {action.type === "inspection" && <Eye className="w-4 h-4" />}
                        {action.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-orange-700 mb-3">
                        {action.description || "This action is required to advance the item."}
                      </p>
                      <Button
                        onClick={() => handleActionClick(action)}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        Complete Action
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Optional Actions Section */}
          {optionalActions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Optional Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optionalActions.map((action: any) => (
                  <Card key={action.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        {action.type === "scan" && <ScanLine className="w-4 h-4" />}
                        {action.type === "note" && <FileText className="w-4 h-4" />}
                        {action.type === "measurement" && <Ruler className="w-4 h-4" />}
                        {action.type === "approval" && <CheckCircle className="w-4 h-4" />}
                        {action.type === "photo" && <Camera className="w-4 h-4" />}
                        {action.type === "inspection" && <Eye className="w-4 h-4" />}
                        {action.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        {action.description || "This action is optional."}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => handleActionClick(action)}
                        className="w-full"
                      >
                        Complete Action
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Next Stage Preview */}
          {currentItem.nextStage && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Stage</h2>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">{currentItem.nextStage.name}</h3>
                      <p className="text-sm text-blue-700">
                        {currentItem.nextStage.description || "Next stage in the workflow"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      Next
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer with QR Scanner */}
      <DiscoFooter 
        onScan={handleScan}
        isScannerOpen={isScannerOpen}
        onScannerToggle={() => setIsScannerOpen(!isScannerOpen)}
        currentTeam={selectedTeam}
      />

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentAction?.type === "scan" && <ScanLine className="w-5 h-5" />}
              {currentAction?.type === "note" && <FileText className="w-5 h-5" />}
              {currentAction?.type === "measurement" && <Ruler className="w-5 h-5" />}
              {currentAction?.type === "approval" && <CheckCircle className="w-5 h-5" />}
              {currentAction?.type === "photo" && <Camera className="w-5 h-5" />}
              {currentAction?.type === "inspection" && <Eye className="w-5 h-5" />}
              {currentAction?.label}
            </DialogTitle>
            <DialogDescription>
              {currentAction?.description || "Complete this action to advance the item"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentAction && renderActionInput(currentAction)}
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setActionModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleActionSubmit}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? "Processing..." : "Complete Action"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
