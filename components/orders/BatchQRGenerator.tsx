"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  QrCode, 
  Printer, 
  Download, 
  Package, 
  CheckCircle, 
  AlertCircle,
  Filter,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import QRCode from "qrcode"

interface Item {
  _id: string
  itemId: string
  metadata?: {
    sku?: string
    size?: string
    color?: string
    style?: string
    brand?: string
  }
  qrCode?: string
  qrPrinted?: boolean
  qrPrintedAt?: number
  qrPrintedBy?: string
}

interface VariantGroup {
  key: string
  sku: string
  size: string
  color: string
  style: string
  brand: string
  items: Item[]
  totalCount: number
  printedCount: number
  unprintedCount: number
}

interface BatchQRGeneratorProps {
  items: Item[]
  onQRGenerated?: (itemIds: string[]) => void
  onQRPrinted?: (itemIds: string[]) => void
}

export default function BatchQRGenerator({ 
  items, 
  onQRGenerated, 
  onQRPrinted 
}: BatchQRGeneratorProps) {
  const { toast } = useToast()
  const generateQRCodes = useMutation(api.items.generateQRCodesForItems)
  const markItemsAsPrinted = useMutation(api.items.markItemsAsPrinted)
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [filterText, setFilterText] = useState("")

  // Group items by variant (SKU + Size + Color)
  const variantGroups = useMemo(() => {
    const groups = new Map<string, VariantGroup>()
    
    items.forEach(item => {
      const metadata = item.metadata || {}
      const sku = metadata.sku || "Unknown SKU"
      const size = metadata.size || "Unknown Size"
      const color = metadata.color || "Unknown Color"
      const style = metadata.style || "Unknown Style"
      const brand = metadata.brand || "Unknown Brand"
      
      const key = `${sku}-${size}-${color}`
      
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          sku,
          size,
          color,
          style,
          brand,
          items: [],
          totalCount: 0,
          printedCount: 0,
          unprintedCount: 0
        })
      }
      
      const group = groups.get(key)!
      group.items.push(item)
      group.totalCount++
      
      if (item.qrPrinted) {
        group.printedCount++
      } else {
        group.unprintedCount++
      }
    })
    
    return Array.from(groups.values())
  }, [items])

  // Filter variants based on search text
  const filteredVariants = useMemo(() => {
    if (!filterText) return variantGroups
    
    return variantGroups.filter(variant => 
      variant.sku.toLowerCase().includes(filterText.toLowerCase()) ||
      variant.size.toLowerCase().includes(filterText.toLowerCase()) ||
      variant.color.toLowerCase().includes(filterText.toLowerCase()) ||
      variant.style.toLowerCase().includes(filterText.toLowerCase()) ||
      variant.brand.toLowerCase().includes(filterText.toLowerCase())
    )
  }, [variantGroups, filterText])

  const handleSelectVariant = (variantKey: string) => {
    const newSelected = new Set(selectedVariants)
    if (newSelected.has(variantKey)) {
      newSelected.delete(variantKey)
    } else {
      newSelected.add(variantKey)
    }
    setSelectedVariants(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedVariants.size === filteredVariants.length) {
      setSelectedVariants(new Set())
    } else {
      setSelectedVariants(new Set(filteredVariants.map(v => v.key)))
    }
  }

  const handleGenerateQRCodes = async () => {
    if (selectedVariants.size === 0) {
      toast({
        title: "No variants selected",
        description: "Please select at least one variant to generate QR codes for.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const selectedItems: Item[] = []
      selectedVariants.forEach(variantKey => {
        const variant = variantGroups.find(v => v.key === variantKey)
        if (variant) {
          selectedItems.push(...variant.items)
        }
      })

      // Generate QR codes for items that don't have them
      const itemsToGenerate = selectedItems.filter(item => !item.qrCode)
      
      if (itemsToGenerate.length === 0) {
        toast({
          title: "No Items Need QR Codes",
          description: "All selected items already have QR codes.",
        })
        return
      }

      // Call the backend to generate QR codes
      const results = await generateQRCodes({
        itemIds: itemsToGenerate.map(item => item._id)
      })

      const successCount = results.filter(r => r.success).length
      const failureCount = results.length - successCount

      if (failureCount > 0) {
        toast({
          title: "Partial Success",
          description: `Generated ${successCount} QR codes, ${failureCount} failed.`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "QR Codes Generated",
          description: `Successfully generated ${successCount} QR codes for selected variants.`,
        })
      }

      onQRGenerated?.(itemsToGenerate.map(item => item._id))
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR codes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const printQRCodes = async () => {
    if (selectedVariants.size === 0) {
      toast({
        title: "No variants selected",
        description: "Please select at least one variant to print QR codes for.",
        variant: "destructive"
      })
      return
    }

    setIsPrinting(true)
    try {
      const selectedItems: Item[] = []
      selectedVariants.forEach(variantKey => {
        const variant = variantGroups.find(v => v.key === variantKey)
        if (variant) {
          selectedItems.push(...variant.items)
        }
      })

      // Filter items that have QR codes
      const itemsWithQR = selectedItems.filter(item => item.qrCode)
      
      if (itemsWithQR.length === 0) {
        toast({
          title: "No QR Codes Found",
          description: "Please generate QR codes first before printing.",
          variant: "destructive"
        })
        return
      }

      // Create print window
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast({
          title: "Print Failed",
          description: "Please allow popups to print QR codes.",
          variant: "destructive"
        })
        return
      }

      // Generate QR code images
      const qrImages = await Promise.all(
        itemsWithQR.map(async (item) => {
          try {
            const qrDataUrl = await QRCode.toDataURL(item.qrCode!, {
              width: 200,
              margin: 2,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            })
            return { item, qrDataUrl }
          } catch (error) {
            console.error(`Failed to generate QR for item ${item.itemId}:`, error)
            return null
          }
        })
      )

      const validQRImages = qrImages.filter(Boolean)

      // Create print content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Codes - Batch Print</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white;
            }
            .qr-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 20px; 
              margin-top: 20px;
            }
            .qr-item { 
              text-align: center; 
              padding: 15px; 
              border: 1px solid #ddd; 
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .qr-code { 
              width: 150px; 
              height: 150px; 
              margin: 0 auto 10px; 
            }
            .item-info { 
              margin-top: 10px; 
              font-size: 12px; 
              color: #666;
            }
            .item-id {
              font-family: monospace;
              font-size: 10px;
              color: #333;
              margin-top: 5px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .summary {
              margin-bottom: 20px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            @media print { 
              .qr-grid { 
                grid-template-columns: repeat(3, 1fr); 
              }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>QR Codes - Batch Print</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="summary">
            <strong>Print Summary:</strong> ${validQRImages.length} QR codes for ${selectedVariants.size} variants
          </div>
          
          <div class="qr-grid">
            ${validQRImages.map(({ item, qrDataUrl }) => `
              <div class="qr-item">
                <img src="${qrDataUrl}" alt="QR Code" class="qr-code" />
                <div class="item-info">
                  <div><strong>SKU:</strong> ${item.metadata?.sku || 'N/A'}</div>
                  <div><strong>Size:</strong> ${item.metadata?.size || 'N/A'}</div>
                  <div><strong>Color:</strong> ${item.metadata?.color || 'N/A'}</div>
                  <div><strong>Style:</strong> ${item.metadata?.style || 'N/A'}</div>
                </div>
                <div class="item-id">${item.itemId}</div>
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `

      printWindow.document.write(printContent)
      printWindow.document.close()
      
      // Wait for images to load then print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)

      // Mark items as printed in the backend
      const printedItemIds = validQRImages.map(({ item }) => item._id)
      
      try {
        await markItemsAsPrinted({
          itemIds: printedItemIds,
          printedBy: "current-user" // In real app, get from auth context
        })
      } catch (error) {
        console.error("Failed to mark items as printed:", error)
      }
      
      toast({
        title: "Print Successful",
        description: `Printed ${validQRImages.length} QR codes. Opening print dialog...`,
      })

      onQRPrinted?.(printedItemIds)
    } catch (error) {
      toast({
        title: "Print Failed",
        description: "Failed to print QR codes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsPrinting(false)
    }
  }

  const downloadQRCodes = async () => {
    if (selectedVariants.size === 0) {
      toast({
        title: "No variants selected",
        description: "Please select at least one variant to download QR codes for.",
        variant: "destructive"
      })
      return
    }

    try {
      const selectedItems: Item[] = []
      selectedVariants.forEach(variantKey => {
        const variant = variantGroups.find(v => v.key === variantKey)
        if (variant) {
          selectedItems.push(...variant.items)
        }
      })

      const itemsWithQR = selectedItems.filter(item => item.qrCode)
      
      if (itemsWithQR.length === 0) {
        toast({
          title: "No QR Codes Found",
          description: "Please generate QR codes first before downloading.",
          variant: "destructive"
        })
        return
      }

      // Create a zip file with QR codes (simplified for demo)
      toast({
        title: "Download Started",
        description: `Preparing ${itemsWithQR.length} QR codes for download...`,
      })

      // In a real app, this would create and download a zip file
      console.log("Downloading QR codes for items:", itemsWithQR.map(item => item.itemId))
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR codes. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Batch QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="filter" className="text-sm font-medium">Filter Variants</Label>
            <div className="relative mt-1">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="filter"
                placeholder="Search by SKU, size, color, style, or brand..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterText("")}
            disabled={!filterText}
          >
            Clear
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSelectAll}
            variant="outline"
            size="sm"
          >
            {selectedVariants.size === filteredVariants.length ? "Deselect All" : "Select All"}
          </Button>
          
          <div className="flex-1" />
          
          <Button
            onClick={handleGenerateQRCodes}
            disabled={selectedVariants.size === 0 || isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <QrCode className="w-4 h-4 mr-2" />
            )}
            Generate QR Codes
          </Button>
          
          <Button
            onClick={printQRCodes}
            disabled={selectedVariants.size === 0 || isPrinting}
            variant="outline"
          >
            {isPrinting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Printer className="w-4 h-4 mr-2" />
            )}
            Print QR Codes
          </Button>
          
          <Button
            onClick={downloadQRCodes}
            disabled={selectedVariants.size === 0}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Variants List */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">
            Variants ({filteredVariants.length} found)
          </div>
          
          {filteredVariants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No variants found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVariants.map((variant) => (
                <div
                  key={variant.key}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedVariants.has(variant.key)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectVariant(variant.key)}
                >
                  <Checkbox
                    checked={selectedVariants.has(variant.key)}
                    onChange={() => handleSelectVariant(variant.key)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{variant.sku}</div>
                        <div className="text-sm text-gray-600">
                          {variant.style} • {variant.brand}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {variant.size}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {variant.color}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {variant.totalCount} items
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {variant.unprintedCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {variant.unprintedCount} need QR
                      </Badge>
                    )}
                    {variant.printedCount > 0 && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {variant.printedCount} printed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
