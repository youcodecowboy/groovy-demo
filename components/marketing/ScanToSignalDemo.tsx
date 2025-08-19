"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, QrCode, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Stage {
  id: string
  name: string
  completed: boolean
  current: boolean
}

const defaultStages: Stage[] = [
  { id: "cutting", name: "Cutting", completed: true, current: false },
  { id: "sewing", name: "Sewing", completed: true, current: false },
  { id: "washing", name: "Washing", completed: false, current: true },
  { id: "qc", name: "QC", completed: false, current: false },
  { id: "pack", name: "Pack", completed: false, current: false },
]

export function ScanToSignalDemo() {
  const [stages, setStages] = useState<Stage[]>(defaultStages)
  const [isScanning, setIsScanning] = useState(false)
  const [defectFlag, setDefectFlag] = useState(false)
  const [lateFlag, setLateFlag] = useState(false)
  const [outOfSequence, setOutOfSequence] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(2) // Washing stage
  const { toast } = useToast()

  const handleScan = async () => {
    setIsScanning(true)
    
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Determine next stage
    let nextIndex = currentStageIndex + 1
    if (nextIndex >= stages.length) {
      nextIndex = 0 // Reset for demo
    }
    
    // Update stages
    const newStages = stages.map((stage, idx) => ({
      ...stage,
      completed: idx < nextIndex,
      current: idx === nextIndex,
    }))
    
    setStages(newStages)
    setCurrentStageIndex(nextIndex)
    
    // Show appropriate toast based on flags
    if (defectFlag && stages[nextIndex]?.name === "QC") {
      toast({
        title: "Issue Raised",
        description: "QC defect detected - item flagged for review",
        variant: "destructive",
      })
    } else if (lateFlag) {
      toast({
        title: "Behind Schedule",
        description: "Item is running behind SLA timeline",
        variant: "default",
      })
    } else if (outOfSequence) {
      toast({
        title: "Out of Sequence",
        description: "Item scanned out of expected order",
        variant: "default",
      })
    } else {
      toast({
        title: "Brand Notified",
        description: `Item moved to ${stages[nextIndex]?.name}`,
        variant: "default",
      })
    }
    
    setIsScanning(false)
  }

  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Factory Device */}
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Factory Device
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Frame */}
          <div className="relative aspect-video bg-zinc-100 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center">
            <div className="text-center">
              <QrCode className="h-16 w-16 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">Sample QR Code</p>
              <p className="text-xs text-zinc-500">PO-123 • A1B2C3 • Washing</p>
            </div>
          </div>
          
          {/* Scan Button */}
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full h-12 text-lg font-medium"
          >
            {isScanning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Camera className="h-5 w-5" />
              </motion.div>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                Scan Item
              </>
            )}
          </Button>
          
          {/* Demo Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="defect" className="text-sm">Defect Flag</Label>
              <Switch
                id="defect"
                checked={defectFlag}
                onCheckedChange={setDefectFlag}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="late" className="text-sm">Late Stage</Label>
              <Switch
                id="late"
                checked={lateFlag}
                onCheckedChange={setLateFlag}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sequence" className="text-sm">Out of Sequence</Label>
              <Switch
                id="sequence"
                checked={outOfSequence}
                onCheckedChange={setOutOfSequence}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Dashboard */}
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Brand Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Card */}
          <div className="p-4 rounded-lg bg-zinc-50 border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Order PO-123</h4>
              <Badge variant={lateFlag ? "destructive" : "secondary"}>
                {lateFlag ? "Behind" : "On Track"}
              </Badge>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-zinc-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2">
                <motion.div
                  className="bg-sky-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            {/* Timeline */}
            <div className="space-y-2">
              {stages.map((stage, idx) => (
                <div key={stage.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {stage.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : stage.current ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Clock className="h-4 w-4 text-sky-500" />
                      </motion.div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-zinc-300" />
                    )}
                  </div>
                  <span className={`text-sm ${stage.completed ? 'text-green-600' : stage.current ? 'text-sky-600 font-medium' : 'text-zinc-500'}`}>
                    {stage.name}
                  </span>
                  {stage.current && (
                    <Badge variant="outline" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="space-y-2">
            {defectFlag && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200"
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">QC Issue Detected</span>
              </motion.div>
            )}
            
            {lateFlag && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200"
              >
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-700">Behind SLA Timeline</span>
              </motion.div>
            )}
            
            {outOfSequence && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200"
              >
                <XCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-700">Out of Sequence Scan</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScanToSignalDemo
