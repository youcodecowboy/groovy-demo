"use client"

import React, { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { use } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// Mission Control Components
import {
  ItemHeader,
  EventFeed,
  NotesPanel,
  LocationHistory,
  QRCard,
  MetaTable,
  OrderSnapshot,
  StageTimeline,
  WorkflowMiniMap,
  CostsPanel,
  MessagingThread,
  AttachmentsPanel,
  AuditLog
} from "@/components/items"

// Mock data generators
const generateMockEvents = (itemId: string) => [
  {
    id: "1",
    type: 'scan' as const,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    summary: "Item scanned at Quality Check station",
    details: "QR code scanned successfully. All quality parameters within acceptable range.",
    user: "qc@demo",
    stage: "Quality Check"
  },
  {
    id: "2",
    type: 'transition' as const,
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    summary: "Advanced from Cutting to Assembly",
    details: "Item moved to assembly stage after successful cutting operations.",
    user: "floor@demo",
    stage: "Assembly"
  },
  {
    id: "3",
    type: 'note' as const,
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    summary: "Special handling required",
    details: "Customer requested extra care during assembly. Use premium materials.",
    user: "admin@demo",
    stage: "Assembly"
  }
]

const generateMockNotes = () => [
  {
    id: "1",
    text: "Item needs special attention during quality check",
    author: "floor@demo",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    type: 'alert' as const
  },
  {
    id: "2",
    text: "Fabric looks good, ready for next stage",
    author: "admin@demo",
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    type: 'note' as const
  }
]

const generateMockLocationHistory = () => [
  {
    id: "1",
    name: "Cutting Station A",
    type: 'production' as const,
    timestamp: Date.now() - 1000 * 60 * 60 * 6,
    duration: 1000 * 60 * 60 * 2 // 2 hours
  },
  {
    id: "2",
    name: "Assembly Line 3",
    type: 'production' as const,
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    duration: 1000 * 60 * 60 * 1.5 // 1.5 hours
  },
  {
    id: "3",
    name: "Quality Check Station",
    type: 'production' as const,
    timestamp: Date.now() - 1000 * 60 * 30,
    duration: 1000 * 60 * 30 // 30 minutes
  }
]

const generateMockMessages = () => [
  {
    id: "1",
    text: "Item is ready for final inspection",
    author: "qc@demo",
    timestamp: Date.now() - 1000 * 60 * 30,
    type: 'user' as const,
    recipients: ['admin@demo']
  },
  {
    id: "2",
    text: "System: Item moved to Quality Check stage",
    author: "system@demo",
    timestamp: Date.now() - 1000 * 60 * 60,
    type: 'system' as const
  }
]

const generateMockAttachments = () => [
  {
    id: "1",
    name: "quality_check_photo.jpg",
    type: 'image' as const,
    size: 1024 * 1024 * 2.5, // 2.5MB
    uploadedBy: "qc@demo",
    uploadedAt: Date.now() - 1000 * 60 * 30
  },
  {
    id: "2",
    name: "assembly_instructions.pdf",
    type: 'pdf' as const,
    size: 1024 * 512, // 512KB
    uploadedBy: "admin@demo",
    uploadedAt: Date.now() - 1000 * 60 * 60 * 2
  }
]

const generateMockAuditEntries = (itemId: string) => [
  {
    id: "1",
    timestamp: Date.now() - 1000 * 60 * 30,
    user: "qc@demo",
    action: "Quality check completed",
    type: 'stage' as const,
    details: "Item passed all quality parameters",
    metadata: { stage: "Quality Check", result: "Pass" }
  },
  {
    id: "2",
    timestamp: Date.now() - 1000 * 60 * 60,
    user: "admin@demo",
    action: "Labor rate updated",
    type: 'costing' as const,
    details: "Labor rate changed from $25/hour to $28/hour",
    metadata: { oldRate: 25, newRate: 28, reason: "Market adjustment" }
  },
  {
    id: "3",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    user: "floor@demo",
    action: "Item advanced to next stage",
    type: 'stage' as const,
    details: "Moved from Assembly to Quality Check",
    metadata: { fromStage: "Assembly", toStage: "Quality Check" }
  }
]

const generateMockOrder = () => ({
  id: "order-123",
  code: "PO-2024-001",
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
  totalItems: 50,
  completedItems: 35,
  status: 'in_progress' as const,
  customer: "Acme Corp",
  priority: 'high' as const
})

const generateMockCostData = () => ({
  laborRate: 28,
  quotedLabor: 1400,
  activeTime: 1000 * 60 * 60 * 4.5, // 4.5 hours
  costToDate: 1260, // 4.5 * 28
  margin: 140, // 1400 - 1260
  currency: "USD",
  source: 'order' as const
})

export default function ItemDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { itemId } = use(params)
  
  // Queries
  const item = useQuery(api.items.getById, { id: itemId as any })
  const workflow = useQuery(api.workflows.getById, item?.workflowId ? { id: item.workflowId } : "skip")
  const itemHistory = useQuery(api.items.getItemHistory, item?._id ? { itemId: item._id } : "skip")

  // State
  const [activeTab, setActiveTab] = useState("overview")
  const [notes, setNotes] = useState(generateMockNotes())
  const [messages, setMessages] = useState(generateMockMessages())
  const [attachments, setAttachments] = useState(generateMockAttachments())

  // Mock data
  const events = generateMockEvents(itemId)
  const locationHistory = generateMockLocationHistory()
  const currentLocation = locationHistory[locationHistory.length - 1]
  const order = generateMockOrder()
  const costData = generateMockCostData()
  const auditEntries = generateMockAuditEntries(itemId)

  // Stage history for timeline
  const stageHistory = workflow?.stages.map((stage, index) => ({
    stage,
    enteredAt: Date.now() - (workflow.stages.length - index) * 1000 * 60 * 60,
    exitedAt: index < workflow.stages.length - 1 ? Date.now() - (workflow.stages.length - index - 1) * 1000 * 60 * 60 : undefined,
    duration: index < workflow.stages.length - 1 ? 1000 * 60 * 60 : undefined,
    isCurrent: stage.id === item?.currentStageId,
    isCompleted: index < workflow.stages.findIndex(s => s.id === item?.currentStageId)
  })) || []

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 text-gray-400 mx-auto mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Item not found</h3>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push("/app/items")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to Items
          </button>
        </div>
      </div>
    )
  }

  const currentStage = workflow?.stages.find(stage => stage.id === item.currentStageId)

  // Event handlers
  const handleAddNote = async (text: string) => {
    const newNote = {
      id: Date.now().toString(),
      text,
      author: "admin@demo",
      timestamp: Date.now(),
      type: 'note' as const
    }
    setNotes(prev => [newNote, ...prev])
  }

  const handleSendMessage = async (text: string, recipients: string[]) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      author: "admin@demo",
      timestamp: Date.now(),
      type: 'user' as const,
      recipients
    }
    setMessages(prev => [newMessage, ...prev])
  }

  const handleUploadFile = async (file: File) => {
    const newAttachment = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
      size: file.size,
      uploadedBy: "admin@demo",
      uploadedAt: Date.now()
    }
    setAttachments(prev => [newAttachment, ...prev])
  }

  const handleDeleteFile = async (fileId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== fileId))
  }

  const handleAdvanceItem = async (itemId: string, toStageId: string, reason: string) => {
    // Mock implementation - in real app this would call the API
    toast({
      title: "Item advanced",
      description: `Item advanced to next stage. Reason: ${reason}`,
    })
  }

  const handleUpdateMetadata = async (key: string, value: string) => {
    // Mock implementation - in real app this would call the API
    toast({
      title: "Metadata updated",
      description: `${key} updated to ${value}`,
    })
  }

  const handleUpdateLaborRate = async (rate: number, reason: string) => {
    // Mock implementation - in real app this would call the API
    toast({
      title: "Labor rate updated",
      description: `Rate updated to $${rate}/hour. Reason: ${reason}`,
    })
  }

  const handleUpdateQuotedLabor = async (quoted: number, reason: string) => {
    // Mock implementation - in real app this would call the API
    toast({
      title: "Quoted labor updated",
      description: `Quoted labor updated to $${quoted}. Reason: ${reason}`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      {item && workflow && (
        <ItemHeader
          item={item}
          workflow={workflow}
          currentStage={currentStage}
          onAdvanceItem={handleAdvanceItem}
          onReassignTeam={() => {}}
          onFlagIssue={() => {}}
        />
      )}

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Operational */}
              <div className="lg:col-span-2 space-y-6">
                <EventFeed events={events} />
                <NotesPanel 
                  notes={notes} 
                  onAddNote={handleAddNote}
                  currentUser="admin@demo"
                />
                <LocationHistory 
                  currentLocation={currentLocation}
                  locationHistory={locationHistory}
                />
              </div>

              {/* Right Column - Context */}
              <div className="space-y-6">
                <QRCard 
                  qrData={item.qrCode || `item:${item.itemId}`}
                  itemId={item.itemId}
                />
                <MetaTable 
                  metadata={item.metadata || {}}
                  onUpdateMetadata={handleUpdateMetadata}
                />
                <OrderSnapshot 
                  order={order}
                  onOpenOrder={(orderId) => {
                    toast({
                      title: "Order opened",
                      description: `Opening order ${orderId}`,
                    })
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <StageTimeline
              stages={workflow?.stages || []}
              currentStageId={item.currentStageId}
              stageHistory={stageHistory}
              startTime={item.startedAt}
            />
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-6">
            <WorkflowMiniMap
              workflow={workflow!}
              currentStageId={item.currentStageId}
              onAdvanceItem={handleAdvanceItem}
              itemId={item._id}
            />
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-6">
            <CostsPanel
              costData={costData}
              onUpdateLaborRate={handleUpdateLaborRate}
              onUpdateQuotedLabor={handleUpdateQuotedLabor}
            />
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-6">
            <MessagingThread
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser="admin@demo"
              itemId={item._id}
            />
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-6">
            <AttachmentsPanel
              attachments={attachments}
              onUploadFile={handleUploadFile}
              onDeleteFile={handleDeleteFile}
              onPreviewFile={(fileId) => {
                toast({
                  title: "File preview",
                  description: `Opening preview for file ${fileId}`,
                })
              }}
            />
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-6">
            <AuditLog entries={auditEntries} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
