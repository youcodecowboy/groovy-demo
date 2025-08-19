'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Building2,
  MapPin,
  FileText
} from 'lucide-react'
import { PaymentMethods } from '@/components/billing/payment-methods'
import { BillingProfileForm } from '@/components/billing/billing-profile-form'
import { useToast } from '@/hooks/use-toast'

// Mock payment data
const mockPaymentData = {
  cards: [
    {
      id: 'card_1',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
      name: 'John Doe'
    },
    {
      id: 'card_2',
      brand: 'mastercard',
      last4: '5555',
      expMonth: 8,
      expYear: 2026,
      isDefault: false,
      name: 'John Doe'
    }
  ],
  billingProfile: {
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
    currency: 'USD'
  }
}

export default function PaymentPage() {
  const { toast } = useToast()
  const [paymentData, setPaymentData] = useState(mockPaymentData)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const handleAddCard = () => {
    setIsAddingCard(true)
  }

  const handleEditCard = (cardId: string) => {
    toast({
      title: "Edit Card",
      description: "Card editing would open here",
    })
  }

  const handleRemoveCard = (cardId: string) => {
    setPaymentData(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== cardId)
    }))
    
    toast({
      title: "Card Removed",
      description: "Payment method has been removed",
    })
  }

  const handleSetDefault = (cardId: string) => {
    setPaymentData(prev => ({
      ...prev,
      cards: prev.cards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }))
    }))
    
    toast({
      title: "Default Updated",
      description: "Default payment method has been updated",
    })
  }

  const handleSaveProfile = (profile: any) => {
    setPaymentData(prev => ({
      ...prev,
      billingProfile: profile
    }))
    setIsEditingProfile(false)
    
    toast({
      title: "Profile Updated",
      description: "Billing profile has been saved",
    })
  }

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      default:
        return '💳'
    }
  }

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your payment methods and billing information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentData.cards.map((card) => (
              <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getCardIcon(card.brand)}</div>
                  <div>
                    <div className="font-semibold">
                      {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} •••• {card.last4}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {formatExpiry(card.expMonth, card.expYear)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {card.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {card.isDefault && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCard(card.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!card.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCard(card.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleAddCard}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>

        {/* Billing Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Billing Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditingProfile ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Company Name</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {paymentData.billingProfile.companyName}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Address</Label>
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <div>{paymentData.billingProfile.address.line1}</div>
                    {paymentData.billingProfile.address.line2 && (
                      <div>{paymentData.billingProfile.address.line2}</div>
                    )}
                    <div>
                      {paymentData.billingProfile.address.city}, {paymentData.billingProfile.address.state} {paymentData.billingProfile.address.postalCode}
                    </div>
                    <div>{paymentData.billingProfile.address.country}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tax ID</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {paymentData.billingProfile.taxId}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Currency</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    {paymentData.billingProfile.currency}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            ) : (
              <BillingProfileForm
                profile={paymentData.billingProfile}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditingProfile(false)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Component */}
      <PaymentMethods
        cards={paymentData.cards}
        onAddCard={handleAddCard}
        onEditCard={handleEditCard}
        onRemoveCard={handleRemoveCard}
        onSetDefault={handleSetDefault}
        isAddingCard={isAddingCard}
        onCloseAddCard={() => setIsAddingCard(false)}
      />
    </div>
  )
}
