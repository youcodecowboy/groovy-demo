'use client'

import { AlertsTable } from '@/components/billing/alerts-table'
import { AlertModal } from '@/components/billing/alert-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { Bell, Mail, Smartphone, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

// Mock brand billing settings
const mockBrandSettings = {
  emailNotifications: true,
  smsNotifications: false,
  budgetAlerts: true,
  usageAlerts: true,
  monthlyBudget: 5000,
  currency: 'USD',
  billingCycle: 'monthly',
  autoPayment: true
}

// Mock brand-specific alerts
const mockBrandAlerts = [
  {
    id: 'alert-1',
    name: 'Monthly Budget Alert',
    description: 'Alert when monthly spend reaches 80% of budget',
    type: 'budget',
    threshold: 80,
    enabled: true,
    channels: ['email'],
    lastTriggered: new Date('2024-01-15')
  },
  {
    id: 'alert-2', 
    name: 'High Usage Alert',
    description: 'Alert when daily operations exceed 200',
    type: 'usage',
    threshold: 200,
    enabled: true,
    channels: ['email', 'slack'],
    lastTriggered: null
  },
  {
    id: 'alert-3',
    name: 'Invoice Generated',
    description: 'Notify when new invoice is generated',
    type: 'billing',
    threshold: 0,
    enabled: true,
    channels: ['email'],
    lastTriggered: new Date('2024-01-01')
  }
]

export function BrandBillingSettings() {
  const [settings, setSettings] = useState(mockBrandSettings)
  const [showAlertModal, setShowAlertModal] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    console.log('Saving brand billing settings:', settings)
    // In a real app, this would save to the backend
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing Settings</h1>
        <p className="text-gray-600">
          Configure your billing preferences, alerts, and notification settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                <div className="flex gap-2 mt-1">
                  <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="monthlyBudget"
                    type="number"
                    value={settings.monthlyBudget}
                    onChange={(e) => handleSettingChange('monthlyBudget', parseInt(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="billingCycle">Billing Cycle</Label>
                <Select value={settings.billingCycle} onValueChange={(value) => handleSettingChange('billingCycle', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoPayment">Auto Payment</Label>
                  <p className="text-sm text-gray-600">Automatically pay invoices when due</p>
                </div>
                <Switch
                  id="autoPayment"
                  checked={settings.autoPayment}
                  onCheckedChange={(checked) => handleSettingChange('autoPayment', checked)}
                />
              </div>
            </div>

            <Button onClick={handleSaveSettings} className="w-full">
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive alerts via email</p>
                  </div>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive urgent alerts via SMS</p>
                  </div>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <div>
                    <Label htmlFor="budgetAlerts">Budget Alerts</Label>
                    <p className="text-sm text-gray-600">Alert when approaching budget limits</p>
                  </div>
                </div>
                <Switch
                  id="budgetAlerts"
                  checked={settings.budgetAlerts}
                  onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                  <div>
                    <Label htmlFor="usageAlerts">Usage Alerts</Label>
                    <p className="text-sm text-gray-600">Alert on unusual usage patterns</p>
                  </div>
                </div>
                <Switch
                  id="usageAlerts"
                  checked={settings.usageAlerts}
                  onCheckedChange={(checked) => handleSettingChange('usageAlerts', checked)}
                />
              </div>
            </div>

            <Button onClick={handleSaveSettings} variant="outline" className="w-full">
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Table */}
      <AlertsTable 
        alerts={mockBrandAlerts}
        onCreateAlert={() => setShowAlertModal(true)}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onSave={(alert) => {
          console.log('Creating brand alert:', alert)
          setShowAlertModal(false)
        }}
      />
    </div>
  )
}