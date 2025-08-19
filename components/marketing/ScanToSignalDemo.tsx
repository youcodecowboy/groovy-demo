"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, QrCode, AlertCircle, Clock, CheckCircle, XCircle, ScanLine, Move, MessageSquare, Home, Package, TrendingUp, Users, Factory, Zap, Bell, Activity, ArrowRight, Flag, AlertTriangle, CheckSquare, BarChart3, Globe, Truck, DollarSign, Target, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Stage {
  id: string
  name: string
  completed: boolean
  current: boolean
  color: string
}

interface ActivityLog {
  id: string
  type: 'scan' | 'defect' | 'stage_complete' | 'eta_update' | 'quality_check'
  message: string
  timestamp: Date
  itemId?: string
  stage?: string
  factory?: string
}

const defaultStages: Stage[] = [
  { id: "cutting", name: "Cutting", completed: true, current: false, color: "#ef4444" },
  { id: "sewing", name: "Sewing", completed: true, current: false, color: "#f97316" },
  { id: "washing", name: "Washing", completed: false, current: true, color: "#3b82f6" },
  { id: "qc", name: "QC", completed: false, current: false, color: "#8b5cf6" },
  { id: "pack", name: "Pack", completed: false, current: false, color: "#10b981" },
]

const mockFactories = ["Factory A", "Factory B", "Factory C", "Factory D"]

