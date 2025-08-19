'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  Bell,
  Mail
} from 'lucide-react'

interface Alert {
  id: string
  type: 'cost' | 'usage'
  threshold: number
  enabled: boolean
  channels: string[]
  message: string
}

interface AlertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alert?: Alert | null
  onSave: (alert: Alert) => void
}

export function AlertModal({ open, onOpenChange, alert, onSave }: AlertModalProps) {
  const [formData, setFormData] = useState({
    type: 'cost' as 'cost' | 'usage',
    threshold: 0,
    message: '',
    channels: ['in-app'] as string[]
  })

  useEffect(() => {
    if (alert) {
      setFormData({
        type: alert.type,
        threshold: alert.threshold,
        message: alert.message,
        channels: alert.channels
      })
    } else {
      setFormData({
        type: 'cost',
        threshold: 0,
        message: '',
        channels: ['in-app']
      })
    }
  }, [alert])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newAlert: Alert = {
      id: alert?.id || Date.now().toString(),
      type: formData.type,
      threshold: formData.threshold,
      enabled: alert?.enabled ?? true,
      channels: formData.channels,
      message: formData.message || `${formData.type === 'cost' ? 'Cost' : 'Usage'} threshold exceeded`
    }
    
    onSave(newAlert)
    onOpenChange(false)
  }

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost':
        return <DollarSign className="w-4 h-4" />
      case 'usage':
        return <BarChart3 className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cost':
        return 'text-red-600 bg-red-100'
      case 'usage':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {alert ? 'Edit Alert' : 'Create Alert'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alert Type */}
          <div className="space-y-2">
            <Label>Alert Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === 'cost' 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'cost' }))}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${getTypeColor('cost')}`}>
                    <DollarSign className="w-3 h-3" />
                  </div>
                  <span className="font-medium">Cost</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Monitor spending thresholds
                </p>
              </div>
              
              <div
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === 'usage' 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'usage' }))}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${getTypeColor('usage')}`}>
                    <BarChart3 className="w-3 h-3" />
                  </div>
                  <span className="font-medium">Usage</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Monitor record counts
                </p>
              </div>
            </div>
          </div>

          {/* Threshold */}
          <div className="space-y-2">
            <Label htmlFor="threshold">
              Threshold ({formData.type === 'cost' ? 'USD' : 'records'})
            </Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              step={formData.type === 'cost' ? '0.01' : '1'}
              value={formData.threshold}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                threshold: parseFloat(e.target.value) || 0 
              }))}
              placeholder={formData.type === 'cost' ? '100.00' : '1000'}
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Alert Message</Label>
            <Input
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={`${formData.type === 'cost' ? 'Cost' : 'Usage'} threshold exceeded`}
            />
          </div>

          {/* Notification Channels */}
          <div className="space-y-2">
            <Label>Notification Channels</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-app"
                  checked={formData.channels.includes('in-app')}
                  onCheckedChange={() => handleChannelToggle('in-app')}
                />
                <Label htmlFor="in-app" className="flex items-center gap-2 cursor-pointer">
                  <Bell className="w-4 h-4" />
                  In-app notifications
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={formData.channels.includes('email')}
                  onCheckedChange={() => handleChannelToggle('email')}
                />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Email notifications
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {alert ? 'Update Alert' : 'Create Alert'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
