"use client"

import { Button } from "@/components/ui/button"
import { 
  Flag,
  MessageSquare,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DiscoQuickActionsProps {
  itemId: string
  onFlagItem?: () => void
  onSendMessage?: () => void
  onMarkDefective?: () => void
}

export function DiscoQuickActions({ 
  itemId,
  onFlagItem,
  onSendMessage,
  onMarkDefective
}: DiscoQuickActionsProps) {
  const { toast } = useToast()

  const handleFlagItem = () => {
    onFlagItem?.()
    toast({
      title: "Item Flagged",
      description: "Item has been flagged for review",
    })
  }

  const handleSendMessage = () => {
    onSendMessage?.()
    toast({
      title: "Message Panel",
      description: "Message panel opened with item attached",
    })
  }

  const handleMarkDefective = () => {
    onMarkDefective?.()
    toast({
      title: "Item Marked Defective",
      description: "Item has been marked as defective",
    })
  }

  return (
    <div className="sticky bottom-24 z-40 bg-white border-t border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlagItem}
            className="flex-1 h-10 text-xs"
          >
            <Flag className="h-3 w-3 mr-1" />
            Flag
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendMessage}
            className="flex-1 h-10 text-xs"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Send
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkDefective}
            className="flex-1 h-10 text-xs text-red-600 border-red-300 hover:bg-red-50"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Defective
          </Button>
        </div>
      </div>
    </div>
  )
}
