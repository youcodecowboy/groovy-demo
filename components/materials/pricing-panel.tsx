'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Plus,
  Edit,
  BarChart3,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import TrendMiniChart from './trend-mini-chart'
import ValueCard from './value-card'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material, type PriceHistory, formatCurrency } from '@/types/materials'

interface PricingPanelProps {
  material: Material
}

export default function PricingPanel({ material }: PricingPanelProps) {
  const { toast } = useToast()
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPriceDialog, setShowAddPriceDialog] = useState(false)
  const [newPrice, setNewPrice] = useState({
    unitCost: '',
    source: 'Manual' as const,
    note: ''
  })

  useEffect(() => {
    loadPriceHistory()
  }, [material.id])

  const loadPriceHistory = async () => {
    try {
      setLoading(true)
      const historyData = await dataAdapter.getPriceHistory(material.id)
      setPriceHistory(historyData)
    } catch (error) {
      console.error('Failed to load price history:', error)
      toast({
        title: "Error",
        description: "Failed to load price history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPrice = async () => {
    try {
      const unitCost = parseFloat(newPrice.unitCost)
      
      if (!unitCost || unitCost <= 0) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid unit cost",
          variant: "destructive",
        })
        return
      }

      await dataAdapter.addPriceHistory({
        materialId: material.id,
        unitCost,
        currency: 'USD',
        source: newPrice.source,
        note: newPrice.note
      })

      setNewPrice({ unitCost: '', source: 'Manual', note: '' })
      setShowAddPriceDialog(false)
      await loadPriceHistory()

      toast({
        title: "Price Added",
        description: `New price ${formatCurrency(unitCost)} has been recorded`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add price entry",
        variant: "destructive",
      })
    }
  }

  // Calculate price statistics
  const currentPrice = priceHistory[0]?.unitCost || 0
  const previousPrice = priceHistory[1]?.unitCost || currentPrice
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0
  const avgPrice = priceHistory.length > 0 
    ? priceHistory.reduce((sum, p) => sum + p.unitCost, 0) / priceHistory.length 
    : 0
  const minPrice = Math.min(...priceHistory.map(p => p.unitCost))
  const maxPrice = Math.max(...priceHistory.map(p => p.unitCost))

  // Prepare chart data
  const chartData = priceHistory
    .slice(0, 20) // Last 20 entries
    .reverse()
    .map(price => ({
      date: new Date(price.at).toISOString().split('T')[0],
      value: price.unitCost
    }))

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'PO':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Purchase Order</Badge>
      case 'Manual':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Manual Entry</Badge>
      case 'Import':
        return <Badge variant="outline" className="text-green-600 border-green-600">Import</Badge>
      default:
        return <Badge variant="outline">{source}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Price overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ValueCard
          title="Current Price"
          value={currentPrice}
          currency="USD"
          subtitle={`per ${material.defaultUnit}`}
          icon={DollarSign}
          trend={priceHistory.length > 1 ? {
            value: Math.abs(priceChangePercent),
            isPositive: priceChange >= 0,
            period: 'vs last price'
          } : undefined}
        />
        
        <ValueCard
          title="Average Price"
          value={avgPrice}
          currency="USD"
          subtitle="Historical average"
          icon={Target}
        />
        
        <ValueCard
          title="Lowest Price"
          value={minPrice}
          currency="USD"
          subtitle="All-time low"
          icon={TrendingDown}
        />
        
        <ValueCard
          title="Highest Price"
          value={maxPrice}
          currency="USD"
          subtitle="All-time high"
          icon={TrendingUp}
        />
      </div>

      {/* Price trend chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Price Trend
            </CardTitle>
            <Dialog open={showAddPriceDialog} onOpenChange={setShowAddPriceDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Price
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Price Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price-unit-cost">Unit Cost *</Label>
                    <Input
                      id="price-unit-cost"
                      type="number"
                      step="0.01"
                      placeholder="Cost per unit"
                      value={newPrice.unitCost}
                      onChange={(e) => setNewPrice({ ...newPrice, unitCost: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price-source">Source</Label>
                    <Select value={newPrice.source} onValueChange={(value: any) => setNewPrice({ ...newPrice, source: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manual">Manual Entry</SelectItem>
                        <SelectItem value="PO">Purchase Order</SelectItem>
                        <SelectItem value="Import">Import</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price-note">Note</Label>
                    <Input
                      id="price-note"
                      placeholder="Optional note about this price"
                      value={newPrice.note}
                      onChange={(e) => setNewPrice({ ...newPrice, note: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddPriceDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPrice}>
                    Add Price
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <TrendMiniChart data={chartData} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p>No price history available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price history table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Price History ({priceHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {priceHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.map((price, index) => {
                  const prevPrice = priceHistory[index + 1]
                  const change = prevPrice ? price.unitCost - prevPrice.unitCost : 0
                  const changePercent = prevPrice && prevPrice.unitCost > 0 
                    ? (change / prevPrice.unitCost) * 100 
                    : 0

                  return (
                    <TableRow key={price.id}>
                      <TableCell>
                        {new Date(price.at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(price.unitCost)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {prevPrice ? (
                          <div className="flex items-center gap-1">
                            {change >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-red-600" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-green-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              change >= 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {change >= 0 ? '+' : ''}{formatCurrency(Math.abs(change))}
                            </span>
                            <span className={`text-xs ${
                              change >= 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Initial price</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getSourceBadge(price.source)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {price.note || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-8 h-8 mx-auto mb-2" />
              <p>No price history available</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddPriceDialog(true)}
                className="mt-2"
              >
                Add first price entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
