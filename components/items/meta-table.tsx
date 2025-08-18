"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Tag, 
  Edit3, 
  Save, 
  X, 
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MetadataItem {
  key: string
  value: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  required?: boolean
  options?: string[]
  category?: 'core' | 'custom'
}

interface MetaTableProps {
  metadata: Record<string, any>
  onUpdateMetadata?: (key: string, value: string) => Promise<void>
  onAddMetadata?: (key: string, value: string) => Promise<void>
  onDeleteMetadata?: (key: string) => Promise<void>
}

export function MetaTable({ 
  metadata, 
  onUpdateMetadata,
  onAddMetadata,
  onDeleteMetadata
}: MetaTableProps) {
  const { toast } = useToast()
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showCustom, setShowCustom] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  // Convert metadata to structured format
  const metadataItems: MetadataItem[] = Object.entries(metadata).map(([key, value]) => ({
    key,
    value: String(value),
    type: 'text',
    category: key.toLowerCase().includes('custom') ? 'custom' : 'core'
  }))

  const coreItems = metadataItems.filter(item => item.category === 'core')
  const customItems = metadataItems.filter(item => item.category === 'custom')

  const startEditing = (key: string, value: string) => {
    setEditingKey(key)
    setEditValue(value)
  }

  const cancelEditing = () => {
    setEditingKey(null)
    setEditValue("")
  }

  const saveEdit = async () => {
    if (!editingKey || !editValue.trim()) return

    try {
      await onUpdateMetadata?.(editingKey, editValue.trim())
      setEditingKey(null)
      setEditValue("")
      toast({
        title: "Metadata updated",
        description: "Item metadata has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update metadata",
        variant: "destructive",
      })
    }
  }

  const handleAddMetadata = async () => {
    if (!newKey.trim() || !newValue.trim()) return

    try {
      await onAddMetadata?.(newKey.trim(), newValue.trim())
      setNewKey("")
      setNewValue("")
      setIsAdding(false)
      toast({
        title: "Metadata added",
        description: "New metadata field has been added",
      })
    } catch (error) {
      toast({
        title: "Add failed",
        description: "Could not add metadata field",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMetadata = async (key: string) => {
    try {
      await onDeleteMetadata?.(key)
      toast({
        title: "Metadata deleted",
        description: "Metadata field has been removed",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete metadata field",
        variant: "destructive",
      })
    }
  }

  const renderMetadataRow = (item: MetadataItem) => {
    const isEditing = editingKey === item.key

    return (
      <div key={item.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm capitalize">
              {item.key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            {item.required && (
              <Badge variant="outline" className="text-xs">
                Required
              </Badge>
            )}
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit()
                  if (e.key === 'Escape') cancelEditing()
                }}
                autoFocus
              />
              <Button size="sm" onClick={saveEdit} className="h-8">
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEditing} className="h-8">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 break-all">{item.value}</span>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Edit Value</label>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Enter new value"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="flex-1">
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Metadata & Characteristics
          <Badge variant="outline" className="ml-auto">
            {metadataItems.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Core Metadata */}
        {coreItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Core Attributes</h4>
            {coreItems.map(renderMetadataRow)}
          </div>
        )}

        {/* Custom Metadata */}
        {customItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Custom Attributes</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustom(!showCustom)}
                className="h-6 w-6 p-0"
              >
                {showCustom ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {showCustom && (
              <div className="space-y-3">
                {customItems.map(renderMetadataRow)}
              </div>
            )}
          </div>
        )}

        {/* Add New Metadata */}
        <div className="border-t pt-4">
          {isAdding ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Field name"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMetadata()
                    if (e.key === 'Escape') setIsAdding(false)
                  }}
                />
                <Input
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMetadata()
                    if (e.key === 'Escape') setIsAdding(false)
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddMetadata} className="flex-1">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAdding(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Field
            </Button>
          )}
        </div>

        {/* Empty State */}
        {metadataItems.length === 0 && !isAdding && (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">No metadata defined</h4>
            <p className="text-gray-600 mb-4">Add custom fields to track additional item characteristics</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Field
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
