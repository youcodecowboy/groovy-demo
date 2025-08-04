"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { LocationScanner } from "../../components/ui/location-scanner";
import { Plus, MapPin, Package, QrCode, Settings, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function TestLocationSystemPage() {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const locations = useQuery(api.locations.getAll);
  const items = useQuery(api.items.getAll);
  const workflows = useQuery(api.workflows.getAll);
  const locationHistory = useQuery(api.location_history.getRecent, { limit: 10 });
  const createLocation = useMutation(api.locations.create);
  const moveToLocation = useMutation(api.items.moveToLocation);

  const handleCreateTestLocation = async () => {
    try {
      await createLocation({
        name: `Test Bin ${Date.now()}`,
        description: "Test location for system verification",
        type: "bin",
        qrCode: `TEST-LOC-${Date.now()}`,
        capacity: 5,
        createdBy: "test-user",
      });
      toast.success("Test location created");
    } catch (error) {
      toast.error("Failed to create test location");
      console.error(error);
    }
  };

  const handleMoveItem = async () => {
    if (!selectedItem || !selectedLocation) {
      toast.error("Please select both item and location");
      return;
    }

    try {
      await moveToLocation({
        itemId: selectedItem,
        locationId: selectedLocation,
        movedBy: "test-user",
        notes: "Test move via UI",
      });
      toast.success("Item moved successfully");
      setSelectedItem("");
      setSelectedLocation("");
    } catch (error) {
      toast.error("Failed to move item");
      console.error(error);
    }
  };

  if (!locations || !items || !workflows || !locationHistory) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading test data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Location System Test</h1>
          <p className="text-gray-600">Test the complete location management system</p>
        </div>
        <Button onClick={handleCreateTestLocation}>
          <Plus className="h-4 w-4 mr-2" />
          Create Test Location
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Scanner Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Scanner Test
            </CardTitle>
            <CardDescription>
              Test scanning items and locations to move items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationScanner 
              onScanComplete={(itemId, locationId) => {
                toast.success(`Item ${itemId} moved to location ${locationId}`);
              }}
            />
          </CardContent>
        </Card>

        {/* Manual Move Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Manual Move Test
            </CardTitle>
            <CardDescription>
              Manually move items between locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.itemId} - {item.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location._id} value={location._id}>
                      {location.name} ({location.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleMoveItem} disabled={!selectedItem || !selectedLocation}>
              Move Item
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Locations</p>
                <p className="text-2xl font-bold">{locations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Workflows</p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Recent Moves</p>
                <p className="text-2xl font-bold">{locationHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Location History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Location History
          </CardTitle>
          <CardDescription>
            Latest item movements in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {locationHistory.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{entry.itemId}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{entry.toLocationId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{entry.movedBy}</span>
                  <span>{new Date(entry.movedAt).toLocaleString()}</span>
                  {entry.metadata?.autoAssigned && (
                    <Badge variant="secondary" className="text-xs">
                      Auto
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {locationHistory.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent movements</h3>
                <p className="text-gray-600">
                  Start moving items to see location history.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 