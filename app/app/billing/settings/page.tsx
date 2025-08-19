'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertTriangle, 
  DollarSign, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Bell,
  Mail,
  Building2,
  FileText,
  Calendar
} from 'lucide-react'
import { AlertsTable } from '@/components/billing/alerts-table'
import { AlertModal } from '@/components/billing/alert-modal'
import { useToast } from '@/hooks/use-toast'

// Mock data
const mockSettingsData = {
  alerts: [
    { 
      id: '1', 
      type: 'cost', 
      threshold: 15000, 
      enabled: true, 
      channels: ['in-app', 'email'],
      message: 'Cost threshold exceeded'
    },
    { 
      id: '2', 
      type: 'usage', 
      threshold: 1500, 
      enabled: true, 
      channels: ['in-app'],
      message: 'Usage threshold approaching'
    },
    { 
      id: '3', 
      type: 'cost', 
      threshold: 20000, 
      enabled: false, 
      channels: ['email'],
      message: 'High cost warning'
    }
  ],
  plan: {
    name: 'Standard Plan',
    perRecordCents: 10, // $0.10
    currency: 'USD',
    billingCycle: 'monthly'
  },
  taxProfile: {
    companyName: 'Acme Manufacturing Co.',
    address: {
      line1: '123 Factory Street',
      line2: 'Suite 100',
      city: 'Manufacturing City',
      state: 'CA',
      postalCode: '90210',
      country: 'US'
    },
    taxId: '12-3456789',
    taxExempt: false
  }
}

export default function BillingSettingsPage() {
  const { toast } = useToast()
  const [settingsData, setSettingsData] = useState(mockSettingsData)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<any>(null)
  const [isEditingTaxProfile, setIsEditingTaxProfile] = useState(false)

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const handleCreateAlert = () => {
    setEditingAlert(null)
    setIsAlertModalOpen(true)
  }

  const handleEditAlert = (alert: any) => {
    setEditingAlert(alert)
    setIsAlertModalOpen(true)
  }

  const handleDeleteAlert = (alertId: string) => {
    setSettingsData(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId)
    }))
    
    toast({
      title: "Alert Deleted",
      description: "Alert has been removed",
    })
  }

  const handleSaveAlert = (alert: any) => {
    if (editingAlert) {
      // Update existing alert
      setSettingsData(prev => ({
        ...prev,
        alerts: prev.alerts.map(a => a.id === editingAlert.id ? alert : a)
      }))
    } else {
      // Create new alert
      const newAlert = {
        ...alert,
        id: Date.now().toString()
      }
      setSettingsData(prev => ({
        ...prev,
        alerts: [...prev.alerts, newAlert]
      }))
    }
    
    setIsAlertModalOpen(false)
    setEditingAlert(null)
    
    toast({
      title: editingAlert ? "Alert Updated" : "Alert Created",
      description: "Alert settings have been saved",
    })
  }

  const handleToggleAlert = (alertId: string) => {
    setSettingsData(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, enabled: !alert.enabled }
          : alert
      )
    }))
  }

  const handleSaveTaxProfile = (profile: any) => {
    setSettingsData(prev => ({
      ...prev,
      taxProfile: profile
    }))
    setIsEditingTaxProfile(false)
    
    toast({
      title: "Tax Profile Updated",
      description: "Tax information has been saved",
    })
  }

  const handleClosePeriod = () => {
    toast({
      title: "Period Closed",
      description: "Current billing period has been closed and invoice generated",
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Settings</h1>
          <p className="text-muted-foreground">
            Configure alerts, manage your plan, and update billing information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Usage Alerts
              </CardTitle>
              <Button size="sm" onClick={handleCreateAlert}>
                <Plus className="w-4 h-4 mr-2" />
                Add Alert
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AlertsTable
              alerts={settingsData.alerts}
              onEditAlert={handleEditAlert}
              onDeleteAlert={handleDeleteAlert}
              onToggleAlert={handleToggleAlert}
            />
          </CardContent>
        </Card>

        {/* Plan & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Plan & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Plan</Label>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-semibold">{settingsData.plan.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(settingsData.plan.perRecordCents)} per record
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Billing Cycle</Label>
              <div className="p-3 bg-muted rounded-lg">
                {settingsData.plan.billingCycle.charAt(0).toUpperCase() + settingsData.plan.billingCycle.slice(1)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Currency</Label>
              <div className="p-3 bg-muted rounded-lg">
                {settingsData.plan.currency}
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Contact Sales for Plan Changes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tax Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Tax Profile
            </CardTitle>
            {!isEditingTaxProfile && (
              <Button variant="outline" onClick={() => setIsEditingTaxProfile(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingTaxProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Company Name</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {settingsData.taxProfile.companyName}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tax ID</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {settingsData.taxProfile.taxId}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tax Exempt</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {settingsData.taxProfile.taxExempt ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Address</Label>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <div>{settingsData.taxProfile.address.line1}</div>
                  {settingsData.taxProfile.address.line2 && (
                    <div>{settingsData.taxProfile.address.line2}</div>
                  )}
                  <div>
                    {settingsData.taxProfile.address.city}, {settingsData.taxProfile.address.state} {settingsData.taxProfile.address.postalCode}
                  </div>
                  <div>{settingsData.taxProfile.address.country}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Company Name</Label>
                  <Input 
                    defaultValue={settingsData.taxProfile.companyName}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tax ID</Label>
                  <Input 
                    defaultValue={settingsData.taxProfile.taxId}
                    placeholder="Enter tax ID"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Address Line 1</Label>
                <Input 
                  defaultValue={settingsData.taxProfile.address.line1}
                  placeholder="Enter address"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Address Line 2</Label>
                <Input 
                  defaultValue={settingsData.taxProfile.address.line2}
                  placeholder="Suite, unit, etc. (optional)"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">City</Label>
                  <Input 
                    defaultValue={settingsData.taxProfile.address.city}
                    placeholder="Enter city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">State</Label>
                  <Input 
                    defaultValue={settingsData.taxProfile.address.state}
                    placeholder="Enter state"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Postal Code</Label>
                  <Input 
                    defaultValue={settingsData.taxProfile.address.postalCode}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Country</Label>
                <Select defaultValue={settingsData.taxProfile.address.country}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="tax-exempt" 
                  defaultChecked={settingsData.taxProfile.taxExempt}
                />
                <Label htmlFor="tax-exempt">Tax Exempt</Label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => handleSaveTaxProfile(settingsData.taxProfile)}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditingTaxProfile(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Settings className="w-5 h-5" />
            Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
              <div>
                <div className="font-semibold">Close Current Period</div>
                <div className="text-sm text-muted-foreground">
                  Manually close the current billing period and generate an invoice
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleClosePeriod}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Close Period
              </Button>
            </div>
            
            <div className="text-sm text-orange-700">
              ⚠️ These actions are irreversible and should only be performed by administrators.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Modal */}
      <AlertModal
        open={isAlertModalOpen}
        onOpenChange={setIsAlertModalOpen}
        alert={editingAlert}
        onSave={handleSaveAlert}
      />
    </div>
  )
}
