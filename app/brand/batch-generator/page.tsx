"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Hash, Download, Copy, Plus, Trash2, RefreshCw, Settings, FileText } from "lucide-react"
import { toast } from "sonner"

interface BatchData {
  id: string
  name: string
  prefix: string
  startNumber: number
  count: number
  format: string
  includeDate: boolean
  includeTimestamp: boolean
  separator: string
  description: string
  generatedItems: string[]
  timestamp: string
}

interface BatchTemplate {
  id: string
  name: string
  description: string
  prefix: string
  format: string
  includeDate: boolean
  includeTimestamp: boolean
  separator: string
}

const batchTemplates: BatchTemplate[] = [
  {
    id: 'product',
    name: 'Product Batch',
    description: 'Standard product batch numbering',
    prefix: 'BRAND-PROD',
    format: '{{prefix}}-{{number}}',
    includeDate: true,
    includeTimestamp: false,
    separator: '-'
  },
  {
    id: 'campaign',
    name: 'Campaign Batch',
    description: 'Marketing campaign batch identifiers',
    prefix: 'BRAND-CAMP',
    format: '{{prefix}}-{{number}}',
    includeDate: true,
    includeTimestamp: false,
    separator: '-'
  },
  {
    id: 'sample',
    name: 'Sample Batch',
    description: 'Sample and prototype batch numbers',
    prefix: 'BRAND-SAMP',
    format: '{{prefix}}-{{number}}',
    includeDate: true,
    includeTimestamp: true,
    separator: '-'
  },
  {
    id: 'custom',
    name: 'Custom Batch',
    description: 'Fully customizable batch format',
    prefix: 'BRAND',
    format: '{{prefix}}-{{number}}',
    includeDate: false,
    includeTimestamp: false,
    separator: '-'
  }
]

