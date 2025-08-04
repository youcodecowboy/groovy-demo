"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { dataAdapter } from "@/lib/dataAdapter"
import type { Item, Workflow, Stage } from "@/types/schema"
import { QRDisplay } from "@/components/ui/qr-display"
import { StageBadge } from "@/components/ui/stage-badge"
import { ArrowRight, Clock, User } from "lucide-react"

export default function ItemDetailPage() {
  const params = useParams()
  const itemId = params.itemId as string
  const [item, setItem] = useState<Item | null>(null)
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadItemData()
  }, [itemId])

  const loadItemData = async () => {
    try {
      setLoading(true)
      const itemData = await dataAdapter.getItem(itemId)
      const workflows = await dataAdapter.getWorkflows()
      const workflowData = workflows.find((w) => w.id === itemData.workflowId)

      setItem(itemData)
      setWorkflow(workflowData || null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Item not found",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdvance = async (toStageId: string) => {
    if (!item) return

    try {
      const updatedItem = await dataAdapter.advanceItem({
        itemId: item.id,
        toStageId,
      })

      setItem(updatedItem)
      toast({
        title: "Success",
        description: "Item advanced successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to advance item",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!item || !workflow) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Item not found</div>
      </div>
    )
  }

  const currentStage = workflow.stages.find((s) => s.id === item.currentStageId)
  const nextStages = currentStage ? workflow.stages.filter((s) => currentStage.allowedNextStageIds.includes(s.id)) : []

  const getStageByIdOrName = (id: string): Stage | undefined => {
    return workflow.stages.find((s) => s.id === id || s.name === id)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{item.sku}</CardTitle>
                <CardDescription>Item ID: {item.id}</CardDescription>
              </div>
              <QRDisplay value={item.qrData} size={100} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Workflow</p>
                <Badge variant="outline">{workflow.name}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Stage</p>
                {currentStage && <StageBadge stage={currentStage} />}
              </div>
            </div>

            {nextStages.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Available Actions</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Advance Item</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Advance Item</DialogTitle>
                      <DialogDescription>Select the next stage for this item</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      {nextStages.map((stage) => (
                        <Button
                          key={stage.id}
                          onClick={() => handleAdvance(stage.id)}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Move to {stage.name}
                          {stage.requiredScan && " (Scan Required)"}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production History</CardTitle>
            <CardDescription>Timeline of stage transitions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {item.history.map((entry, index) => {
                const fromStage = entry.from ? getStageByIdOrName(entry.from) : null
                const toStage = getStageByIdOrName(entry.to)

                return (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded">
                    <div className="flex items-center gap-2 flex-1">
                      {fromStage ? (
                        <>
                          <StageBadge stage={fromStage} />
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </>
                      ) : (
                        <span className="text-sm text-gray-600">Started at</span>
                      )}
                      {toStage && <StageBadge stage={toStage} />}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(entry.at).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {entry.user}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
