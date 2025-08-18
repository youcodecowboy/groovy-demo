'use client'

import { useState } from 'react'
import { Plus, X, Type, Hash, List, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  type MaterialAttributeTemplate, 
  type MaterialCategory,
  DEFAULT_CATEGORY_TEMPLATES
} from '@/types/materials'

interface MaterialAttributeEditorProps {
  category: MaterialCategory
  attributes: Record<string, string | number | boolean | null>
  onAttributesChange: (attributes: Record<string, string | number | boolean | null>) => void
  customAttributes: MaterialAttributeTemplate[]
  onCustomAttributesChange: (attributes: MaterialAttributeTemplate[]) => void
}

export default function MaterialAttributeEditor({
  category,
  attributes,
  onAttributesChange,
  customAttributes,
  onCustomAttributesChange
}: MaterialAttributeEditorProps) {
  const [newAttribute, setNewAttribute] = useState<Partial<MaterialAttributeTemplate>>({
    type: 'text'
  })
  const [showAddForm, setShowAddForm] = useState(false)

  // Get default attributes for category
  const categoryTemplate = DEFAULT_CATEGORY_TEMPLATES.find(t => t.category === category)
  const defaultAttributes = categoryTemplate?.attributes || []
  
  // Combine default and custom attributes
  const allAttributes = [...defaultAttributes, ...customAttributes]

  const handleAttributeChange = (key: string, value: string | number | boolean | null) => {
    onAttributesChange({
      ...attributes,
      [key]: value
    })
  }

  const handleAddCustomAttribute = () => {
    if (!newAttribute.key || !newAttribute.label) return

    const attribute: MaterialAttributeTemplate = {
      key: newAttribute.key,
      label: newAttribute.label,
      type: newAttribute.type || 'text',
      options: newAttribute.options,
      required: newAttribute.required || false
    }

    onCustomAttributesChange([...customAttributes, attribute])
    setNewAttribute({ type: 'text' })
    setShowAddForm(false)
  }

  const handleRemoveCustomAttribute = (key: string) => {
    onCustomAttributesChange(customAttributes.filter(attr => attr.key !== key))
    
    // Remove the attribute value as well
    const newAttributes = { ...attributes }
    delete newAttributes[key]
    onAttributesChange(newAttributes)
  }

  const renderAttributeInput = (attribute: MaterialAttributeTemplate) => {
    const value = attributes[attribute.key]

    switch (attribute.type) {
      case 'text':
        return (
          <Input
            value={value as string || ''}
            onChange={(e) => handleAttributeChange(attribute.key, e.target.value || null)}
            placeholder={`Enter ${attribute.label.toLowerCase()}`}
          />
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={value as number || ''}
            onChange={(e) => handleAttributeChange(attribute.key, parseFloat(e.target.value) || null)}
            placeholder={`Enter ${attribute.label.toLowerCase()}`}
          />
        )
      
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(val) => handleAttributeChange(attribute.key, val || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${attribute.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {attribute.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'bool':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value as boolean || false}
              onCheckedChange={(checked) => handleAttributeChange(attribute.key, checked)}
            />
            <Label>{value ? 'Yes' : 'No'}</Label>
          </div>
        )
      
      default:
        return null
    }
  }

  const getAttributeIcon = (type: MaterialAttributeTemplate['type']) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4" />
      case 'number':
        return <Hash className="w-4 h-4" />
      case 'select':
        return <List className="w-4 h-4" />
      case 'bool':
        return <Check className="w-4 h-4" />
      default:
        return <Type className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Default category attributes */}
      {defaultAttributes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Standard Attributes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Common attributes for {category} materials
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultAttributes.map((attribute) => (
              <div key={attribute.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getAttributeIcon(attribute.type)}
                  <Label className="font-medium">
                    {attribute.label}
                    {attribute.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {attribute.type}
                  </Badge>
                </div>
                {renderAttributeInput(attribute)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Custom attributes */}
      {customAttributes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Attributes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Additional attributes specific to this material
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {customAttributes.map((attribute) => (
              <div key={attribute.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAttributeIcon(attribute.type)}
                    <Label className="font-medium">
                      {attribute.label}
                      {attribute.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {attribute.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Custom
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomAttribute(attribute.key)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {renderAttributeInput(attribute)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add custom attribute */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Add Custom Attribute</CardTitle>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Attribute
              </Button>
            )}
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Attribute Key</Label>
                <Input
                  value={newAttribute.key || ''}
                  onChange={(e) => setNewAttribute({ ...newAttribute, key: e.target.value })}
                  placeholder="e.g., thread_count"
                />
              </div>
              <div className="space-y-2">
                <Label>Display Label</Label>
                <Input
                  value={newAttribute.label || ''}
                  onChange={(e) => setNewAttribute({ ...newAttribute, label: e.target.value })}
                  placeholder="e.g., Thread Count"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attribute Type</Label>
              <Select
                value={newAttribute.type}
                onValueChange={(type) => setNewAttribute({ ...newAttribute, type: type as MaterialAttributeTemplate['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select (Dropdown)</SelectItem>
                  <SelectItem value="bool">Boolean (Yes/No)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newAttribute.type === 'select' && (
              <div className="space-y-2">
                <Label>Options (one per line)</Label>
                <Textarea
                  value={newAttribute.options?.join('\n') || ''}
                  onChange={(e) => setNewAttribute({ 
                    ...newAttribute, 
                    options: e.target.value.split('\n').filter(Boolean) 
                  })}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows={3}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={newAttribute.required || false}
                onCheckedChange={(required) => setNewAttribute({ ...newAttribute, required })}
              />
              <Label>Required field</Label>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Button onClick={handleAddCustomAttribute}>
                Add Attribute
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