export function ScanToSignalDemo() {
  const [stages, setStages] = useState<Stage[]>(defaultStages)
  const [isScanning, setIsScanning] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(2) // Washing stage
  const [eta, setEta] = useState(12) // days
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")
  const { toast } = useToast()

  // Generate real QR code on mount
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const QRCode = await import('qrcode')
        const dataUrl = await QRCode.toDataURL('PO-123-A1B2C3-WASHING', {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })
        setQrCodeDataUrl(dataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }
    generateQRCode()
  }, [])

  // Simulate background activity
  useEffect(() => {
    const interval = setInterval(() => {
      const activities: ActivityLog[] = [
        {
          id: Date.now().toString(),
          type: 'scan',
          message: `Item ${Math.floor(Math.random() * 1000)} scanned at ${mockFactories[Math.floor(Math.random() * mockFactories.length)]}`,
          timestamp: new Date(),
          itemId: `ITEM-${Math.floor(Math.random() * 1000)}`,
          factory: mockFactories[Math.floor(Math.random() * mockFactories.length)]
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'stage_complete',
          message: `Cutting stage completed for batch ${Math.floor(Math.random() * 100)}`,
          timestamp: new Date(),
          stage: 'Cutting',
          factory: mockFactories[Math.floor(Math.random() * mockFactories.length)]
        },
        {
          id: (Date.now() + 2).toString(),
          type: 'quality_check',
          message: `QC passed for ${Math.floor(Math.random() * 50)} items`,
          timestamp: new Date(),
          factory: mockFactories[Math.floor(Math.random() * mockFactories.length)]
        }
      ]
      
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      setActivityLog(prev => [randomActivity, ...prev.slice(0, 9)]) // Keep last 10 activities
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleScan = async () => {
    console.log('Scan button clicked') // Debug log
    
    if (isScanning) {
      console.log('Already scanning, returning') // Debug log
      return
    }
    
    setIsScanning(true)
    console.log('Set scanning to true') // Debug log
    
    try {
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
      
      // Improve ETA when scanning
      setEta(prev => Math.max(prev - 1, 2))
      
      // Add scan activity
      const scanActivity: ActivityLog = {
        id: Date.now().toString(),
        type: 'scan',
        message: `Item PO-123-A1B2C3 scanned at Washing stage`,
        timestamp: new Date(),
        itemId: 'PO-123-A1B2C3',
        stage: 'Washing'
      }
      setActivityLog(prev => [scanActivity, ...prev.slice(0, 9)])
      
      toast({
        title: "✅ Item Scanned",
        description: `Item moved to ${stages[nextIndex]?.name} stage`,
      })
      
      console.log('Scan completed successfully') // Debug log
    } catch (error) {
      console.error('Error during scan:', error) // Debug log
      toast({
        title: "Error",
        description: "Failed to scan item",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
      console.log('Set scanning to false') // Debug log
    }
  }

  const handleQuickAction = (action: string) => {
    const actionActivity: ActivityLog = {
      id: Date.now().toString(),
      type: action === 'defect' ? 'defect' : 'quality_check',
      message: `Item flagged: ${action === 'defect' ? 'Defect detected' : 'Quality issue raised'}`,
      timestamp: new Date(),
      itemId: 'PO-123-A1B2C3'
    }
    setActivityLog(prev => [actionActivity, ...prev.slice(0, 9)])
    
    toast({
      title: action === 'defect' ? "⚠️ Defect Flagged" : "🚨 Issue Raised",
      description: `Item has been flagged for review`,
      variant: "destructive",
    })
  }

  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'scan': return <ScanLine className="h-4 w-4 text-blue-500" />
      case 'defect': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'stage_complete': return <CheckSquare className="h-4 w-4 text-green-500" />
      case 'eta_update': return <TrendingUp className="h-4 w-4 text-orange-500" />
      case 'quality_check': return <CheckCircle className="h-4 w-4 text-purple-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
      {/* Factory Device - Mobile Style */}
      <div className="flex justify-center">
        <div className="w-80 h-[600px] bg-gray-900 rounded-3xl p-2 shadow-2xl">
          {/* Phone Frame */}
          <div className="w-full h-full bg-white rounded-2xl overflow-hidden flex flex-col">
            {/* Mobile Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                <span className="font-semibold">Factory Floor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* QR Code Display */}
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  {qrCodeDataUrl ? (
                    <>
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code" 
                        className="w-32 h-32 mx-auto mb-3"
                      />
                      <p className="text-sm font-mono text-gray-600">PO-123 • A1B2C3</p>
                      <p className="text-xs text-gray-500">Current: Washing Stage</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Loading QR Code...</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Scan Button with Glow Effect */}
              <div className="relative">
                <Button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 relative overflow-hidden"
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
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-blue-400 rounded-lg blur-xl opacity-50"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
              </div>
              
              {/* Quick Actions Menu */}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Quick Actions</span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full h-8">
                      <Flag className="h-4 w-4 mr-1" />
                      Flag Item
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleQuickAction('defect')}>
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                      Report Defect
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickAction('quality')}>
                      <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                      Quality Issue
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickAction('late')}>
                      <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                      Behind Schedule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="bg-gray-100 p-2 flex items-center justify-center">
              <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Dashboard - Computer Style */}
      <div className="min-h-screen bg-gray-50 rounded-xl p-8 border border-gray-200">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Brand Dashboard</h2>
            <p className="text-gray-600">Real-time visibility into your global manufacturing network</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Live Data
            </Badge>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-xs text-gray-500 mt-1">In production</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ETA</p>
                  <p className="text-2xl font-bold text-gray-900">{eta} days</p>
                  <p className="text-xs text-gray-500 mt-1">Average delivery</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Factories</p>
                  <p className="text-2xl font-bold text-gray-900">4</p>
                  <p className="text-xs text-gray-500 mt-1">Active partners</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Factory className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On-Time</p>
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                  <p className="text-xs text-gray-500 mt-1">Delivery rate</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Production Timeline */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Production Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stages.map((stage, idx) => (
                  <div key={stage.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {stage.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : stage.current ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <div 
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                        </motion.div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <span className={`text-base flex-1 ${stage.completed ? 'text-green-600' : stage.current ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {stage.name}
                    </span>
                    {stage.current && (
                      <Badge variant="outline" className="text-sm">
                        Current
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Activity Feed */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Activity Feed
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {activityLog.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Factory Network Status */}
        <Card className="border-0 shadow-sm mt-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Factory Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">4 Active Factories</p>
                  <p className="text-xs text-gray-500">Global network</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">247 Items Today</p>
                  <p className="text-xs text-gray-500">Production volume</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">3 Alerts</p>
                  <p className="text-xs text-gray-500">Require attention</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">98% On-Time</p>
                  <p className="text-xs text-gray-500">Delivery rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ScanToSignalDemo
