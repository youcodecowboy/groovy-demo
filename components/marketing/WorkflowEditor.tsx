"use client"

import { useState, useEffect } from "react"
import { motion, Reorder, AnimatePresence } from "framer-motion"
import { Workflow, Settings, QrCode, Download, GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface WorkflowStage {
  id: string
  name: string
  requiresScan: boolean
}

interface LabelField {
  id: string
  name: string
  enabled: boolean
}

const defaultStages: WorkflowStage[] = [
  { id: "cutting", name: "Cutting", requiresScan: true },
  { id: "sewing", name: "Sewing", requiresScan: true },
  { id: "washing", name: "Washing", requiresScan: false },
  { id: "qc", name: "QC", requiresScan: true },
  { id: "pack", name: "Pack", requiresScan: true },
]

const labelFields: LabelField[] = [
  { id: "sku", name: "SKU", enabled: true },
  { id: "size", name: "Size", enabled: true },
  { id: "batch", name: "Batch", enabled: false },
  { id: "qr", name: "QR", enabled: true },
]

export function WorkflowEditor() {
  const [stages, setStages] = useState<WorkflowStage[]>(defaultStages)
  const [selectedFields, setSelectedFields] = useState<LabelField[]>(labelFields)
  const [qcFailThreshold, setQcFailThreshold] = useState(2)
  const [previewPayload, setPreviewPayload] = useState({
    order: "PO-123",
    item: "A1B2C3",
    stage: "QC",
  })

  const updatePreview = () => {
    const enabledFields = selectedFields.filter(f => f.enabled)
    const payload: any = { order: "PO-123", item: "A1B2C3", stage: "QC" }
    
    enabledFields.forEach(field => {
      if (field.id === "sku") payload.sku = "SKU-001"
      if (field.id === "size") payload.size = "M"
      if (field.id === "batch") payload.batch = "BATCH-2024-001"
      if (field.id === "qr") payload.qr = "QR-123456"
    })
    
    setPreviewPayload(payload)
  }

  useEffect(() => {
    updatePreview()
  }, [selectedFields])

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, enabled: !field.enabled } : field
      )
    )
  }

  const toggleScanRequirement = (stageId: string) => {
    setStages(prev => 
      prev.map(stage => 
        stage.id === stageId ? { ...stage, requiresScan: !stage.requiresScan } : stage
      )
    )
  }

  const generateQR = () => {
    // In a real implementation, this would generate an actual QR code
    console.log("Generating QR with payload:", previewPayload)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Workflow Stages */}
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Stages
          </CardTitle>
          <p className="text-sm text-zinc-600">Drag to reorder stages</p>
        </CardHeader>
        <CardContent>
          <Reorder.Group axis="y" values={stages} onReorder={setStages} className="space-y-3">
            {stages.map((stage) => (
              <Reorder.Item
                key={stage.id}
                value={stage}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-white cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-zinc-400" />
                <span className="flex-1 font-medium">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`scan-${stage.id}`} className="text-sm">Require Scan</Label>
                  <Switch
                    id={`scan-${stage.id}`}
                    checked={stage.requiresScan}
                    onCheckedChange={() => toggleScanRequirement(stage.id)}
                  />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </CardContent>
      </Card>

      {/* Rules & Labels */}
      <div className="space-y-6">
        {/* Rules Builder */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Rules Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50">
              <span className="text-sm">Block if QC fail rate > {qcFailThreshold}%</span>
              <input
                type="range"
                min="1"
                max="10"
                value={qcFailThreshold}
                onChange={(e) => setQcFailThreshold(Number(e.target.value))}
                className="w-20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Require Scan between stages</Badge>
              <Badge variant="secondary">Block if QC fail > {qcFailThreshold}%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Label Designer */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Label Designer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {selectedFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between">
                  <Label htmlFor={`field-${field.id}`} className="text-sm">{field.name}</Label>
                  <Switch
                    id={`field-${field.id}`}
                    checked={field.enabled}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                </div>
              ))}
            </div>
            
            {/* Live Preview */}
            <div className="p-4 rounded-lg bg-zinc-50 border">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="text-xs space-y-1">
                {Object.entries(previewPayload).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-zinc-600">{key}:</span>
                    <span className="font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button onClick={generateQR} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview Chip */}
      <div className="lg:col-span-2">
        <motion.div
          layout
          className="inline-flex items-center gap-2 p-3 rounded-lg bg-sky-50 border border-sky-200"
        >
          <span className="text-sm font-medium text-sky-900">Your workflow is now:</span>
          <div className="flex items-center gap-1">
            {stages.map((stage, idx) => (
              <AnimatePresence key={stage.id}>
                <motion.span
                  key={stage.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-sm text-sky-700"
                >
                  {stage.name}
                  {idx < stages.length - 1 && (
                    <span className="mx-1 text-sky-400">→</span>
                  )}
                </motion.span>
              </AnimatePresence>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default WorkflowEditor
