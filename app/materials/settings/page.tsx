'use client'

import { ArrowLeft, Settings, Package, Ruler, Tag, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MaterialSettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Material Settings</h1>
          <p className="text-muted-foreground">
            Configure units, conversions, categories, and system defaults
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Units & Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage measurement units and conversion factors
            </p>
            <Button variant="outline" className="w-full">
              Configure Units
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Organize materials with custom categories
            </p>
            <Button variant="outline" className="w-full">
              Manage Categories
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Attribute Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create reusable attribute sets for different material types
            </p>
            <Button variant="outline" className="w-full">
              Manage Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Reorder Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Set global defaults and alert thresholds
            </p>
            <Button variant="outline" className="w-full">
              Configure Rules
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-12 text-muted-foreground">
        <Settings className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Settings Panel Coming Soon</h3>
        <p>
          Full configuration options will be available in the next update.
        </p>
      </div>
    </div>
  )
}