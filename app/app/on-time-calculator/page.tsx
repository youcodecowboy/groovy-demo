"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Save, FileText } from "lucide-react"

interface DeliveryRecord {
  id: string
  orderName: string
  plannedDate: string
  actualDate: string
  daysEarly: number
  daysLate: number
  onTime: boolean
  category: 'production' | 'material' | 'shipping' | 'custom'
}

interface OnTimeAnalysis {
  id: string
  name: string
  period: string
  records: DeliveryRecord[]
  onTimePercentage: number
  averageDelay: number
  totalOrders: number
  onTimeOrders: number
  lateOrders: number
  earlyOrders: number
  timestamp: string
}

export default function OnTimeCalculatorPage() {
  const [analysisName, setAnalysisName] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [records, setRecords] = useState<DeliveryRecord[]>([{
    id: '1',
    orderName: 'Jedi Robe Order #001',
    plannedDate: '2024-01-15',
    actualDate: '2024-01-14',
    daysEarly: 1,
    daysLate: 0,
    onTime: true,
    category: 'production'
  }])
  const [savedAnalyses, setSavedAnalyses] = useState<OnTimeAnalysis[]>([])

  const addRecord = () => {
    const newRecord: DeliveryRecord = {
      id: Date.now().toString(),
      orderName: '',
      plannedDate: new Date().toISOString().split('T')[0],
      actualDate: new Date().toISOString().split('T')[0],
      daysEarly: 0,
      daysLate: 0,
      onTime: true,
      category: 'production'
    }
    setRecords(prev => [...prev, newRecord])
  }

  const removeRecord = (id: string) => {
    if (records.length > 1) {
      setRecords(prev => prev.filter(record => record.id !== id))
    }
  }

  const updateRecord = (id: string, field: keyof DeliveryRecord, value: any) => {
    setRecords(prev => prev.map(record => {
      if (record.id === id) {
        const updated = { ...record, [field]: value }
        
        // Recalculate timing when dates change
        if (field === 'plannedDate' || field === 'actualDate') {
          const planned = new Date(updated.plannedDate)
          const actual = new Date(updated.actualDate)
          const diffTime = actual.getTime() - planned.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays < 0) {
            updated.daysEarly = Math.abs(diffDays)
            updated.daysLate = 0
            updated.onTime = Math.abs(diffDays) <= 1 // Consider 1 day early as on-time
          } else if (diffDays > 0) {
            updated.daysEarly = 0
            updated.daysLate = diffDays
            updated.onTime = false
          } else {
            updated.daysEarly = 0
            updated.daysLate = 0
            updated.onTime = true
          }
        }
        
        return updated
      }
      return record
    }))
  }

  const getOnTimePercentage = (): number => {
    if (records.length === 0) return 0
    const onTimeCount = records.filter(record => record.onTime).length
    return (onTimeCount / records.length) * 100
  }

  const getAverageDelay = (): number => {
    if (records.length === 0) return 0
    const totalDelay = records.reduce((sum, record) => sum + record.daysLate, 0)
    return totalDelay / records.length
  }

  const getOnTimeOrders = (): number => {
    return records.filter(record => record.onTime).length
  }

  const getLateOrders = (): number => {
    return records.filter(record => record.daysLate > 0).length
  }

  const getEarlyOrders = (): number => {
    return records.filter(record => record.daysEarly > 0).length
  }

  const getCategoryBreakdown = () => {
    const categories = ['production', 'material', 'shipping', 'custom']
    return categories.map(category => {
      const categoryRecords = records.filter(record => record.category === category)
      const onTimeCount = categoryRecords.filter(record => record.onTime).length
      return {
        category,
        total: categoryRecords.length,
        onTime: onTimeCount,
        percentage: categoryRecords.length > 0 ? (onTimeCount / categoryRecords.length) * 100 : 0
      }
    }).filter(item => item.total > 0)
  }

  const getPerformanceStatus = () => {
    const percentage = getOnTimePercentage()
    if (percentage >= 95) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle }
    if (percentage >= 85) return { status: 'good', color: 'text-blue-600', icon: TrendingUp }
    if (percentage >= 70) return { status: 'acceptable', color: 'text-yellow-600', icon: Clock }
    return { status: 'needs improvement', color: 'text-red-600', icon: AlertTriangle }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'production': return 'bg-blue-100 text-blue-800'
      case 'material': return 'bg-green-100 text-green-800'
      case 'shipping': return 'bg-purple-100 text-purple-800'
      case 'custom': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const saveAnalysis = () => {
    if (!analysisName) return

    const analysis: OnTimeAnalysis = {
      id: Date.now().toString(),
      name: analysisName,
      period,
      records: [...records],
      onTimePercentage: getOnTimePercentage(),
      averageDelay: getAverageDelay(),
      totalOrders: records.length,
      onTimeOrders: getOnTimeOrders(),
      lateOrders: getLateOrders(),
      earlyOrders: getEarlyOrders(),
      timestamp: new Date().toISOString()
    }

    setSavedAnalyses(prev => [analysis, ...prev])
    setAnalysisName('')
  }

  const loadAnalysis = (analysis: OnTimeAnalysis) => {
    setAnalysisName(analysis.name)
    setPeriod(analysis.period)
    setRecords(analysis.records)
  }

  const exportAnalysis = () => {
    const breakdown = getCategoryBreakdown()
    const csvContent = [
      'On-Time Delivery Analysis Report',
      `Analysis: ${analysisName}`,
      `Period: ${period}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      'Summary:',
      `Total Orders,${records.length}`,
      `On-Time Orders,${getOnTimeOrders()}`,
      `Late Orders,${getLateOrders()}`,
      `Early Orders,${getEarlyOrders()}`,
      `On-Time Percentage,${getOnTimePercentage().toFixed(1)}%`,
      `Average Delay,${getAverageDelay().toFixed(1)} days`,
      '',
      'Category Breakdown:',
      'Category,Total,On-Time,Percentage',
      ...breakdown.map(item => `${item.category},${item.total},${item.onTime},${item.percentage.toFixed(1)}%`),
      '',
      'Detailed Records:',
      'Order Name,Category,Planned Date,Actual Date,Days Early,Days Late,On Time',
      ...records.map(record => 
        `"${record.orderName}",${record.category},${record.plannedDate},${record.actualDate},${record.daysEarly},${record.daysLate},${record.onTime ? 'Yes' : 'No'}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `on-time-analysis-${analysisName || 'unnamed'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearAnalysis = () => {
    setRecords([{
      id: Date.now().toString(),
      orderName: '',
      plannedDate: new Date().toISOString().split('T')[0],
      actualDate: new Date().toISOString().split('T')[0],
      daysEarly: 0,
      daysLate: 0,
      onTime: true,
      category: 'production'
    }])
    setAnalysisName('')
  }

  const performanceStatus = getPerformanceStatus()
  const StatusIcon = performanceStatus.icon

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">On-Time Delivery Calculator</h1>
          <p className="text-gray-600">Track and analyze delivery performance to improve on-time delivery rates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Analysis Header */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="analysisName">Analysis Name</Label>
                  <Input
                    id="analysisName"
                    placeholder="Q1 2024 Delivery Performance"
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="period">Period</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveAnalysis} disabled={!analysisName}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={exportAnalysis}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Delivery Records</span>
                <div className="flex gap-2">
                  <Button onClick={addRecord}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                  <Button variant="outline" onClick={clearAnalysis}>
                    Clear All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div key={record.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Record {index + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(record.category)}>
                          {record.category}
                        </Badge>
                        {record.onTime ? (
                          <Badge className="bg-green-100 text-green-800">On Time</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Late</Badge>
                        )}
                        {records.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRecord(record.id)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>Order Name</Label>
                        <Input
                          placeholder="Order #001"
                          value={record.orderName}
                          onChange={(e) => updateRecord(record.id, 'orderName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select 
                          value={record.category} 
                          onValueChange={(value: any) => updateRecord(record.id, 'category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="production">Production</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="shipping">Shipping</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Planned Date</Label>
                        <Input
                          type="date"
                          value={record.plannedDate}
                          onChange={(e) => updateRecord(record.id, 'plannedDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Actual Date</Label>
                        <Input
                          type="date"
                          value={record.actualDate}
                          onChange={(e) => updateRecord(record.id, 'actualDate', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-gray-50 p-3 rounded border">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div className={`font-medium ${record.onTime ? 'text-green-600' : 'text-red-600'}`}>
                            {record.onTime ? 'On Time' : 'Late'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Days Early:</span>
                          <div className="font-medium text-green-600">{record.daysEarly}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Days Late:</span>
                          <div className="font-medium text-red-600">{record.daysLate}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Variance:</span>
                          <div className={`font-medium ${record.daysLate > 0 ? 'text-red-600' : record.daysEarly > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {record.daysLate > 0 ? `+${record.daysLate}` : record.daysEarly > 0 ? `-${record.daysEarly}` : '0'} days
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-1 space-y-6">
          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${performanceStatus.color}`} />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${performanceStatus.color}`}>
                    {getOnTimePercentage().toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">On-Time Delivery</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="font-medium">{records.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">On Time:</span>
                    <span className="font-medium text-green-600">{getOnTimeOrders()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late:</span>
                    <span className="font-medium text-red-600">{getLateOrders()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Early:</span>
                    <span className="font-medium text-blue-600">{getEarlyOrders()}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Delay:</span>
                    <span className="font-medium">{getAverageDelay().toFixed(1)} days</span>
                  </div>
                </div>

                <div className="text-center">
                  <Badge variant="outline" className={performanceStatus.color}>
                    {performanceStatus.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getCategoryBreakdown().map(item => (
                  <div key={item.category} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(item.category)} variant="outline">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">{item.onTime}/{item.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {getOnTimePercentage() >= 95 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Excellent performance! Keep it up.</span>
                  </div>
                )}
                {getOnTimePercentage() < 70 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Performance needs improvement.</span>
                  </div>
                )}
                {getAverageDelay() > 3 && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <TrendingDown className="h-4 w-4" />
                    <span>High average delay detected.</span>
                  </div>
                )}
                {getLateOrders() > getOnTimeOrders() && (
                  <div className="text-red-600">
                    More late orders than on-time orders.
                  </div>
                )}
                {getEarlyOrders() > records.length * 0.3 && (
                  <div className="text-blue-600">
                    High early delivery rate - good buffer management.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Saved Analyses */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Analyses ({savedAnalyses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {savedAnalyses.length > 0 ? (
                <div className="space-y-3">
                  {savedAnalyses.slice(0, 3).map((analysis) => (
                    <div 
                      key={analysis.id} 
                      className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => loadAnalysis(analysis)}
                    >
                      <div className="font-medium text-sm truncate">{analysis.name}</div>
                      <div className="text-xs text-gray-500">
                        {analysis.onTimePercentage.toFixed(1)}% • {analysis.totalOrders} orders
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(analysis.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {savedAnalyses.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{savedAnalyses.length - 3} more analyses
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">No saved analyses</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}