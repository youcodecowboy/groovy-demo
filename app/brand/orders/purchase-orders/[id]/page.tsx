'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Factory,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Users,
  Truck,
  CreditCard,
  MessageSquare,
  FileText,
  Download,
  Upload,
  Edit,
  Save,
  QrCode,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Settings,
  Image,
  Palette,
  Tag,
  Hash,
  BarChart3,
  Receipt,
  FileCheck,
  Send,
  Plus
} from "lucide-react"
import Link from "next/link"

// Mock detailed order data
const mockOrderDetails = {
  id: "PO-2024-001",
  factory: "Factory A - Textile Production",
  factoryId: "factory-a",
  location: "Dhaka, Bangladesh",
  status: "in_production",
  items: 50,
  value: 12500,
  currency: "USD",
  dueDate: "2024-12-15",
  progress: 65,
  stage: "Cutting & Sewing",
  priority: "high",
  scheduleStatus: "on_track",
  createdAt: "2024-11-01",
  acceptedAt: "2024-11-05",
  paymentTerms: "Net 30",
  shippingMethod: "Air Freight",
  totalItems: 50,
  itemsCompleted: 32,
  itemsInStage: 18,
  timeInStage: "3 days",
  defects: 2,
  reworks: 1,
  defectRate: 1.2,
  onTimePercentage: 95,
  
  // Financial details
  depositPaid: 3750,
  depositDate: "2024-11-05",
  remainingAmount: 8750,
  dueDate: "2024-12-05",
  paymentMethod: "Wire Transfer",
  
  // SKUs and variants
  skus: [
    {
      id: "SKU-001",
      name: "Premium Cotton T-Shirt",
      variant: "Blue, Large",
      quantity: 20,
      completed: 15,
      inStage: 5,
      qrCode: "QR-SKU-001-001",
      defects: 1,
      reworks: 0,
      stage: "Cutting & Sewing",
      timeInStage: "2 days"
    },
    {
      id: "SKU-002", 
      name: "Premium Cotton T-Shirt",
      variant: "Red, Medium",
      quantity: 15,
      completed: 10,
      inStage: 5,
      qrCode: "QR-SKU-002-001",
      defects: 1,
      reworks: 1,
      stage: "Cutting & Sewing",
      timeInStage: "3 days"
    },
    {
      id: "SKU-003",
      name: "Premium Cotton T-Shirt", 
      variant: "Black, Small",
      quantity: 15,
      completed: 7,
      inStage: 8,
      qrCode: "QR-SKU-003-001",
      defects: 0,
      reworks: 0,
      stage: "Fabric Preparation",
      timeInStage: "1 day"
    }
  ],
  
  // Production stages
  stages: [
    { name: "Fabric Preparation", completed: 50, inProgress: 30, pending: 20, timeInStage: "2 days" },
    { name: "Cutting", completed: 40, inProgress: 25, pending: 35, timeInStage: "1 day" },
    { name: "Cutting & Sewing", completed: 65, inProgress: 18, pending: 17, timeInStage: "3 days" },
    { name: "Quality Check", completed: 0, inProgress: 0, pending: 50, timeInStage: "0 days" },
    { name: "Packaging", completed: 0, inProgress: 0, pending: 50, timeInStage: "0 days" }
  ],
  
  // DPP (Digital Product Passport) data
  dpp: {
    enabled: true,
    brandLogo: "/brand-logo.png",
    consumerFields: ["material", "origin", "care_instructions", "sustainability"],
    brandFields: ["factory", "production_date", "quality_score", "batch_number"],
    content: {
      material: "100% Organic Cotton",
      origin: "Bangladesh",
      care_instructions: "Machine wash cold, tumble dry low",
      sustainability: "GOTS Certified, Carbon Neutral",
      factory: "Factory A - Textile Production",
      production_date: "2024-12-15",
      quality_score: "95/100",
      batch_number: "BATCH-2024-001"
    }
  },
  
  // Messaging history
  messages: [
    {
      id: 1,
      sender: "Factory A",
      senderType: "factory",
      message: "Fabric has been received and quality checked. Starting cutting process today.",
      timestamp: "2024-12-08T10:30:00Z",
      attachments: []
    },
    {
      id: 2,
      sender: "Brand Team",
      senderType: "brand", 
      message: "Great! Please ensure the blue variant meets our color specifications exactly.",
      timestamp: "2024-12-08T11:15:00Z",
      attachments: []
    },
    {
      id: 3,
      sender: "Factory A",
      senderType: "factory",
      message: "Understood. We've adjusted the dye process for the blue variant. Sample attached.",
      timestamp: "2024-12-08T14:20:00Z",
      attachments: ["color-sample.jpg"]
    }
  ],
  
  // Financial history
  financialHistory: [
    {
      id: 1,
      type: "deposit",
      amount: 3750,
      date: "2024-11-05",
      status: "completed",
      reference: "WIRE-001",
      description: "Initial deposit (30%)"
    },
    {
      id: 2,
      type: "payment",
      amount: 4375,
      date: "2024-12-05",
      status: "pending",
      reference: "WIRE-002", 
      description: "Progress payment (35%)"
    },
    {
      id: 3,
      type: "payment",
      amount: 4375,
      date: "2024-12-15",
      status: "pending",
      reference: "WIRE-003",
      description: "Final payment (35%)"
    }
  ]
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [newMessage, setNewMessage] = useState("")
  const [editingDpp, setEditingDpp] = useState(false)
  const [dppContent, setDppContent] = useState(mockOrderDetails.dpp.content)

  const order = mockOrderDetails // In real app, fetch by params.id

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_production': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600 bg-green-50'
      case 'on_track': return 'text-blue-600 bg-blue-50'
      case 'behind': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getFinancialStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'pending': return 'text-orange-600'
      case 'overdue': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real app, send message to backend
      console.log('Sending message:', newMessage)
      setNewMessage("")
    }
  }

  const handleSaveDpp = () => {
    // In real app, save DPP changes
    console.log('Saving DPP:', dppContent)
    setEditingDpp(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/brand/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.id}</h1>
              <p className="text-gray-600">{order.factory}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Factory
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Manage Order
            </Button>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{order.progress}%</p>
                </div>
                <Progress value={order.progress} className="w-16 h-16" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="text-3xl font-bold text-gray-900">{order.itemsCompleted}/{order.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="text-3xl font-bold text-gray-900">${order.value.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="text-3xl font-bold text-gray-900">{new Date(order.dueDate).toLocaleDateString()}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skus">SKUs & Items</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="dpp">Digital Passport</TabsTrigger>
            <TabsTrigger value="messaging">Messages</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Schedule</p>
                      <Badge className={getScheduleStatusColor(order.scheduleStatus)}>
                        {order.scheduleStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Factory</p>
                      <p className="font-medium">{order.factory}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{order.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accepted</p>
                      <p className="font-medium">{new Date(order.acceptedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Terms</p>
                      <p className="font-medium">{order.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Shipping</p>
                      <p className="font-medium">{order.shippingMethod}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{order.defectRate}%</div>
                      <p className="text-sm text-gray-600">Defect Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{order.onTimePercentage}%</div>
                      <p className="text-sm text-gray-600">On-Time Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{order.defects}</div>
                      <p className="text-sm text-gray-600">Total Defects</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{order.reworks}</div>
                      <p className="text-sm text-gray-600">Reworks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SKUs & Items Tab */}
          <TabsContent value="skus" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SKU Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.skus.map((sku) => (
                    <div key={sku.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{sku.name}</h3>
                          <p className="text-sm text-gray-600">{sku.variant}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <QrCode className="w-4 h-4" />
                              {sku.qrCode}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {sku.completed}/{sku.quantity} completed
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{sku.quantity} units</div>
                          <div className="text-sm text-gray-600">${(order.value / order.totalItems * sku.quantity).toFixed(0)} value</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <Progress value={(sku.completed / sku.quantity) * 100} className="mt-1" />
                          <p className="text-xs text-gray-500 mt-1">{Math.round((sku.completed / sku.quantity) * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Current Stage</p>
                          <p className="font-medium">{sku.stage}</p>
                          <p className="text-xs text-gray-500">{sku.timeInStage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Defects</p>
                          <p className={`font-medium ${sku.defects > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {sku.defects}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Reworks</p>
                          <p className={`font-medium ${sku.reworks > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {sku.reworks}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Production Tab */}
          <TabsContent value="production" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Production Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.stages.map((stage, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">
                            {stage.completed} completed
                          </Badge>
                          <Badge variant="outline" className="text-blue-600">
                            {stage.inProgress} in progress
                          </Badge>
                          <Badge variant="outline" className="text-gray-600">
                            {stage.pending} pending
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(((stage.completed + stage.inProgress) / order.totalItems) * 100)}%</span>
                        </div>
                        <Progress value={((stage.completed + stage.inProgress) / order.totalItems) * 100} />
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Time in stage: {stage.timeInStage}</span>
                          <span>Total items: {order.totalItems}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Digital Product Passport Tab */}
          <TabsContent value="dpp" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Digital Product Passport</CardTitle>
                  <div className="flex items-center gap-2">
                    {editingDpp ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setEditingDpp(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveDpp}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setEditingDpp(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Brand Configuration */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Brand Configuration</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Brand Logo</label>
                        <div className="mt-1 flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Image className="w-8 h-8 text-gray-400" />
                          </div>
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Consumer-Facing Fields</label>
                        <div className="mt-2 space-y-2">
                          {order.dpp.consumerFields.map((field) => (
                            <div key={field} className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked className="rounded" />
                              <span className="text-sm">{field.replace('_', ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Brand-Only Fields</label>
                        <div className="mt-2 space-y-2">
                          {order.dpp.brandFields.map((field) => (
                            <div key={field} className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked className="rounded" />
                              <span className="text-sm">{field.replace('_', ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DPP Content */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Passport Content</h3>
                    
                    <div className="space-y-3">
                      {Object.entries(dppContent).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-sm font-medium text-gray-700">
                            {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                          {editingDpp ? (
                            <Input
                              value={value}
                              onChange={(e) => setDppContent({...dppContent, [key]: e.target.value})}
                              className="mt-1"
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Message History */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {order.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.senderType === 'brand' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-lg ${
                          message.senderType === 'brand' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.sender}</span>
                            <span className="text-xs opacity-75">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                          {message.attachments.length > 0 && (
                            <div className="mt-2">
                              {message.attachments.map((attachment) => (
                                <div key={attachment} className="flex items-center gap-2 text-xs">
                                  <FileText className="w-3 h-3" />
                                  <span>{attachment}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* New Message */}
                  <div className="border-t pt-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        rows={3}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Order Value</p>
                      <p className="text-2xl font-bold text-gray-900">${order.value.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deposit Paid</p>
                      <p className="text-2xl font-bold text-green-600">${order.depositPaid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining Amount</p>
                      <p className="text-2xl font-bold text-orange-600">${order.remainingAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.financialHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-gray-600">{payment.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getFinancialStatusColor(payment.status)}`}>
                            ${payment.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className={
                            payment.status === 'completed' ? 'border-green-200 text-green-600' :
                            payment.status === 'pending' ? 'border-orange-200 text-orange-600' :
                            'border-red-200 text-red-600'
                          }>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}