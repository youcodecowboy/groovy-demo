"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Eye,
  EyeOff,
  Hash,
  Calendar,
  CheckSquare,
  Link,
  Mail,
  Type,
  List,
} from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ItemAttribute, AttributeValidation } from "@/types/item-schema"

interface AttributeBuilderProps {
  onSave?: (attributes: ItemAttribute[]) => void
  initialAttributes?: ItemAttribute[]
  readOnly?: boolean
}

export function AttributeBuilder({ onSave, initialAttributes = [], readOnly = false }: AttributeBuilderProps) {
  const [attributes, setAttributes] = useState<ItemAttribute[]>(initialAttributes)
  const [editingAttribute, setEditingAttribute] = useState<ItemAttribute | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  const createAttribute = useMutation(api.itemAttributes.createAttribute)
  const updateAttribute = useMutation(api.itemAttributes.updateAttribute)
  const deleteAttribute = useMutation(api.itemAttributes.deleteAttribute)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <Type className="w-4 h-4" />
      case "number": return <Hash className="w-4 h-4" />
      case "select": return <List className="w-4 h-4" />
      case "date": return <Calendar className="w-4 h-4" />
      case "boolean": return <CheckSquare className="w-4 h-4" />
      case "url": return <Link className="w-4 h-4" />
      case "email": return <Mail className="w-4 h-4" />
      default: return <Type className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text": return "bg-blue-100 text-blue-800"
      case "number": return "bg-green-100 text-green-800"
      case "select": return "bg-purple-100 text-purple-800"
      case "date": return "bg-orange-100 text-orange-800"
      case "boolean": return "bg-gray-100 text-gray-800"
      case "url": return "bg-indigo-100 text-indigo-800"
      case "email": return "bg-pink-100 text-pink-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const addAttribute = () => {
    const newAttribute: ItemAttribute = {
      id: `temp-${Date.now()}`,
      name: "",
      type: "text",
      description: "",
      required: false,
      defaultValue: undefined,
      validation: undefined,
      options: [],
      group: "General",
      order: attributes.length,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setAttributes([...attributes, newAttribute])
    setEditingAttribute(newAttribute)
  }

  const updateAttributeInList = (id: string, updates: Partial<ItemAttribute>) => {
    setAttributes(prev => prev.map(attr => 
      attr.id === id ? { ...attr, ...updates, updatedAt: Date.now() } : attr
    ))
  }

  const removeAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id))
    if (editingAttribute?.id === id) {
      setEditingAttribute(null)
    }
  }

  const saveAttribute = async (attribute: ItemAttribute) => {
    try {
      if (attribute.id.startsWith('temp-')) {
        // Create new attribute
        const newId = await createAttribute({
          name: attribute.name,
          type: attribute.type,
          description: attribute.description,
          required: attribute.required,
          defaultValue: attribute.defaultValue,
          validation: attribute.validation,
          options: attribute.options,
          group: attribute.group,
          order: attribute.order,
        })
        updateAttributeInList(attribute.id, { id: newId })
      } else {
        // Update existing attribute
        await updateAttribute({
          id: attribute.id as any,
          name: attribute.name,
          description: attribute.description,
          required: attribute.required,
          defaultValue: attribute.defaultValue,
          validation: attribute.validation,
          options: attribute.options,
          group: attribute.group,
          order: attribute.order,
          isActive: attribute.isActive,
        })
      }
      setEditingAttribute(null)
    } catch (error) {
      console.error("Failed to save attribute:", error)
    }
  }

  const renderValidationFields = (validation: AttributeValidation | undefined, onChange: (validation: AttributeValidation) => void) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Length</Label>
            <Input
              type="number"
              value={validation?.minLength || ""}
              onChange={(e) => onChange({ ...validation, minLength: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Min characters"
            />
          </div>
          <div>
            <Label>Max Length</Label>
            <Input
              type="number"
              value={validation?.maxLength || ""}
              onChange={(e) => onChange({ ...validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Max characters"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Value</Label>
            <Input
              type="number"
              value={validation?.minValue || ""}
              onChange={(e) => onChange({ ...validation, minValue: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="Min value"
            />
          </div>
          <div>
            <Label>Max Value</Label>
            <Input
              type="number"
              value={validation?.maxValue || ""}
              onChange={(e) => onChange({ ...validation, maxValue: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="Max value"
            />
          </div>
        </div>
        <div>
          <Label>Pattern (Regex)</Label>
          <Input
            value={validation?.pattern || ""}
            onChange={(e) => onChange({ ...validation, pattern: e.target.value })}
            placeholder="^[A-Za-z]+$"
          />
        </div>
        <div>
          <Label>Custom Validation</Label>
          <Textarea
            value={validation?.customValidation || ""}
            onChange={(e) => onChange({ ...validation, customValidation: e.target.value })}
            placeholder="Custom validation logic"
            rows={3}
          />
        </div>
      </div>
    )
  }

  const renderAttributeEditor = (attribute: ItemAttribute) => {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Edit Attribute</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={attribute.name}
                onChange={(e) => updateAttributeInList(attribute.id, { name: e.target.value })}
                placeholder="Attribute name"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={attribute.type} onValueChange={(value: any) => updateAttributeInList(attribute.id, { type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={attribute.description || ""}
              onChange={(e) => updateAttributeInList(attribute.id, { description: e.target.value })}
              placeholder="Describe this attribute"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Group</Label>
              <Input
                value={attribute.group || ""}
                onChange={(e) => updateAttributeInList(attribute.id, { group: e.target.value })}
                placeholder="Group name"
              />
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={attribute.order}
                onChange={(e) => updateAttributeInList(attribute.id, { order: parseInt(e.target.value) || 0 })}
                placeholder="Display order"
              />
            </div>
          </div>

          {attribute.type === "select" && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {(attribute.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(attribute.options || [])]
                        newOptions[index] = e.target.value
                        updateAttributeInList(attribute.id, { options: newOptions })
                      }}
                      placeholder="Option value"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newOptions = [...(attribute.options || [])]
                        newOptions.splice(index, 1)
                        updateAttributeInList(attribute.id, { options: newOptions })
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newOptions = [...(attribute.options || []), ""]
                    updateAttributeInList(attribute.id, { options: newOptions })
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <Label>Required Field</Label>
              </div>
              <Switch
                checked={attribute.required}
                onCheckedChange={(checked) => updateAttributeInList(attribute.id, { required: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <Label>Show Validation Options</Label>
              </div>
              <Switch
                checked={showValidation}
                onCheckedChange={setShowValidation}
              />
            </div>
          </div>

          {showValidation && (
            <div>
              <Label>Validation Rules</Label>
              {renderValidationFields(attribute.validation, (validation) => 
                updateAttributeInList(attribute.id, { validation })
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditingAttribute(null)}>
              Cancel
            </Button>
            <Button onClick={() => saveAttribute(attribute)}>
              Save Attribute
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Item Attributes</h3>
          <p className="text-sm text-gray-600">Define custom attributes for your items</p>
        </div>
        {!readOnly && (
          <Button onClick={addAttribute}>
            <Plus className="w-4 h-4 mr-2" />
            Add Attribute
          </Button>
        )}
      </div>

      {editingAttribute && renderAttributeEditor(editingAttribute)}

      <div className="space-y-3">
        {attributes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Type className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">No attributes defined</h4>
              <p className="text-gray-600 mb-4">Add custom attributes to track specific data for your items</p>
              {!readOnly && (
                <Button onClick={addAttribute}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Attribute
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          attributes
            .sort((a, b) => a.order - b.order)
            .map((attribute) => (
              <Card key={attribute.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(attribute.type)}
                        <Badge variant="outline" className={getTypeColor(attribute.type)}>
                          {attribute.type}
                        </Badge>
                        {attribute.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{attribute.name}</h4>
                        {attribute.description && (
                          <p className="text-sm text-gray-600">{attribute.description}</p>
                        )}
                        {attribute.group && (
                          <p className="text-xs text-gray-500">Group: {attribute.group}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!readOnly && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAttribute(attribute)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAttribute(attribute.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {attributes.length > 0 && !readOnly && (
        <div className="flex justify-end">
          <Button onClick={() => onSave?.(attributes)}>
            Save All Attributes
          </Button>
        </div>
      )}
    </div>
  )
}
