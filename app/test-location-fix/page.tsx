"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { CheckCircle, AlertCircle, Package, MapPin } from "lucide-react";

export default function TestLocationFixPage() {
  const locations = useQuery(api.locations.getAll);
  const items = useQuery(api.items.getAll);
  const locationHistory = useQuery(api.location_history.getRecent, { limit: 5 });

  if (!locations || !items || !locationHistory) {
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Location System Fix Test</h1>
        <p className="text-gray-600">Verifying the location history system is working</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Location History</p>
                <p className="text-2xl font-bold">{locationHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            System Status
          </CardTitle>
          <CardDescription>
            Verification of location system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Locations API</span>
              <Badge variant="secondary">Working</Badge>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Items API</span>
              <Badge variant="secondary">Working</Badge>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Location History API</span>
              <Badge variant="secondary">Working</Badge>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Module Name Fix</span>
              <Badge variant="secondary">Fixed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {locationHistory.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Location History</CardTitle>
            <CardDescription>
              Latest {locationHistory.length} location movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {locationHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{entry.itemId}</span>
                    <span className="text-gray-500">→</span>
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{entry.toLocationId}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.movedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {locationHistory.length === 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              No Location History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              No location movements have been recorded yet. This is normal if you haven't moved any items between locations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 