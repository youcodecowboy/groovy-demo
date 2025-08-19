'use client'

import { useState, useEffect } from 'react'
import { 
  QrCode, 
  Printer, 
  Download,
  Eye,
  Plus,
  Grid3X3,
  Package,
  MapPin,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material, type MaterialLot, type LabelTemplate } from '@/types/materials'

interface LabelsPanelProps {
  material: Material
}

export default function LabelsPanel({ material }: LabelsPanelProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<LabelTemplate[]>([])
  const [lots, setLots] = useState<MaterialLot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedLots, setSelectedLots] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadData()
  }, [material.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [templatesData, lotsData] = await Promise.all([
        dataAdapter.getLabelTemplates(),
        dataAdapter.getMaterialLots(material.id)
      ])
      setTemplates(templatesData)
      setLots(lotsData)
      
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

  const handleGenerateMaterialLabel = async () => {
    try {
      if (!selectedTemplate) {
        toast({
          title: "No Template Selected",
          description: "Please select a label template",
          variant: "destructive",
        })
        return
      }

      const labelFile = await dataAdapter.generateMaterialLabel(material.id, selectedTemplate)
      
      toast({
        title: "Label Generated",
        description: `Material label has been generated: ${labelFile}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate material label",
        variant: "destructive",
      })
    }
  }

  const handleGenerateLotLabels = async () => {
    try {
      if (!selectedTemplate) {
        toast({
          title: "No Template Selected",
          description: "Please select a label template",
          variant: "destructive",
        })
        return
      }

      if (selectedLots.length === 0) {
        toast({
          title: "No Lots Selected",
          description: "Please select lots to generate labels for",
          variant: "destructive",
        })
        return
      }

      const labelFiles = await Promise.all(
        selectedLots.map(lotId => dataAdapter.generateLotLabel(lotId, selectedTemplate))
      )
      
      toast({
        title: "Labels Generated",
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

  const toggleLotSelection = (lotId: string) => {
    setSelectedLots(prev => 
      prev.includes(lotId) 
        ? prev.filter(id => id !== lotId)
        : [...prev, lotId]
    )
  }

  const selectAllLots = () => {
    setSelectedLots(lots.map(lot => lot.id))
  }

  const clearSelection = () => {
    setSelectedLots([])
  }

  const renderLabelPreview = (template: LabelTemplate) => {
    return (
      <div 
        className="border border-dashed border-gray-300 bg-white relative"
        style={{
          width: `${template.widthMm * 2}px`,
          height: `${template.heightMm * 2}px`,
          minWidth: '200px',
          minHeight: '120px'
        }}
      >
        {template.fields.map((field, index) => (
          <div
            key={index}
            className="absolute text-xs"
            style={{
              left: `${field.x * 2}px`,
              top: `${field.y * 2}px`,
              fontSize: `${Math.max(field.font, 8)}px`
            }}
          >
            {field.key === 'qr' ? (
              <QrCode className="w-6 h-6" />
            ) : field.key === 'code' ? (
              material.code
            ) : field.key === 'name' ? (
              material.name
            ) : field.key === 'lotCode' ? (
              'LOT-2024-001'
            ) : field.key === 'quantity' ? (
              `100 ${material.defaultUnit}`
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
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Label generation controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Label Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Template selection */}
            <div>
              <Label htmlFor="template-select">Label Template</Label>
              <div className="flex gap-2">
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.widthMm}×{template.heightMm}mm)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={!selectedTemplate}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Label Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center p-6">
                      {selectedTemplate && renderLabelPreview(templates.find(t => t.id === selectedTemplate)!)}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Material label generation */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">Material Label</div>
                  <div className="text-sm text-muted-foreground">
                    Generate label for {material.name}
                  </div>
                </div>
              </div>
              <Button onClick={handleGenerateMaterialLabel} disabled={!selectedTemplate}>
                <Printer className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lot labels generation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Lot Labels ({lots.length} lots)
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllLots}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button 
                onClick={handleGenerateLotLabels} 
                disabled={!selectedTemplate || selectedLots.length === 0}
                size="sm"
              >
                <Printer className="w-4 h-4 mr-2" />
                Generate ({selectedLots.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lots.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedLots.length === lots.length}
                      onChange={selectedLots.length === lots.length ? clearSelection : selectAllLots}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Lot Code</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedLots.includes(lot.id)}
                        onChange={() => toggleLotSelection(lot.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 rounded">
                        {lot.lotCode || lot.id}
                      </code>
                    </TableCell>
                    <TableCell>
                      {lot.color ? (
                        <Badge variant="outline">{lot.color}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {lot.quantity.toFixed(1)} {material.defaultUnit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lot.locationId ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{lot.locationId}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(lot.receivedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedLots([lot.id])
                          handleGenerateLotLabels()
                        }}
                        disabled={!selectedTemplate}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Grid3X3 className="w-8 h-8 mx-auto mb-2" />
              <p>No lots available</p>
              <p className="text-sm">Receive materials to create lots for labeling</p>
            </div>
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className={`cursor-pointer transition-colors ${
                selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
              }`} onClick={() => setSelectedTemplate(template.id)}>
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
