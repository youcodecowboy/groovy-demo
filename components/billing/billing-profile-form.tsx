'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface BillingProfile {
  companyName: string
  address: Address
  taxId: string
  taxExempt: boolean
}

interface BillingProfileFormProps {
  profile: BillingProfile
  onSave: (profile: BillingProfile) => void
  onCancel: () => void
}

export function BillingProfileForm({ profile, onSave, onCancel }: BillingProfileFormProps) {
  const [formData, setFormData] = useState(profile)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="Enter company name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tax-id">Tax ID</Label>
          <Input
            id="tax-id"
            value={formData.taxId}
            onChange={(e) => handleInputChange('taxId', e.target.value)}
            placeholder="Enter tax ID"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address-line1">Address Line 1</Label>
        <Input
          id="address-line1"
          value={formData.address.line1}
          onChange={(e) => handleInputChange('address.line1', e.target.value)}
          placeholder="Enter address"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address-line2">Address Line 2</Label>
        <Input
          id="address-line2"
          value={formData.address.line2 || ''}
          onChange={(e) => handleInputChange('address.line2', e.target.value)}
          placeholder="Suite, unit, etc. (optional)"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.address.city}
            onChange={(e) => handleInputChange('address.city', e.target.value)}
            placeholder="Enter city"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.address.state}
            onChange={(e) => handleInputChange('address.state', e.target.value)}
            placeholder="Enter state"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="postal-code">Postal Code</Label>
          <Input
            id="postal-code"
            value={formData.address.postalCode}
            onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
            placeholder="Enter postal code"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select 
          value={formData.address.country} 
          onValueChange={(value) => handleInputChange('address.country', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
            <SelectItem value="UK">United Kingdom</SelectItem>
            <SelectItem value="AU">Australia</SelectItem>
            <SelectItem value="DE">Germany</SelectItem>
            <SelectItem value="FR">France</SelectItem>
            <SelectItem value="JP">Japan</SelectItem>
            <SelectItem value="CN">China</SelectItem>
            <SelectItem value="IN">India</SelectItem>
            <SelectItem value="BR">Brazil</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="tax-exempt" 
          checked={formData.taxExempt}
          onCheckedChange={(checked) => handleInputChange('taxExempt', checked)}
        />
        <Label htmlFor="tax-exempt">Tax Exempt</Label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
