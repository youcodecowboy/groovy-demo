"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AdminSidebar } from "../../../components/layout/admin-sidebar";
import { MapPin, Package, ArrowRight, Calendar, User, Clock } from "lucide-react";

export default function LocationHistoryPage() {
  const [selectedItem, setSelectedItem] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");

  const locations = useQuery(api.locations.getAll);
  const items = useQuery(api.items.getAll);
  const locationHistory = useQuery(api.location_history.getRecent, { limit: 100 });

  const getTimeRangeDates = () => {
    const now = Date.now();
    switch (timeRange) {
      case "24h":
        return { start: now - 24 * 60 * 60 * 1000, end: now };
      case "7d":
        return { start: now - 7 * 24 * 60 * 60 * 1000, end: now };
      case "30d":
        return { start: now - 30 * 24 * 60 * 60 * 1000, end: now };
      default:
        return { start: 0, end: now };
    }
  };

  const filteredHistory = locationHistory?.filter(entry => {
    if (selectedItem !== "all" && entry.itemId !== selectedItem) return false;
    if (selectedLocation !== "all" && entry.toLocationId !== selectedLocation) return false;
    
    const { start } = getTimeRangeDates();
    return entry.movedAt >= start;
  }) || [];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLocationName = (locationId: string) => {
    return locations?.find(l => l._id === locationId)?.name || locationId;
  };

  const getItemName = (itemId: string) => {
    return items?.find(i => i.itemId === itemId)?.itemId || itemId;
  };

  if (!locationHistory || !locations || !items) {
    return (
      <AdminSidebar>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading location history...</p>
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Location History</h1>
            <p className="text-gray-600">Track item movements between locations</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Item</label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="All items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All items</SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.itemId} value={item.itemId}>
                        {item.itemId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Moves</p>
                  <p className="text-2xl font-bold">{filteredHistory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Unique Items</p>
                  <p className="text-2xl font-bold">
                    {new Set(filteredHistory.map(h => h.itemId)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-2xl font-bold">
                    {new Set(filteredHistory.map(h => h.movedBy)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Today's Moves</p>
                  <p className="text-2xl font-bold">
                    {filteredHistory.filter(h => {
                      const hoursAgo = (Date.now() - h.movedAt) / (1000 * 60 * 60);
                      return hoursAgo <= 24;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Movement History ({filteredHistory.length} entries)
            </CardTitle>
            <CardDescription>
              Recent item movements between locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{getItemName(entry.itemId)}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{getLocationName(entry.toLocationId)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{entry.movedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(entry.movedAt)}</span>
                    </div>
                    {entry.notes && (
                      <Badge variant="outline" className="text-xs">
                        {entry.notes}
                      </Badge>
                    )}
                    {entry.metadata?.autoAssigned && (
                      <Badge variant="secondary" className="text-xs">
                        Auto
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredHistory.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No movement history</h3>
                  <p className="text-gray-600">
                    No item movements match your current filters.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
} 