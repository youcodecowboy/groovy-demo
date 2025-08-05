"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    ArrowLeft, Printer,
    Download,
    Search, Clock,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Package,
    Calendar,
    User
} from "lucide-react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { useParams, useRouter } from "next/navigation"
import QRCode from "qrcode"
import Link from "next/link"

export default function PODetails() {
  const params = useParams()
  const router = useRouter()
  const poId = params.poId as string
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isPrinting, setIsPrinting] = useState(false)

  // Get the purchase order details
  const purchaseOrder = useQuery(api.purchaseOrders.getPurchaseOrder, { poId: poId as any })
  
  // Get all items for this PO
  const items = useQuery(api.items.listItemsByPO, { purchaseOrderId: poId as any })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      case "accepted":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Accepted
        </Badge>
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Active</Badge>
      case "paused":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
      case "error":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredItems = items?.filter(item => 
    item.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.metadata?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(item => item._id))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const generateQRCode = async (qrData: string) => {
    try {
      const url = await QRCode.toDataURL(qrData)
      return url
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  const printQRCodes = async () => {
    if (selectedItems.length === 0) return

    setIsPrinting(true)
    try {
      const selectedItemsData = items?.filter(item => selectedItems.includes(item._id)) || []
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) return

      let printContent = `
        <html>
          <head>
            <title>QR Codes - PO ${purchaseOrder?.poNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .qr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
              .qr-item { text-align: center; padding: 10px; border: 1px solid #ccc; }
              .qr-code { width: 150px; height: 150px; margin: 0 auto; }
              .item-info { margin-top: 10px; font-size: 12px; }
              @media print { .qr-grid { grid-template-columns: repeat(3, 1fr); } }
            </style>
          </head>
          <body>
            <h1>QR Codes - Purchase Order ${purchaseOrder?.poNumber}</h1>
            <div class="qr-grid">
      `

      for (const item of selectedItemsData) {
        const qrUrl = await generateQRCode(item.qrCode || item.itemId)
        if (qrUrl) {
          printContent += `
            <div class="qr-item">
              <img src="${qrUrl}" class="qr-code" alt="QR Code" />
              <div class="item-info">
                <strong>${item.itemId}</strong><br>
                ${item.metadata?.sku || 'N/A'}<br>
                ${item.metadata?.description || 'N/A'}
              </div>
            </div>
          `
        }
      }

      printContent += `
            </div>
          </body>
        </html>
      `

      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    } catch (error) {
      console.error('Error printing QR codes:', error)
    } finally {
      setIsPrinting(false)
    }
  }

  const downloadQRCode = async (item: any) => {
    const qrUrl = await generateQRCode(item.qrCode || item.itemId)
    if (qrUrl) {
      const link = document.createElement('a')
      link.href = qrUrl
      link.download = `qr-${item.itemId}.png`
      link.click()
    }
  }

  if (!purchaseOrder) {
    return (
      <AdminSidebar>
        <div className="flex-1 space-y-6 p-6">
          <div className="text-center py-12">
            <div className="text-lg">Loading purchase order...</div>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Order Details</h1>
              <p className="text-gray-600">PO {purchaseOrder.poNumber}</p>
            </div>
          </div>
          {getStatusBadge(purchaseOrder.status)}
        </div>

        {/* PO Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-lg font-semibold">${purchaseOrder.totalValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-lg font-semibold">{items?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Requested Delivery</p>
                <p className="text-lg font-semibold">
                  {new Date(purchaseOrder.requestedDeliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Production Items</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                </Button>
                {selectedItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={printQRCodes}
                    disabled={isPrinting}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    {isPrinting ? 'Printing...' : `Print ${selectedItems.length} QR Codes`}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items by SKU or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className={`border rounded-lg transition-colors ${
                    selectedItems.includes(item._id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-lg">{item.itemId}</p>
                            {getItemStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            SKU: {item.metadata?.sku || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadQRCode(item)
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          QR
                        </Button>
                        <Link href={`/floor/items/${item.itemId}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Item Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Description</p>
                          <p className="text-gray-600">{item.metadata?.description || 'No description'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Started</p>
                          <p className="text-gray-600">
                            {new Date(item.startedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Assigned To</p>
                          <p className="text-gray-600">{item.assignedTo || 'Unassigned'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Last Updated</p>
                          <p className="text-gray-600">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Metadata */}
                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">Additional Details</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.metadata).map(([key, value]) => {
                            if (key === 'sku' || key === 'description') return null
                            return (
                              <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {key}: {String(value)}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items found matching your search.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  )
} 