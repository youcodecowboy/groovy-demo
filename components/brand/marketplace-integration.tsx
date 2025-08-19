'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Package, 
  MessageSquare, 
  Users, 
  FileText, 
  Send,
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface IntegrationActionsProps {
  partnerId: string
  partnerName: string
  partnerType: string
  partnerLocation: string
  onActionComplete: (action: string) => void
}

export function IntegrationActions({ 
  partnerId, 
  partnerName, 
  partnerType, 
  partnerLocation,
  onActionComplete 
}: IntegrationActionsProps) {
  const [showSampleDialog, setShowSampleDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [showCRMDialog, setShowCRMDialog] = useState(false)
  const [showPODialog, setShowPODialog] = useState(false)

  const handleRequestSample = () => {
    setShowSampleDialog(true)
  }

  const handleRequestIntroduction = () => {
    setShowMessageDialog(true)
  }

  const handleAddToCRM = () => {
    setShowCRMDialog(true)
  }

  const handleSubmitPO = () => {
    setShowPODialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={handleRequestSample}
        >
          <Package className="h-5 w-5" />
          <span className="text-sm">Request Sample</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={handleRequestIntroduction}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm">Request Intro</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={handleAddToCRM}
        >
          <Users className="h-5 w-5" />
          <span className="text-sm">Add to CRM</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={handleSubmitPO}
        >
          <FileText className="h-5 w-5" />
          <span className="text-sm">Submit PO</span>
        </Button>
      </div>

      {/* Sample Request Dialog */}
      <Dialog open={showSampleDialog} onOpenChange={setShowSampleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Sample from {partnerName}</DialogTitle>
            <DialogDescription>
              This will create a new sample request in SampleHub
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Product Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t-shirt">T-Shirt</SelectItem>
                    <SelectItem value="hoodie">Hoodie</SelectItem>
                    <SelectItem value="denim">Denim</SelectItem>
                    <SelectItem value="blazer">Blazer</SelectItem>
                    <SelectItem value="dress">Dress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input placeholder="e.g., 5 pieces" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Special Requirements</label>
              <Textarea placeholder="Any specific requirements or notes..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSampleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onActionComplete('sample')
                setShowSampleDialog(false)
              }}>
                <Package className="h-4 w-4 mr-2" />
                Create Sample Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Introduction to {partnerName}</DialogTitle>
            <DialogDescription>
              This will create a new message thread in Messages
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="Introduction request" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                placeholder="Hi, I'm interested in learning more about your services..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onActionComplete('message')
                setShowMessageDialog(false)
              }}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CRM Dialog */}
      <Dialog open={showCRMDialog} onOpenChange={setShowCRMDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add {partnerName} to CRM</DialogTitle>
            <DialogDescription>
              This will add the partner to your sourcing pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Pipeline Stage</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researching">Researching</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="samples_requested">Samples Requested</SelectItem>
                    <SelectItem value="samples_received">Samples Received</SelectItem>
                    <SelectItem value="approved">Approved for Orders</SelectItem>
                    <SelectItem value="active">Active Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea placeholder="Any notes about this partner..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCRMDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onActionComplete('crm')
                setShowCRMDialog(false)
              }}>
                <Users className="h-4 w-4 mr-2" />
                Add to CRM
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PO Dialog */}
      <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Purchase Order to {partnerName}</DialogTitle>
            <DialogDescription>
              This will create a new order in the Orders section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Product</label>
                <Input placeholder="Product name" />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input placeholder="e.g., 1000 units" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unit Price</label>
                <Input placeholder="e.g., $15.00" />
              </div>
              <div>
                <label className="text-sm font-medium">Delivery Date</label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Special Instructions</label>
              <Textarea placeholder="Any special instructions..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPODialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onActionComplete('po')
                setShowPODialog(false)
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Quick Actions Component for Partner Cards
export function QuickActions({ partnerId, partnerName }: { partnerId: string; partnerName: string }) {
  return (
    <div className="flex gap-2">
      <Link href={`/brand/samples?partner=${partnerId}`}>
        <Button variant="outline" size="sm">
          <Package className="h-4 w-4 mr-1" />
          Sample
        </Button>
      </Link>
      <Link href={`/brand/messaging?partner=${partnerId}`}>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-1" />
          Message
        </Button>
      </Link>
      <Link href={`/brand/crm?partner=${partnerId}`}>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-1" />
          CRM
        </Button>
      </Link>
      <Link href={`/brand/orders?partner=${partnerId}`}>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-1" />
          PO
        </Button>
      </Link>
    </div>
  )
}

// Integration Status Component
export function IntegrationStatus({ 
  hasSamples, 
  hasMessages, 
  hasCRM, 
  hasOrders 
}: { 
  hasSamples: boolean
  hasMessages: boolean
  hasCRM: boolean
  hasOrders: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Connected to:</span>
      {hasSamples && (
        <Badge variant="secondary" className="text-xs">
          <Package className="h-3 w-3 mr-1" />
          SampleHub
        </Badge>
      )}
      {hasMessages && (
        <Badge variant="secondary" className="text-xs">
          <MessageSquare className="h-3 w-3 mr-1" />
          Messages
        </Badge>
      )}
      {hasCRM && (
        <Badge variant="secondary" className="text-xs">
          <Users className="h-3 w-3 mr-1" />
          CRM
        </Badge>
      )}
      {hasOrders && (
        <Badge variant="secondary" className="text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Orders
        </Badge>
      )}
    </div>
  )
}