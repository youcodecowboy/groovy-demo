'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Save, 
  RotateCcw,
  AlertTriangle,
  DollarSign,
  Package,
  Calculator
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material, type MaterialSettings } from '@/types/materials'

interface SettingsPanelProps {
  material: Material
  onSettingsUpdate?: () => void
}

export default function SettingsPanel({ material, onSettingsUpdate }: SettingsPanelProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<MaterialSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const settingsData = await dataAdapter.getMaterialSettings()
      setSettings(settingsData)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)
      await dataAdapter.updateMaterialSettings(settings)
      setHasChanges(false)
      onSettingsUpdate?.()
      
      toast({
        title: "Settings Saved",
        description: "Material settings have been updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetSettings = async () => {
    await loadSettings()
    setHasChanges(false)
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to saved values",
    })
  }

  const updateSetting = <K extends keyof MaterialSettings>(key: K, value: MaterialSettings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load settings</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Settings header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Material Settings</h3>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
          <Button onClick={handleSaveSettings} disabled={!hasChanges || saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* General settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="default-currency">Default Currency</Label>
            <Select 
              value={settings.defaultCurrency} 
              onValueChange={(value) => updateSetting('defaultCurrency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="valuation-method">Valuation Method</Label>
            <Select 
              value={settings.valuationMethod} 
              onValueChange={(value: 'FIFO' | 'AVERAGE') => updateSetting('valuationMethod', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIFO">FIFO - First In, First Out</SelectItem>
                <SelectItem value="AVERAGE">Average Cost</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Method used for inventory valuation and cost calculations
            </p>
          </div>

          <div>
            <Label htmlFor="low-stock-threshold">Low Stock Threshold (%)</Label>
            <Input
              id="low-stock-threshold"
              type="number"
              min="0"
              max="100"
              value={settings.lowStockThreshold}
              onChange={(e) => updateSetting('lowStockThreshold', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of reorder point to trigger low stock alerts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Inventory settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-lot-tracking">Enable Lot Tracking</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Track materials by lot/batch codes for better traceability
              </p>
            </div>
            <Switch
              id="enable-lot-tracking"
              checked={settings.enableLotTracking}
              onCheckedChange={(checked) => updateSetting('enableLotTracking', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-receipt-po">Require PO for Receipts</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Require a purchase order reference when receiving materials
              </p>
            </div>
            <Switch
              id="require-receipt-po"
              checked={settings.requireReceiptPO}
              onCheckedChange={(checked) => updateSetting('requireReceiptPO', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Material-specific settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Material-Specific Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="material-reorder-point">Reorder Point</Label>
            <div className="flex gap-2">
              <Input
                id="material-reorder-point"
                type="number"
                min="0"
                step="0.1"
                placeholder="Reorder quantity"
                defaultValue={material.reorderPoint || ''}
              />
              <Badge variant="outline">{material.defaultUnit}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Minimum quantity before reorder alerts are triggered
            </p>
          </div>

          <div>
            <Label htmlFor="material-supplier-sku">Supplier SKU</Label>
            <Input
              id="material-supplier-sku"
              placeholder="Supplier's product code"
              defaultValue={material.supplierSku || ''}
            />
          </div>

          <div>
            <Label htmlFor="material-lead-time">Lead Time (days)</Label>
            <Input
              id="material-lead-time"
              type="number"
              min="0"
              placeholder="Typical delivery time"
              defaultValue="14"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for automatic reorder suggestions and planning
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alert settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alert Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-low-stock-alerts">Low Stock Alerts</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Get notified when materials fall below reorder point
              </p>
            </div>
            <Switch id="enable-low-stock-alerts" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-usage-alerts">High Usage Alerts</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Get notified when usage patterns exceed normal levels
              </p>
            </div>
            <Switch id="enable-usage-alerts" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-po-alerts">PO Alerts</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Get notified about purchase order status changes
              </p>
            </div>
            <Switch id="enable-po-alerts" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Changes indicator */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
