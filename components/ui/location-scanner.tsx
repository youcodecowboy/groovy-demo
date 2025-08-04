"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { QrScanner } from "./qr-scanner";
import { Package, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface LocationScannerProps {
  onScanComplete?: (itemId: string, locationId: string) => void;
  className?: string;
}

export function LocationScanner({ onScanComplete, className }: LocationScannerProps) {
  const [scanMode, setScanMode] = useState<"item" | "location">("item");
  const [scannedItem, setScannedItem] = useState<any>(null);
  const [scannedLocation, setScannedLocation] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const getItemByQrCode = useMutation(api.items.getByItemId);
  const getLocationByQrCode = useMutation(api.locations.getByQrCode);
  const moveToLocation = useMutation(api.items.moveToLocation);

  const handleQrCodeScanned = async (qrData: string) => {
    if (scanMode === "item") {
      // Try to find item by QR code
      try {
        const item = await getItemByQrCode({ itemId: qrData });
        if (item) {
          setScannedItem(item);
          setScanMode("location");
          toast.success(`Item found: ${item.itemId}`);
        } else {
          toast.error("Item not found");
        }
      } catch (error) {
        toast.error("Error scanning item");
        console.error(error);
      }
    } else {
      // Try to find location by QR code
      try {
        const location = await getLocationByQrCode({ qrCode: qrData });
        if (location) {
          setScannedLocation(location);
          toast.success(`Location found: ${location.name}`);
          
          // Move item to location
          if (scannedItem) {
            try {
              await moveToLocation({
                itemId: scannedItem._id,
                locationId: location._id,
                movedBy: "operator", // TODO: Get actual user ID
                notes: `Moved via QR scanner`,
              });
              
              toast.success(`Item ${scannedItem.itemId} moved to ${location.name}`);
              
              // Reset for next scan
              setScannedItem(null);
              setScannedLocation(null);
              setScanMode("item");
              
              // Call completion callback
              if (onScanComplete) {
                onScanComplete(scannedItem.itemId, location._id);
              }
            } catch (error) {
              toast.error("Failed to move item to location");
              console.error(error);
            }
          }
        } else {
          toast.error("Location not found");
        }
      } catch (error) {
        toast.error("Error scanning location");
        console.error(error);
      }
    }
  };

  const resetScan = () => {
    setScannedItem(null);
    setScannedLocation(null);
    setScanMode("item");
    setIsScanning(false);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Scanner
          </CardTitle>
          <CardDescription>
            Scan an item QR code, then scan a location QR code to move the item.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scan Mode Indicator */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              scanMode === "item" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
            }`}>
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Scan Item</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              scanMode === "location" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            }`}>
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Scan Location</span>
            </div>
          </div>

          {/* Scanned Item Display */}
          {scannedItem && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Item Scanned:</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-sm">
                  <span className="font-medium">ID:</span> {scannedItem.itemId}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Status:</span> 
                  <Badge variant="outline" className="ml-2">
                    {scannedItem.status}
                  </Badge>
                </div>
                {scannedItem.currentLocationId && (
                  <div className="text-sm">
                    <span className="font-medium">Current Location:</span> {scannedItem.currentLocationId}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scanned Location Display */}
          {scannedLocation && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Location Scanned:</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Name:</span> {scannedLocation.name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Type:</span> 
                  <Badge variant="outline" className="ml-2">
                    {scannedLocation.type}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Occupancy:</span> {scannedLocation.currentOccupancy || 0} / {scannedLocation.capacity || "∞"}
                </div>
              </div>
            </div>
          )}

          {/* QR Scanner */}
          <div className="relative">
            {!isScanning ? (
              <Button 
                onClick={() => setIsScanning(true)}
                className="w-full"
                size="lg"
              >
                Start Scanning
              </Button>
            ) : (
              <div className="space-y-4">
                <QrScanner
                  onResult={handleQrCodeScanned}
                  className="w-full h-64 rounded-lg overflow-hidden"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsScanning(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Stop Scanning
                  </Button>
                  <Button 
                    onClick={resetScan}
                    variant="outline"
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>First, scan the item QR code to identify the item</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Then, scan the location QR code to move the item</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 