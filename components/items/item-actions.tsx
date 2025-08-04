"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Flag,
    AlertTriangle,
    User,
    Send
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "convex/react"

interface ItemActionsProps {
  itemId: string
  currentUserId: string
  isDefective?: boolean
  defectNotes?: string
  flaggedBy?: string
  flaggedAt?: number
  assignedTo?: string
  onUpdate?: () => void
}

export function ItemActions({ 
  itemId, 
  currentUserId, 
  isDefective, 
  defectNotes, 
  flaggedBy, 
  flaggedAt, 
  assignedTo,
  onUpdate 
}: ItemActionsProps) {
  const { toast } = useToast()
  const [flagNotes, setFlagNotes] = useState("")
  const [defectNotesInput, setDefectNotesInput] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false)
  const [isDefectDialogOpen, setIsDefectDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  // Fetch users for assignment
  const users = useQuery(api.users.getAll)

  // Mutations
  const flagItem = useMutation(api.items.flagItem)
  const flagItemAsDefective = useMutation(api.items.flagItemAsDefective)
  const assignItem = useMutation(api.items.assignItem)

  const handleFlagItem = async () => {
    if (!flagNotes.trim()) return

    try {
      await flagItem({
        itemId: itemId as any,
        flagNotes: flagNotes.trim(),
        flaggedBy: currentUserId,
      })
      
      setFlagNotes("")
      setIsFlagDialogOpen(false)
      onUpdate?.()
      
      toast({
        title: "Item flagged",
        description: "The item has been flagged for attention",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag item",
        variant: "destructive",
      })
    }
  }

  const handleFlagAsDefective = async () => {
    if (!defectNotesInput.trim()) return

    try {
      await flagItemAsDefective({
        itemId: itemId as any,
        defectNotes: defectNotesInput.trim(),
        flaggedBy: currentUserId,
      })
      
      setDefectNotesInput("")
      setIsDefectDialogOpen(false)
      onUpdate?.()
      
      toast({
        title: "Item marked as defective",
        description: "The item has been flagged as defective",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark item as defective",
        variant: "destructive",
      })
    }
  }

  const handleAssignItem = async () => {
    if (!selectedUser) return

    try {
      await assignItem({
        itemId: itemId as any,
        assignedTo: selectedUser,
        assignedBy: currentUserId,
      })
      
      setSelectedUser("")
      setIsAssignDialogOpen(false)
      onUpdate?.()
      
      toast({
        title: "Item assigned",
        description: "The item has been assigned successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign item",
        variant: "destructive",
      })
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="space-y-4">
      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {isDefective && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Defective
          </Badge>
        )}
        {flaggedBy && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flag className="h-3 w-3" />
            Flagged
          </Badge>
        )}
        {assignedTo && (
          <Badge variant="default" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Assigned to {assignedTo}
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Flag Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Flag Item</DialogTitle>
              <DialogDescription>
                Flag this item for attention or review
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Flag Notes</label>
                <Textarea
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="Enter reason for flagging..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleFlagItem} disabled={!flagNotes.trim()}>
                  <Flag className="h-4 w-4 mr-2" />
                  Flag Item
                </Button>
                <Button variant="outline" onClick={() => setIsFlagDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDefectDialogOpen} onOpenChange={setIsDefectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark Defective
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as Defective</DialogTitle>
              <DialogDescription>
                Mark this item as defective and provide details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Defect Details</label>
                <Textarea
                  value={defectNotesInput}
                  onChange={(e) => setDefectNotesInput(e.target.value)}
                  placeholder="Describe the defect..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleFlagAsDefective} disabled={!defectNotesInput.trim()}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark Defective
                </Button>
                <Button variant="outline" onClick={() => setIsDefectDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Assign Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Item</DialogTitle>
              <DialogDescription>
                Assign this item to a user or team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Assign to</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAssignItem} disabled={!selectedUser}>
                  <Send className="h-4 w-4 mr-2" />
                  Assign
                </Button>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Flag/Defect Details */}
      {(flaggedBy || isDefective) && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          {flaggedBy && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Flag Details</h4>
              <div className="text-sm text-gray-600">
                <p><strong>Flagged by:</strong> {flaggedBy}</p>
                {flaggedAt && (
                  <p><strong>Flagged at:</strong> {formatTimestamp(flaggedAt)}</p>
                )}
              </div>
            </div>
          )}
          
          {isDefective && defectNotes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Defect Details</h4>
              <div className="text-sm text-gray-600">
                <p><strong>Defect Notes:</strong></p>
                <p className="mt-1">{defectNotes}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 