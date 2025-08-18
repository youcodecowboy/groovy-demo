"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Edit3,
  Save,
  X,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CostData {
  laborRate: number // per hour
  quotedLabor: number // total quoted labor cost
  activeTime: number // total active time in milliseconds
  costToDate: number // calculated labor cost
  margin: number // quoted - costToDate
  currency: string
  source: 'order' | 'override'
}

interface CostsPanelProps {
  costData: CostData
  onUpdateLaborRate?: (rate: number, reason: string) => Promise<void>
  onUpdateQuotedLabor?: (quoted: number, reason: string) => Promise<void>
}

export function CostsPanel({ 
  costData, 
  onUpdateLaborRate,
  onUpdateQuotedLabor
}: CostsPanelProps) {
  const { toast } = useToast()
  const [editingField, setEditingField] = useState<'laborRate' | 'quotedLabor' | null>(null)
  const [editValue, setEditValue] = useState("")
  const [editReason, setEditReason] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: costData.currency || 'USD'
    }).format(amount)
  }

  const formatDuration = (durationMs: number) => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getMarginStatus = () => {
    if (costData.margin > 0) {
      return {
        status: 'positive',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: TrendingUp
      }
    } else if (costData.margin < 0) {
      return {
        status: 'negative',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: TrendingDown
      }
    } else {
      return {
        status: 'neutral',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: TrendingUp
      }
    }
  }

  const startEditing = (field: 'laborRate' | 'quotedLabor', currentValue: number) => {
    setEditingField(field)
    setEditValue(currentValue.toString())
    setEditReason("")
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValue("")
    setEditReason("")
  }

  const saveEdit = async () => {
    if (!editingField || !editValue.trim() || !editReason.trim()) return

    const newValue = parseFloat(editValue)
    if (isNaN(newValue) || newValue < 0) {
      toast({
        title: "Invalid value",
        description: "Please enter a valid positive number",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      if (editingField === 'laborRate') {
        await onUpdateLaborRate?.(newValue, editReason.trim())
      } else {
        await onUpdateQuotedLabor?.(newValue, editReason.trim())
      }
      
      setEditingField(null)
      setEditValue("")
      setEditReason("")
      
      toast({
        title: "Cost updated",
        description: `${editingField === 'laborRate' ? 'Labor rate' : 'Quoted labor'} has been updated`,
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update cost information",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const marginStatus = getMarginStatus()
  const MarginIcon = marginStatus.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Costs & Margins
          <Badge variant="outline" className="ml-auto">
            {costData.currency}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(costData.costToDate)}
            </div>
            <div className="text-sm text-gray-600">Cost to Date</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDuration(costData.activeTime)} active time
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(costData.quotedLabor)}
            </div>
            <div className="text-sm text-gray-600">Quoted Labor</div>
            <div className="text-xs text-gray-500 mt-1">
              Source: {costData.source}
            </div>
          </div>
        </div>

        {/* Margin Display */}
        <div className={`p-4 rounded-lg border ${marginStatus.borderColor} ${marginStatus.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MarginIcon className={`h-5 w-5 ${marginStatus.color}`} />
              <span className={`font-medium ${marginStatus.color}`}>
                {costData.margin > 0 ? 'Profit' : costData.margin < 0 ? 'Overrun' : 'Break Even'}
              </span>
            </div>
            <div className={`text-xl font-bold ${marginStatus.color}`}>
              {formatCurrency(Math.abs(costData.margin))}
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {costData.margin > 0 
              ? `${((costData.margin / costData.quotedLabor) * 100).toFixed(1)}% margin`
              : costData.margin < 0 
              ? `${((Math.abs(costData.margin) / costData.quotedLabor) * 100).toFixed(1)}% overrun`
              : '0% margin'
            }
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Cost Breakdown</h4>
          
          <div className="space-y-2">
            {/* Labor Rate */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium">Labor Rate</div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(costData.laborRate)}/hour
                </div>
              </div>
              <div className="flex items-center gap-2">
                {costData.source === 'override' && (
                  <Badge variant="outline" className="text-xs">
                    Override
                  </Badge>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing('laborRate', costData.laborRate)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">New Labor Rate</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Enter new rate per hour"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Reason for Change</label>
                        <Input
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          placeholder="Enter reason for override"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="flex-1">
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Quoted Labor */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium">Quoted Labor</div>
                <div className="text-xs text-gray-500">
                  Total quoted cost
                </div>
              </div>
              <div className="flex items-center gap-2">
                {costData.source === 'override' && (
                  <Badge variant="outline" className="text-xs">
                    Override
                  </Badge>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing('quotedLabor', costData.quotedLabor)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">New Quoted Labor</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Enter new quoted amount"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Reason for Change</label>
                        <Input
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          placeholder="Enter reason for override"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="flex-1">
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Details */}
        <div className="border-t pt-4">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Calculation: {formatDuration(costData.activeTime)} × {formatCurrency(costData.laborRate)}/hour = {formatCurrency(costData.costToDate)}</div>
            <div>Margin: {formatCurrency(costData.quotedLabor)} - {formatCurrency(costData.costToDate)} = {formatCurrency(costData.margin)}</div>
            <div>Currency: {costData.currency} • Source: {costData.source}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
