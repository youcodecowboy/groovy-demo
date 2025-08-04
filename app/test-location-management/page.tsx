"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { LocationScanner } from "../../components/ui/location-scanner";
import { Plus, MapPin, Package, QrCode, Settings, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function TestLocationManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    description: "",
    type: "bin" as "bin" | "shelf" | "rack" | "area" | "zone",
    qrCode: "",
    capacity: 1,
  });

  const locations = useQuery(api.locations.getAll);
  const items = useQuery(api.items.getAll);
  const createLocation = useMutation(api.locations.create);
  const moveToLocation = useMutation(api.items.moveToLocation);

  const handleCreateLocation = async () => {
    try {
      await createLocation({
        name: newLocation.name,
        description: newLocation.description || undefined,
        type: newLocation.type,
        qrCode: newLocation.qrCode,
        capacity: newLocation.capacity,
        createdBy: "test-user",
      });

      setNewLocation({
        name: "",
        description: "",
        type: "bin",
        qrCode: "",
        capacity: 1,
      });
      setIsCreateDialogOpen(false);
      toast.success("Location created successfully");
    } catch (error) {
      toast.error("Failed to create location");
      console.error(error);
    }
  };

  const handleMoveItem = async (itemId: string, locationId: string) => {
    try {
      await moveToLocation({
        itemId,
        locationId,
        movedBy: "test-user",
        notes: "Moved via test interface",
      });
      toast.success("Item moved successfully");
    } catch (error) {
      toast.error("Failed to move item");
      console.error(error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bin":
        return <Package className="h-4 w-4" />;
      case "shelf":
        return <MapPin className="h-4 w-4" />;
      case "rack":
        return <Settings className="h-4 w-4" />;
      case "area":
        return <MapPin className="h-4 w-4" />;
      case "zone":
        return <MapPin className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bin":
        return "bg-blue-100 text-blue-800";
      case "shelf":
        return "bg-green-100 text-green-800";
      case "rack":
        return "bg-purple-100 text-purple-800";
      case "area":
        return "bg-orange-100 text-orange-800";
      case "zone":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!locations || !items) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Location Management Test</h1>
          <p className="text-gray-600">Test the location management system</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Location</DialogTitle>
              <DialogDescription>
                Add a new location with QR code for inventory tracking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  placeholder="e.g., Bin A1, Shelf 3"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newLocation.description}
                  onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newLocation.type}
                  onValueChange={(value: "bin" | "shelf" | "rack" | "area" | "zone") =>
                    setNewLocation({ ...newLocation, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bin">Bin</SelectItem>
                    <SelectItem value="shelf">Shelf</SelectItem>
                    <SelectItem value="rack">Rack</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                    <SelectItem value="zone">Zone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qrCode">QR Code</Label>
                <Input
                  id="qrCode"
                  value={newLocation.qrCode}
                  onChange={(e) => setNewLocation({ ...newLocation, qrCode: e.target.value })}
                  placeholder="Enter QR code data"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newLocation.capacity}
                  onChange={(e) => setNewLocation({ ...newLocation, capacity: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLocation}>Create Location</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Scanner */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Location Scanner Test
              </CardTitle>
              <CardDescription>
                Test scanning items and locations to move items between locations.
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
        </div>

        {/* Manual Item Movement */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Manual Item Movement
              </CardTitle>
              <CardDescription>
                Manually move items between locations for testing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.itemId}</div>
                        <div className="text-sm text-gray-600">
                          Current Location: {item.currentLocationId || "None"}
                        </div>
                      </div>
                      <Select
                        value={item.currentLocationId || ""}
                        onValueChange={(locationId) => {
                          if (locationId) {
                            handleMoveItem(item._id, locationId);
                          }
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Location</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location._id} value={location._id}>
                              {location.name} ({location.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Locations List */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              All Locations ({locations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <Card key={location._id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(location.type)}
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                      </div>
                      <Badge className={getTypeColor(location.type)}>
                        {location.type}
                      </Badge>
                    </div>
                    <CardDescription>
                      {location.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <QrCode className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{location.qrCode}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {location.currentOccupancy || 0} / {location.capacity || "∞"} items
                        </span>
                      </div>
                      {location.assignedStageId && (
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Assigned to stage: {location.assignedStageId}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 