export default function BatchGeneratorPage() {
  const [batches, setBatches] = useState<BatchData[]>([])
  const [currentBatch, setCurrentBatch] = useState<Partial<BatchData>>({
    name: "",
    prefix: "BRAND",
    startNumber: 1,
    count: 10,
    format: "{{prefix}}-{{number}}",
    includeDate: true,
    includeTimestamp: false,
    separator: "-",
    description: "",
    generatedItems: []
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const updateTemplate = (templateId: string) => {
    const template = batchTemplates.find(t => t.id === templateId)
    if (template) {
      setCurrentBatch(prev => ({
        ...prev,
        prefix: template.prefix,
        format: template.format,
        includeDate: template.includeDate,
        includeTimestamp: template.includeTimestamp,
        separator: template.separator
      }))
    }
  }

  const generateBatch = async () => {
    if (!currentBatch.name) {
      toast.error("Please enter a batch name")
      return
    }

    if (currentBatch.count && currentBatch.count > 1000) {
      toast.error("Batch size cannot exceed 1000 items")
      return
    }

    setIsGenerating(true)
    try {
      const generatedItems: string[] = []
      const startNum = currentBatch.startNumber || 1
      const count = currentBatch.count || 10
      const prefix = currentBatch.prefix || "BRAND"
      const format = currentBatch.format || "{{prefix}}-{{number}}"
      const separator = currentBatch.separator || "-"
      const includeDate = currentBatch.includeDate || false
      const includeTimestamp = currentBatch.includeTimestamp || false

      for (let i = 0; i < count; i++) {
        const number = startNum + i
        let item = format
          .replace('{{prefix}}', prefix)
          .replace('{{number}}', number.toString().padStart(4, '0'))
        
        if (includeDate) {
          const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
          item += `${separator}${date}`
        }
        
        if (includeTimestamp) {
          const timestamp = Date.now().toString().slice(-6)
          item += `${separator}${timestamp}`
        }

        generatedItems.push(item)
      }

      const newBatch: BatchData = {
        id: Date.now().toString(),
        name: currentBatch.name,
        prefix: prefix,
        startNumber: startNum,
        count: count,
        format: format,
        includeDate: includeDate,
        includeTimestamp: includeTimestamp,
        separator: separator,
        description: currentBatch.description || '',
        generatedItems: generatedItems,
        timestamp: new Date().toISOString()
      }

      setBatches(prev => [newBatch, ...prev])
      setCurrentBatch(prev => ({ 
        ...prev, 
        name: '', 
        description: '',
        generatedItems: []
      }))
      toast.success(`Generated ${count} batch items successfully!`)
    } catch (error) {
      toast.error("Failed to generate batch")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteBatch = (id: string) => {
    setBatches(prev => prev.filter(batch => batch.id !== id))
    toast.success("Batch deleted")
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Batch items copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const downloadBatch = (batch: BatchData) => {
    try {
      const content = batch.generatedItems.join('\n')
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `batch-${batch.name}-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Batch downloaded successfully")
    } catch (error) {
      toast.error("Failed to download batch")
    }
  }

  const clearAllBatches = () => {
    setBatches([])
    toast.success("All batches cleared")
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Hash className="h-8 w-8 text-slate-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Generator</h1>
          <p className="text-gray-600">Generate batch numbers and identifiers for brand products, campaigns, and operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Batch Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                onValueChange={updateTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {batchTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Batch Configuration */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Batch Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Batch Name</Label>
                <Input
                  id="name"
                  placeholder="Enter batch name"
                  value={currentBatch.name}
                  onChange={(e) => setCurrentBatch(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter batch description"
                  value={currentBatch.description}
                  onChange={(e) => setCurrentBatch(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[60px]"
                />
              </div>

              <div>
                <Label htmlFor="prefix">Prefix</Label>
                <Input
                  id="prefix"
                  placeholder="BRAND"
                  value={currentBatch.prefix}
                  onChange={(e) => setCurrentBatch(prev => ({ ...prev, prefix: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startNumber">Start Number</Label>
                  <Input
                    id="startNumber"
                    type="number"
                    min="1"
                    value={currentBatch.startNumber}
                    onChange={(e) => setCurrentBatch(prev => ({ ...prev, startNumber: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="count">Count</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="1000"
                    value={currentBatch.count}
                    onChange={(e) => setCurrentBatch(prev => ({ ...prev, count: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="format">Format</Label>
                <Input
                  id="format"
                  placeholder="{{prefix}}-{{number}}"
                  value={currentBatch.format}
                  onChange={(e) => setCurrentBatch(prev => ({ ...prev, format: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {`{{prefix}}`} and {`{{number}}`} as placeholders
                </p>
              </div>

              <div>
                <Label htmlFor="separator">Separator</Label>
                <Input
                  id="separator"
                  placeholder="-"
                  value={currentBatch.separator}
                  onChange={(e) => setCurrentBatch(prev => ({ ...prev, separator: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeDate"
                    checked={currentBatch.includeDate}
                    onChange={(e) => setCurrentBatch(prev => ({ ...prev, includeDate: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="includeDate">Include Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeTimestamp"
                    checked={currentBatch.includeTimestamp}
                    onChange={(e) => setCurrentBatch(prev => ({ ...prev, includeTimestamp: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="includeTimestamp">Include Timestamp</Label>
                </div>
              </div>

              <Button 
                onClick={generateBatch} 
                className="w-full" 
                disabled={!currentBatch.name || isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Hash className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : `Generate ${currentBatch.count || 10} Items`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated Batches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Controls */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Generated Batches ({batches.length})</span>
                <div className="flex gap-2">
                  {batches.length > 0 && (
                    <Button variant="outline" onClick={clearAllBatches}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Batches Grid */}
          {batches.length > 0 ? (
            <div className="space-y-4">
              {batches.map((batch) => (
                <Card key={batch.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-lg">{batch.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(batch.timestamp).toLocaleString()}
                        </div>
                        {batch.description && (
                          <div className="text-sm text-gray-600 mt-1">{batch.description}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBatch(batch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Batch Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Prefix:</span>
                        <div className="font-medium">{batch.prefix}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Count:</span>
                        <div className="font-medium">{batch.count}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Format:</span>
                        <div className="font-medium">{batch.format}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Features:</span>
                        <div className="flex gap-1 mt-1">
                          {batch.includeDate && <Badge variant="outline" className="text-xs">Date</Badge>}
                          {batch.includeTimestamp && <Badge variant="outline" className="text-xs">Time</Badge>}
                        </div>
                      </div>
                    </div>

                    {/* Generated Items Preview */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Generated Items (showing first 10)</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(batch.generatedItems.join('\n'))}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy All
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => downloadBatch(batch)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
                        <div className="text-sm font-mono space-y-1">
                          {batch.generatedItems.slice(0, 10).map((item, index) => (
                            <div key={index} className="text-gray-700">{item}</div>
                          ))}
                          {batch.generatedItems.length > 10 && (
                            <div className="text-gray-500 italic">
                              ... and {batch.generatedItems.length - 10} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Hash className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Batches Generated</h3>
                  <p className="text-gray-600">Generate your first batch using the controls on the left</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
