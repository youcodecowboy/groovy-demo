"use client"

import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Package, 
  Workflow, 
  Tag, 
  QrCode, 
  Settings,
  Save,
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AttributeField {
  id: string
  key: string
  label: string
  type: "text" | "number" | "select" | "textarea" | "date" | "boolean"
  value: string | number | boolean
  required: boolean
  options?: string[] // For select type
  placeholder?: string
}

export default function NewItemPage() {
  const router = useRouter()
  const { toast } = useToast()
  const createItem = useMutation(api.items.create)
  
  const workflows = useQuery(api.workflows.getActive) || []
  
  const [itemId, setItemId] = useState("")
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [customAttributes, setCustomAttributes] = useState<AttributeField[]>([
    {
      id: "1",
      key: "brand",
      label: "Brand",
      type: "text",
      value: "",
      required: true,
      placeholder: "e.g., Nike, Adidas"
    },
    {
      id: "2", 
      key: "style",
      label: "Style",
      type: "text",
      value: "",
      required: true,
      placeholder: "e.g., Running Shoe, T-Shirt"
    },
    {
      id: "3",
      key: "sku",
      label: "SKU",
      type: "text", 
      value: "",
      required: false,
      placeholder: "Stock Keeping Unit"
    },
    {
      id: "4",
      key: "color",
      label: "Color",
      type: "select",
      value: "",
      required: false,
      options: ["Red", "Blue", "Green", "Black", "White", "Gray", "Yellow", "Purple", "Orange", "Pink"]
    },
    {
      id: "5",
      key: "size",
      label: "Size",
      type: "select",
      value: "",
      required: false,
      options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
    },
    {
      id: "6",
      key: "quantity",
      label: "Quantity",
      type: "number",
      value: 1,
      required: true,
      placeholder: "1"
    },
    {
      id: "7",
      key: "priority",
      label: "Priority",
      type: "select",
      value: "medium",
      required: false,
      options: ["low", "medium", "high", "urgent"]
    }
  ])

  // Generate a unique item ID if not provided
  useEffect(() => {
    if (!itemId) {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      setItemId(`ITEM-${timestamp}-${random}`)
    }
  }, [itemId])

  const addAttribute = () => {
    const newId = (customAttributes.length + 1).toString()
    setCustomAttributes([
      ...customAttributes,
      {
        id: newId,
        key: `attribute_${newId}`,
        label: `Attribute ${newId}`,
        type: "text",
        value: "",
        required: false,
        placeholder: "Enter value"
      }
    ])
  }

  const removeAttribute = (id: string) => {
    setCustomAttributes(customAttributes.filter(attr => attr.id !== id))
  }

  const updateAttribute = (id: string, field: keyof AttributeField, value: any) => {
    setCustomAttributes(customAttributes.map(attr => 
      attr.id === id ? { ...attr, [field]: value } : attr
    ))
  }

  const getSelectedWorkflow = () => {
    return workflows.find(w => w._id === selectedWorkflowId)
  }

  const getFirstStageId = () => {
    const workflow = getSelectedWorkflow()
    return workflow?.stages?.[0]?.id || ""
  }

  const buildMetadata = () => {
    const metadata: any = {}
    customAttributes.forEach(attr => {
      if (attr.value !== "" && attr.value !== null && attr.value !== undefined) {
        metadata[attr.key] = attr.value
      }
    })
    return metadata
  }

  const validateForm = () => {
    if (!itemId.trim()) {
      toast({
        title: "Validation Error",
        description: "Item ID is required",
        variant: "destructive"
      })
      return false
    }

    if (!selectedWorkflowId) {
      toast({
        title: "Validation Error", 
        description: "Please select a workflow",
        variant: "destructive"
      })
      return false
    }

    // Check required attributes
    const missingRequired = customAttributes.filter(attr => 
      attr.required && (attr.value === "" || attr.value === null || attr.value === undefined)
    )

    if (missingRequired.length > 0) {
      toast({
        title: "Validation Error",
        description: `Missing required fields: ${missingRequired.map(attr => attr.label).join(", ")}`,
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const metadata = buildMetadata()
      const firstStageId = getFirstStageId()

      await createItem({
        itemId: itemId.trim(),
        workflowId: selectedWorkflowId as any,
        currentStageId: firstStageId,
        status: "active",
        metadata,
        assignedTo: assignedTo || undefined,
        description: description || undefined
      })

      toast({
        title: "Success",
        description: "Item created successfully",
      })

      router.push("/app/items")
    } catch (error) {
      console.error("Failed to create item:", error)
      toast({
        title: "Error",
        description: "Failed to create item. Please try again.",
        variant: "destructive"
      })
    }
  }

  const renderAttributeField = (attribute: AttributeField) => {
    switch (attribute.type) {
      case "text":
        return (
          <Input
            value={attribute.value as string}
            onChange={(e) => updateAttribute(attribute.id, "value", e.target.value)}
            placeholder={attribute.placeholder}
            className={attribute.required ? "border-red-200 focus:border-red-500" : ""}
          />
        )
      
      case "number":
        return (
          <Input
            type="number"
            value={attribute.value as number}
            onChange={(e) => updateAttribute(attribute.id, "value", parseInt(e.target.value) || 0)}
            placeholder={attribute.placeholder}
            className={attribute.required ? "border-red-200 focus:border-red-500" : ""}
          />
        )
      
      case "select":
        return (
          <Select
            value={attribute.value as string}
            onValueChange={(value) => updateAttribute(attribute.id, "value", value)}
          >
            <SelectTrigger className={attribute.required ? "border-red-200 focus:border-red-500" : ""}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {attribute.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case "textarea":
        return (
          <Textarea
            value={attribute.value as string}
            onChange={(e) => updateAttribute(attribute.id, "value", e.target.value)}
            placeholder={attribute.placeholder}
            className={attribute.required ? "border-red-200 focus:border-red-500" : ""}
          />
        )
      
      case "boolean":
        return (
          <Select
            value={attribute.value ? "true" : "false"}
            onValueChange={(value) => updateAttribute(attribute.id, "value", value === "true")}
          >
            <SelectTrigger className={attribute.required ? "border-red-200 focus:border-red-500" : ""}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        )
      
      default:
        return <Input value={attribute.value as string} onChange={(e) => updateAttribute(attribute.id, "value", e.target.value)} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="h-10 w-10 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create New Item</h1>
          <p className="text-gray-600 italic">Add a new item with flexible attributes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemId">Item ID *</Label>
                  <Input
                    id="itemId"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="e.g., ITEM-123456"
                  />
                </div>
                
                <div>
                  <Label htmlFor="workflow">Workflow *</Label>
                  <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a workflow" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflows.map(workflow => (
                        <SelectItem key={workflow._id} value={workflow._id}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description of the item..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g., john@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Attributes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Item Attributes
                </CardTitle>
                <Button
                  onClick={addAttribute}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Attribute
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {customAttributes.map((attribute) => (
                <div key={attribute.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Key</Label>
                        <Input
                          value={attribute.key}
                          onChange={(e) => updateAttribute(attribute.id, "key", e.target.value)}
                          placeholder="e.g., brand, style"
                        />
                      </div>
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={attribute.label}
                          onChange={(e) => updateAttribute(attribute.id, "label", e.target.value)}
                          placeholder="Display name"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={attribute.type}
                          onValueChange={(value) => updateAttribute(attribute.id, "type", value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeAttribute(attribute.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Value</Label>
                      {renderAttributeField(attribute)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`required-${attribute.id}`}
                          checked={attribute.required}
                          onChange={(e) => updateAttribute(attribute.id, "required", e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`required-${attribute.id}`}>Required</Label>
                      </div>
                    </div>
                  </div>
                  
                  {attribute.type === "select" && (
                    <div className="mt-3">
                      <Label>Options (comma-separated)</Label>
                      <Input
                        value={attribute.options?.join(", ") || ""}
                        onChange={(e) => updateAttribute(attribute.id, "options", e.target.value.split(",").map(s => s.trim()))}
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workflow Info */}
          {selectedWorkflowId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Workflow Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Selected Workflow</Label>
                  <p className="text-sm text-gray-900 font-medium">{getSelectedWorkflow()?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Stages</Label>
                  <p className="text-sm text-gray-600">{getSelectedWorkflow()?.stages?.length || 0} stages</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Starting Stage</Label>
                  <p className="text-sm text-gray-600">{getSelectedWorkflow()?.stages?.[0]?.name || "None"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSubmit}
                className="w-full h-11"
                disabled={!itemId || !selectedWorkflowId}
              >
                <Save className="h-4 w-4 mr-2" />
                Create Item
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full h-11"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
