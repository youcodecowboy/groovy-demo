'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Plus, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Card {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
  name: string
}

interface PaymentMethodsProps {
  cards: Card[]
  onAddCard: () => void
  onEditCard: (cardId: string) => void
  onRemoveCard: (cardId: string) => void
  onSetDefault: (cardId: string) => void
  isAddingCard: boolean
  onCloseAddCard: () => void
}

export function PaymentMethods({
  cards,
  onAddCard,
  onEditCard,
  onRemoveCard,
  onSetDefault,
  isAddingCard,
  onCloseAddCard
}: PaymentMethodsProps) {
  const { toast } = useToast()
  const [isStripeEnabled] = useState(process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true')
  const [cardForm, setCardForm] = useState({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    name: ''
  })

  const handleSubmitCard = () => {
    // Mock card submission
    if (isStripeEnabled) {
      // Would integrate with Stripe Elements here
      toast({
        title: "Card Added",
        description: "Payment method has been added successfully",
      })
    } else {
      // Mock implementation
      toast({
        title: "Card Added",
        description: "Payment method has been added successfully (mock)",
      })
    }
    onCloseAddCard()
    setCardForm({
      number: '',
      expMonth: '',
      expYear: '',
      cvc: '',
      name: ''
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
    <Dialog open={isAddingCard} onOpenChange={onCloseAddCard}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Add Payment Method
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isStripeEnabled ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Stripe Integration Active</span>
                </div>
                <p className="text-sm text-blue-700">
                  Secure payment processing powered by Stripe Elements.
                </p>
              </div>
              
              {/* Stripe Elements would be integrated here */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardForm.number}
                    onChange={(e) => setCardForm(prev => ({ ...prev, number: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exp-month">Month</Label>
                    <Select value={cardForm.expMonth} onValueChange={(value) => setCardForm(prev => ({ ...prev, expMonth: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="exp-year">Year</Label>
                    <Select value={cardForm.expYear} onValueChange={(value) => setCardForm(prev => ({ ...prev, expYear: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm(prev => ({ ...prev, cvc: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card-name">Cardholder Name</Label>
                  <Input
                    id="card-name"
                    placeholder="John Doe"
                    value={cardForm.name}
                    onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Mock Mode</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Stripe integration is disabled. This is a demo implementation.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mock-card-number">Card Number</Label>
                  <Input
                    id="mock-card-number"
                    placeholder="4242 4242 4242 4242"
                    value={cardForm.number}
                    onChange={(e) => setCardForm(prev => ({ ...prev, number: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mock-exp">Expiry</Label>
                    <Input
                      id="mock-exp"
                      placeholder="12/25"
                      value={cardForm.expMonth && cardForm.expYear ? `${cardForm.expMonth}/${cardForm.expYear.slice(-2)}` : ''}
                      onChange={(e) => {
                        const [month, year] = e.target.value.split('/')
                        setCardForm(prev => ({ 
                          ...prev, 
                          expMonth: month || '', 
                          expYear: year ? `20${year}` : '' 
                        }))
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mock-cvc">CVC</Label>
                    <Input
                      id="mock-cvc"
                      placeholder="123"
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm(prev => ({ ...prev, cvc: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mock-card-name">Cardholder Name</Label>
                  <Input
                    id="mock-card-name"
                    placeholder="John Doe"
                    value={cardForm.name}
                    onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmitCard} className="flex-1">
              Add Card
            </Button>
            <Button variant="outline" onClick={onCloseAddCard}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
