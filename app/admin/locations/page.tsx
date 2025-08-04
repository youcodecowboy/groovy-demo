"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Plus, MapPin, Package, QrCode, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "../../../components/layout/admin-sidebar";
import { EnhancedLocationCreator } from "@/components/admin/enhanced-location-creator";
import { EnhancedLocationDetail } from "@/components/admin/enhanced-location-detail";

export default function LocationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    description: "",
    type: "bin" as "bin" | "shelf" | "rack" | "area" | "zone",
    qrCode: "",
    capacity: 1,
  });

  const locations = useQuery(api.locations.getAll);
  const workflows = useQuery(api.workflows.getAll);
  const createLocation = useMutation(api.locations.create);
  const assignToStage = useMutation(api.locations.assignToStage);
  const unassignFromStage = useMutation(api.locations.unassignFromStage);

  const handleCreateLocation = async () => {
    try {
      await createLocation({
        name: newLocation.name,
        description: newLocation.description || undefined,
        type: newLocation.type,
        qrCode: newLocation.qrCode,
        capacity: newLocation.capacity,
        createdBy: "admin", // TODO: Get actual user ID
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

  const getCapacityStatus = (location: any) => {
    if (!location.capacity) return { status: "unlimited", color: "text-gray-600" };
    const occupancy = location.currentOccupancy || 0;
    const percentage = (occupancy / location.capacity) * 100;
    
    if (percentage >= 100) return { status: "full", color: "text-red-600" };
    if (percentage >= 80) return { status: "near-full", color: "text-orange-600" };
    return { status: "available", color: "text-green-600" };
  };

  const handleAssignToStage = async (locationId: string, stageId: string) => {
    try {
      await assignToStage({
        locationId,
        stageId,
        assignedBy: "admin",
      });
      toast.success("Location assigned to stage");
    } catch (error) {
      toast.error("Failed to assign location to stage");
      console.error(error);
    }
  };

  const handleUnassignFromStage = async (locationId: string) => {
    try {
      await unassignFromStage({
        locationId,
        unassignedBy: "admin",
      });
      toast.success("Location unassigned from stage");
    } catch (error) {
      toast.error("Failed to unassign location from stage");
      console.error(error);
    }
  };

  if (!locations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminSidebar>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Location Management</h1>
            <p className="text-gray-600">Manage inventory locations and QR codes</p>
          </div>
        </div>

        {/* Enhanced Location Creator */}
        <div className="mb-8">
          <EnhancedLocationCreator />
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card 
            key={location._id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedLocation(location);
              setIsDetailDialogOpen(true);
            }}
          >
            <CardHeader>
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
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <QrCode className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{location.qrCode}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className={`text-sm ${getCapacityStatus(location).color}`}>
                    {location.currentOccupancy || 0} / {location.capacity || "∞"} items
                  </span>
                  {location.capacity && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      getCapacityStatus(location).status === "full" ? "bg-red-100 text-red-700" :
                      getCapacityStatus(location).status === "near-full" ? "bg-orange-100 text-orange-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {getCapacityStatus(location).status}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {location.assignedStageId ? `Assigned to: ${location.assignedStageId}` : "No stage assignment"}
                    </span>
                  </div>
                  {workflows && (
                    <div className="flex gap-2">
                      {!location.assignedStageId ? (
                        <Select
                          onValueChange={(stageId) => handleAssignToStage(location._id, stageId)}
                        >
                          <SelectTrigger className="w-32 h-6 text-xs">
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {workflows.flatMap(workflow => 
                              workflow.stages.map(stage => ({
                                id: stage.id,
                                name: `${workflow.name} - ${stage.name}`,
                              }))
                            ).map(stage => (
                              <SelectItem key={stage.id} value={stage.id}>
                                {stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnassignFromStage(location._id)}
                          className="h-6 text-xs"
                        >
                          Unassign
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Created by: {location.createdBy}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first location to start tracking inventory.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Location
          </Button>
        </div>
      )}

      {/* Enhanced Location Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLocation && (
            <EnhancedLocationDetail 
              location={selectedLocation}
              onClose={() => setIsDetailDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminSidebar>
  );
} 