'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import CategoryBadge from '@/components/materials/category-badge'
import UnitChip from '@/components/materials/unit-chip'
import MaterialAttributeEditor from '@/components/materials/material-attribute-editor'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { 
  type Material, 
  type MaterialCategory, 
  type Unit,
  type MaterialAttributeTemplate,
  formatUnit
} from '@/types/materials'

const STEPS = [
  { id: 'basics', label: 'Basics', description: 'Name, code, and category' },
  { id: 'attributes', label: 'Attributes', description: 'Material properties' },
  { id: 'defaults', label: 'Defaults', description: 'Units and reorder settings' },
  { id: 'review', label: 'Review', description: 'Confirm details' }
]

const CATEGORIES: MaterialCategory[] = ['fabric', 'trim', 'accessory', 'packaging', 'other']
const UNITS: Unit[] = ['m', 'yd', 'pc', 'kg', 'g', 'roll', 'cone', 'box']

export default function NewMaterialPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState<Partial<Material>>({
    code: '',
    name: '',
    category: 'fabric',
    defaultUnit: 'm',
    attributes: {},
    reorderPoint: undefined,
    supplierSku: '',
  })
  
  const [customAttributes, setCustomAttributes] = useState<MaterialAttributeTemplate[]>([])

  const currentStepData = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Validate required fields
      if (!formData.code || !formData.name || !formData.category || !formData.defaultUnit) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const material = await dataAdapter.createMaterial({
        code: formData.code,
        name: formData.name,
        category: formData.category,
        defaultUnit: formData.defaultUnit,
        attributes: formData.attributes || {},
        reorderPoint: formData.reorderPoint,
        supplierSku: formData.supplierSku,
      })

      toast({
        title: "Success",
        description: `Material "${material.name}" created successfully`,
      })

      router.push(`/materials/${material.id}`)
    } catch (error) {
      console.error('Failed to create material:', error)
      toast({
        title: "Error",
        description: "Failed to create material. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return formData.code && formData.name && formData.category
      case 1: // Attributes
        return true // Attributes are optional
      case 2: // Defaults
        return formData.defaultUnit
      case 3: // Review
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basics
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code">Material Code *</Label>
                <Input
                  id="code"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., FAB-001"
                />
                <p className="text-sm text-muted-foreground">
                  Unique identifier for this material
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Material Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cotton Canvas - Natural"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={formData.category === category ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, category })}
                    className="h-auto p-3"
                  >
                    <CategoryBadge category={category} variant="outline" />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierSku">Supplier SKU</Label>
              <Input
                id="supplierSku"
                value={formData.supplierSku || ''}
                onChange={(e) => setFormData({ ...formData, supplierSku: e.target.value })}
                placeholder="e.g., SUP-CC-NAT-001"
              />
              <p className="text-sm text-muted-foreground">
                Optional supplier part number
              </p>
            </div>
          </div>
        )

      case 1: // Attributes
        return (
          <MaterialAttributeEditor
            category={formData.category!}
            attributes={formData.attributes || {}}
            onAttributesChange={(attributes) => setFormData({ ...formData, attributes })}
            customAttributes={customAttributes}
            onCustomAttributesChange={setCustomAttributes}
          />
        )

      case 2: // Defaults
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Default Unit *</Label>
              <div className="flex gap-2 flex-wrap">
                {UNITS.map((unit) => (
                  <Button
                    key={unit}
                    variant={formData.defaultUnit === unit ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, defaultUnit: unit })}
                    className="h-auto p-3"
                  >
                    <UnitChip unit={unit} variant="outline" />
                    <span className="ml-2 text-sm">
                      {formatUnit(unit)}
                    </span>
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Primary unit of measure for this material
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderPoint">Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                value={formData.reorderPoint || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  reorderPoint: parseFloat(e.target.value) || undefined 
                })}
                placeholder="e.g., 50"
              />
              <p className="text-sm text-muted-foreground">
                Minimum stock level before reordering (in {formatUnit(formData.defaultUnit!)})
              </p>
            </div>
          </div>
        )

      case 3: // Review
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Material Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Code</Label>
                    <p className="font-mono">{formData.code}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <div className="mt-1">
                      <CategoryBadge category={formData.category!} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Default Unit</Label>
                    <div className="mt-1">
                      <UnitChip unit={formData.defaultUnit!} />
                    </div>
                  </div>
                  {formData.supplierSku && (
                    <div>
                      <Label className="text-muted-foreground">Supplier SKU</Label>
                      <p className="font-mono">{formData.supplierSku}</p>
                    </div>
                  )}
                  {formData.reorderPoint && (
                    <div>
                      <Label className="text-muted-foreground">Reorder Point</Label>
                      <p>{formData.reorderPoint} {formatUnit(formData.defaultUnit!)}</p>
                    </div>
                  )}
                </div>

                {Object.keys(formData.attributes || {}).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Attributes</Label>
                      <div className="mt-2 space-y-2">
                        {Object.entries(formData.attributes || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}</span>
                            <Badge variant="outline">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Material</h1>
          <p className="text-muted-foreground">
            Add a new material to your inventory
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">{currentStepData.label}</h2>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>
          <Badge variant="secondary">
            Step {currentStep + 1} of {STEPS.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 
              ${index <= currentStep 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground text-muted-foreground'
              }
            `}>
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-2 
                ${index < currentStep ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card className="mb-8">
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={loading || !canProceed()}>
              {loading ? 'Creating...' : 'Create Material'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}