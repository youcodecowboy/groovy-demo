"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Zap, Users, Package, Building2, FileText } from "lucide-react";

export default function TestStarWarsSeed() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const seedStarWarsData = useMutation(api.starwars_seed.seedStarWarsData);

  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);
    setResult(null);

    try {
      const result = await seedStarWarsData();
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Star Wars Data Seeding</h1>
          <Star className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-lg text-muted-foreground">
          Seed the database with Skywalker Textiles themed data
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Skywalker Textiles Demo Data
          </CardTitle>
          <CardDescription>
            This will clear all existing data and create a comprehensive Star Wars themed dataset including:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">8 Star Wars Users</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">3 Production Workflows</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">180+ Items</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">6 Production Locations</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <FileText className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">3 Purchase Orders</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
              <Star className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">3 Star Wars Brands</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning</h4>
            <p className="text-sm text-yellow-700">
              This action will <strong>permanently delete all existing data</strong> and replace it with Star Wars themed demo data. 
              This cannot be undone!
            </p>
          </div>

          <div className="mt-6">
            <Button 
              onClick={handleSeed} 
              disabled={isSeeding}
              size="lg"
              className="w-full"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Star Wars Data...
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Seed Star Wars Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Seeding Complete!
            </CardTitle>
            <CardDescription>
              Star Wars themed data has been successfully seeded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.summary.users}</div>
                  <div className="text-sm text-blue-600">Users</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.summary.workflows}</div>
                  <div className="text-sm text-green-600">Workflows</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{result.summary.items}</div>
                  <div className="text-sm text-purple-600">Items</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{result.summary.locations}</div>
                  <div className="text-sm text-orange-600">Locations</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Created Workflows:</h4>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2">Jedi Robe Production</Badge>
                  <Badge variant="outline" className="mr-2">Rebel Pilot Uniform Production</Badge>
                  <Badge variant="outline" className="mr-2">Stormtrooper Armor Production</Badge>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Created Brands:</h4>
                <div className="space-y-2">
                  <Badge variant="secondary" className="mr-2">Jedi Order</Badge>
                  <Badge variant="secondary" className="mr-2">Rebel Alliance</Badge>
                  <Badge variant="secondary" className="mr-2">Galactic Empire</Badge>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  {result.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
