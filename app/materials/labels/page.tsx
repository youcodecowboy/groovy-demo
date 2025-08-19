'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, QrCode, Printer, Download, Eye, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material, type MaterialLot, type LabelTemplate } from '@/types/materials'

function MaterialLabelsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const materialIds = searchParams.get('materials')?.split(',') || []
  
  const [materials, setMaterials] = useState<Material[]>([])
  const [lots, setLots] = useState<Record<string, MaterialLot[]>>({})
  const [templates, setTemplates] = useState<LabelTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load materials
      const materialsData = await Promise.all(
        materialIds.map(id => dataAdapter.getMaterial(id))
      )
      setMaterials(materialsData.filter(Boolean) as Material[])
      
      // Load lots for each material
      const lotsData: Record<string, MaterialLot[]> = {}
      for (const materialId of materialIds) {
        const materialLots = await dataAdapter.getMaterialLots(materialId)
        lotsData[materialId] = materialLots
      }
      setLots(lotsData)
      
      // Load templates
      const templatesData = await dataAdapter.getLabelTemplates()
      setTemplates(templatesData)
      
      // Set default template
      const materialTemplate = templatesData.find(t => t.scope === 'material')
      if (materialTemplate) {
        setSelectedTemplate(materialTemplate.id)
      }
      
    } catch (error) {
      console.error('Failed to load label data:', error)
      toast({
        title: "Error",
        description: "Failed to load label data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateLabels = async () => {
    try {
      if (!selectedTemplate) {
        toast({
          title: "No Template Selected",
          description: "Please select a label template",
          variant: "destructive",
        })
        return
      }

      const labelFiles = await Promise.all(
        materials.map(material => dataAdapter.generateMaterialLabel(material.id, selectedTemplate))
      )
      
      toast({
        title: "Labels Generated",
        description: `Generated ${labelFiles.length} material labels`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate labels",
        variant: "destructive",
      })
    }
  }

  const handleGenerateLotLabels = async (materialId: string) => {
    try {
      if (!selectedTemplate) {
        toast({
          title: "No Template Selected",
          description: "Please select a label template",
          variant: "destructive",
        })
        return
      }

      const materialLots = lots[materialId] || []
      const labelFiles = await Promise.all(
        materialLots.map(lot => dataAdapter.generateLotLabel(lot.id, selectedTemplate))
      )
      
      toast({
        title: "Lot Labels Generated",
        description: `Generated ${labelFiles.length} lot labels`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate lot labels",
        variant: "destructive",
      })
    }
  }

  const renderLabelPreview = (template: LabelTemplate) => {
    const sampleMaterial = materials[0]
    if (!sampleMaterial) return null

    return (
      <div 
        className="border border-dashed border-gray-300 bg-white relative mx-auto"
        style={{
          width: `${template.widthMm * 3}px`,
          height: `${template.heightMm * 3}px`,
          minWidth: '240px',
          minHeight: '150px'
        }}
      >
        {template.fields.map((field, index) => (
          <div
            key={index}
            className="absolute text-xs"
            style={{
              left: `${field.x * 3}px`,
              top: `${field.y * 3}px`,
              fontSize: `${Math.max(field.font * 1.2, 10)}px`
            }}
          >
            {field.key === 'qr' ? (
              <QrCode className="w-8 h-8" />
            ) : field.key === 'code' ? (
              sampleMaterial.code
            ) : field.key === 'name' ? (
              sampleMaterial.name
            ) : field.key === 'lotCode' ? (
              'LOT-2024-001'
            ) : field.key === 'quantity' ? (
              `100 ${sampleMaterial.defaultUnit}`
            ) : (
              field.key
            )}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/materials')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Materials
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Label Generation</h1>
          <p className="text-muted-foreground">
            Generate labels for {materials.length} material{materials.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Template selection and preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Label Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-select">Select Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a label template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.widthMm}×{template.heightMm}mm)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTemplate && (
                <div className="space-y-2">
                  <Label>Template Details</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {(() => {
                      const template = templates.find(t => t.id === selectedTemplate)
                      return template ? (
                        <div className="text-sm space-y-1">
                          <div><strong>Name:</strong> {template.name}</div>
                          <div><strong>Size:</strong> {template.widthMm} × {template.heightMm} mm</div>
                          <div><strong>Scope:</strong> {template.scope}</div>
                          <div><strong>Fields:</strong> {template.fields.map(f => f.key).join(', ')}</div>
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <Label>Label Preview</Label>
              <div className="flex justify-center p-6 bg-muted rounded-lg">
                {selectedTemplate ? (
                  renderLabelPreview(templates.find(t => t.id === selectedTemplate)!)
                ) : (
                  <div className="text-center text-muted-foreground">
                    <QrCode className="w-12 h-12 mx-auto mb-2" />
                    <p>Select a template to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials to label */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Materials to Label
            </CardTitle>
            <Button 
              onClick={handleGenerateLabels}
              disabled={!selectedTemplate || materials.length === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Generate All Material Labels
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materials.map((material) => {
              const materialLots = lots[material.id] || []
              return (
                <Card key={material.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{material.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {material.code} • {materialLots.length} lot{materialLots.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateLotLabels(material.id)}
                          disabled={!selectedTemplate || materialLots.length === 0}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Lot Labels ({materialLots.length})
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => dataAdapter.generateMaterialLabel(material.id, selectedTemplate)}
                          disabled={!selectedTemplate}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Material Label
                        </Button>
                      </div>
                    </div>
                    
                    {materialLots.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {materialLots.slice(0, 6).map((lot) => (
                            <div key={lot.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                              <span className="font-mono">{lot.lotCode || lot.id}</span>
                              <span>{lot.quantity.toFixed(1)} {material.defaultUnit}</span>
                            </div>
                          ))}
                          {materialLots.length > 6 && (
                            <div className="flex items-center justify-center p-2 text-muted-foreground text-xs">
                              +{materialLots.length - 6} more lots
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Label templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Available Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-colors ${
                  selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                }`} 
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="outline">
                      {template.scope}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.widthMm} × {template.heightMm} mm
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Fields: {template.fields.map(f => f.key).join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MaterialLabelsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    }>
      <MaterialLabelsContent />
    </Suspense>
  )
}