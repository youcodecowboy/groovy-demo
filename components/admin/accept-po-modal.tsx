"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AcceptPOModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseOrder: any
  onAccept: (poId: string, workflowId: string, startDate: number) => void
}

export function AcceptPOModal({ isOpen, onClose, purchaseOrder, onAccept }: AcceptPOModalProps) {
  const { toast } = useToast()
  const workflows = useQuery(api.workflows.getActive)
  
  const [selectedWorkflow, setSelectedWorkflow] = useState("")
  const [startDate, setStartDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAccept = async () => {
    if (!selectedWorkflow || !startDate) {
      toast({
        title: "Missing Information",
        description: "Please select a workflow and start date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const startTimestamp = new Date(startDate).getTime()
      await onAccept(purchaseOrder._id, selectedWorkflow, startTimestamp)
      
      toast({
        title: "Purchase Order Accepted",
        description: "Items have been created and scheduled for production",
      })
      
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept purchase order",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotalItems = () => {
    return purchaseOrder?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0
  }

  const calculateTotalValue = () => {
    return purchaseOrder?.totalValue || 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Accept Purchase Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* PO Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Purchase Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">PO Number:</span> {purchaseOrder?.poNumber}
              </div>
              <div>
                <span className="font-medium">Total Items:</span> {calculateTotalItems()}
              </div>
              <div>
                <span className="font-medium">Total Value:</span> ${calculateTotalValue().toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Requested Delivery:</span> {purchaseOrder?.requestedDeliveryDate ? new Date(purchaseOrder.requestedDeliveryDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {purchaseOrder?.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                  <span>{item.sku} - {item.description}</span>
                  <span className="font-medium">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Selection */}
          <div>
            <Label htmlFor="workflow">Production Workflow *</Label>
            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
              <SelectTrigger>
                <SelectValue placeholder="Select workflow for production" />
              </SelectTrigger>
              <SelectContent>
                {workflows?.map((workflow) => (
                  <SelectItem key={workflow._id} value={workflow._id}>
                    {workflow.name} ({workflow.stages.length} stages)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Choose the workflow that will be used for production
            </p>
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate">Production Start Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              When production should begin (for capacity planning)
            </p>
          </div>

          {/* Capacity Warning */}
          {selectedWorkflow && startDate && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Capacity Check:</strong> This order will require {calculateTotalItems()} production slots 
                starting {new Date(startDate).toLocaleDateString()}. 
                Please ensure adequate capacity is available.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!selectedWorkflow || !startDate || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Accepting..." : "Accept Purchase Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 