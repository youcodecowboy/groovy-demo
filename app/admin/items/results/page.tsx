"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRDisplay } from "@/components/ui/qr-display";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ArrowLeft, Printer, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface GeneratedItem {
  _id: string;
  id: string;
  sku: string;
  qrData: string;
  currentStageId: string;
  workflowId: string;
  status: string;
  metadata: {
    brand?: string;
    fabricCode?: string;
    color?: string;
    size?: string;
    style?: string;
    season?: string;
    notes?: string;
  };
}

export default function ItemResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Get items from URL params (we'll pass them as JSON string)
  const itemsParam = searchParams.get("items");
  const items: GeneratedItem[] = itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [];

  const handleBack = () => {
    router.push("/admin/items");
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCopyQR = async (qrData: string) => {
    try {
      await navigator.clipboard.writeText(qrData);
      toast({
        title: "Copied!",
        description: "QR code data copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy QR code data",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
    if (selectedItemsData.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to print",
        variant: "destructive",
      });
      return;
    }

    // Create print window with QR codes
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Generated Items - QR Codes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .item { page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #ccc; padding: 15px; }
            .item-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .qr-container { text-align: center; margin: 10px 0; }
            .metadata { font-size: 12px; color: #666; margin-top: 10px; }
            @media print {
              .item { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Generated Items - QR Codes</h1>
          ${selectedItemsData.map(item => `
            <div class="item">
              <div class="item-header">
                <h3>${item.sku}</h3>
                <span>${item.id}</span>
              </div>
              <div class="qr-container">
                <img src="data:image/png;base64,${item.qrData}" alt="QR Code" style="width: 200px; height: 200px;" />
              </div>
              <div class="metadata">
                <p><strong>Brand:</strong> ${item.metadata.brand || 'N/A'}</p>
                <p><strong>Style:</strong> ${item.metadata.style || 'N/A'}</p>
                <p><strong>Color:</strong> ${item.metadata.color || 'N/A'}</p>
                <p><strong>Size:</strong> ${item.metadata.size || 'N/A'}</p>
                <p><strong>Season:</strong> ${item.metadata.season || 'N/A'}</p>
              </div>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (items.length === 0) {
    return (
      <AdminSidebar>
        <div className="flex-1 h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Items Generated</h2>
            <p className="text-gray-600 mb-6">No items were found in the results.</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Item Generator
            </Button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="flex-1 h-full overflow-hidden">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generated Items</h1>
              <p className="text-gray-600">
                {items.length} items generated successfully
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSelectAll}>
                {selectedItems.length === items.length ? "Deselect All" : "Select All"}
              </Button>
              <Button onClick={handlePrint} disabled={selectedItems.length === 0}>
                <Printer className="w-4 h-4 mr-2" />
                Print QR Codes
              </Button>
              <Button onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card 
                key={item.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedItems.includes(item.id) ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
                onClick={() => handleSelectItem(item.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.sku}</CardTitle>
                      <p className="text-sm text-gray-600 font-mono">{item.id}</p>
                    </div>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <QRDisplay value={item.qrData} size={120} />
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-sm">
                    {item.metadata.brand && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Brand:</span>
                        <span>{item.metadata.brand}</span>
                      </div>
                    )}
                    {item.metadata.style && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Style:</span>
                        <span>{item.metadata.style}</span>
                      </div>
                    )}
                    {item.metadata.color && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Color:</span>
                        <span>{item.metadata.color}</span>
                      </div>
                    )}
                    {item.metadata.size && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Size:</span>
                        <span>{item.metadata.size}</span>
                      </div>
                    )}
                    {item.metadata.season && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Season:</span>
                        <span>{item.metadata.season}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyQR(item.qrData);
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy QR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
} 