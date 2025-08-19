"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Plus, Trash2, Save, FileText, TrendingUp, Calculator } from "lucide-react"

interface LaborTask {
  id: string
  name: string
  category: 'cutting' | 'sewing' | 'finishing' | 'quality' | 'packaging' | 'other'
  skillLevel: 'entry' | 'intermediate' | 'advanced' | 'expert'
  estimatedHours: number
  hourlyRate: number
  totalCost: number
  complexity: 1 | 2 | 3 | 4 | 5
  notes: string
}

interface LaborEstimate {
  id: string
  name: string
  projectType: 'single_item' | 'batch_production' | 'custom_order'
  quantity: number
  tasks: LaborTask[]
  totalHours: number
  totalCost: number
  averageHourlyRate: number
  costPerUnit: number
  timestamp: string
}

const skillLevelRates = {
  entry: 15,
  intermediate: 22,
  advanced: 32,
  expert: 45
}

const taskCategories = [
  { id: 'cutting', name: 'Cutting', color: 'bg-blue-100 text-blue-800', icon: '✂️' },
  { id: 'sewing', name: 'Sewing', color: 'bg-green-100 text-green-800', icon: '🧵' },
  { id: 'finishing', name: 'Finishing', color: 'bg-purple-100 text-purple-800', icon: '✨' },
  { id: 'quality', name: 'Quality Control', color: 'bg-orange-100 text-orange-800', icon: '🔍' },
  { id: 'packaging', name: 'Packaging', color: 'bg-red-100 text-red-800', icon: '📦' },
  { id: 'other', name: 'Other', color: 'bg-gray-100 text-gray-800', icon: '🔧' }
]

export default function LaborEstimatorPage() {
  const [estimateName, setEstimateName] = useState('')
  const [projectType, setProjectType] = useState<'single_item' | 'batch_production' | 'custom_order'>('single_item')
  const [quantity, setQuantity] = useState(1)
  const [tasks, setTasks] = useState<LaborTask[]>([{
    id: '1',
    name: 'Fabric Cutting',
    category: 'cutting',
    skillLevel: 'intermediate',
    estimatedHours: 2,
    hourlyRate: skillLevelRates.intermediate,
    totalCost: 44,
    complexity: 3,
    notes: ''
  }])
  const [savedEstimates, setSavedEstimates] = useState<LaborEstimate[]>([])

  const addTask = () => {
    const newTask: LaborTask = {
      id: Date.now().toString(),
      name: '',
      category: 'sewing',
      skillLevel: 'intermediate',
      estimatedHours: 1,
      hourlyRate: skillLevelRates.intermediate,
      totalCost: skillLevelRates.intermediate,
      complexity: 3,
      notes: ''
    }
    setTasks(prev => [...prev, newTask])
  }

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(prev => prev.filter(task => task.id !== id))
    }
  }

  const updateTask = (id: string, field: keyof LaborTask, value: any) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updated = { ...task, [field]: value }
        
        // Update hourly rate when skill level changes
        if (field === 'skillLevel') {
          updated.hourlyRate = skillLevelRates[value as keyof typeof skillLevelRates]
        }
        
        // Recalculate total cost
        updated.totalCost = updated.estimatedHours * updated.hourlyRate
        
        return updated
      }
      return task
    }))
  }

  const getTotalHours = (): number => {
    return tasks.reduce((sum, task) => sum + task.estimatedHours, 0)
  }

  const getTotalCost = (): number => {
    return tasks.reduce((sum, task) => sum + task.totalCost, 0)
  }

  const getAverageHourlyRate = (): number => {
    const totalHours = getTotalHours()
    return totalHours > 0 ? getTotalCost() / totalHours : 0
  }

  const getCostPerUnit = (): number => {
    return quantity > 0 ? getTotalCost() / quantity : 0
  }

  const getCategoryBreakdown = () => {
    const breakdown: Record<string, { hours: number; cost: number; tasks: number }> = {}
    
    taskCategories.forEach(category => {
      const categoryTasks = tasks.filter(task => task.category === category.id)
      breakdown[category.id] = {
        hours: categoryTasks.reduce((sum, task) => sum + task.estimatedHours, 0),
        cost: categoryTasks.reduce((sum, task) => sum + task.totalCost, 0),
        tasks: categoryTasks.length
      }
    })
    
    return breakdown
  }

  const getSkillLevelBreakdown = () => {
    const breakdown: Record<string, { hours: number; cost: number; tasks: number }> = {}
    
    Object.keys(skillLevelRates).forEach(level => {
      const levelTasks = tasks.filter(task => task.skillLevel === level)
      breakdown[level] = {
        hours: levelTasks.reduce((sum, task) => sum + task.estimatedHours, 0),
        cost: levelTasks.reduce((sum, task) => sum + task.totalCost, 0),
        tasks: levelTasks.length
      }
    })
    
    return breakdown
  }

  const getComplexityAnalysis = () => {
    const complexityTasks = tasks.reduce((acc, task) => {
      acc[task.complexity] = (acc[task.complexity] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    const averageComplexity = tasks.length > 0 
      ? tasks.reduce((sum, task) => sum + task.complexity, 0) / tasks.length 
      : 0
    
    return { distribution: complexityTasks, average: averageComplexity }
  }

  const getCategoryInfo = (categoryId: string) => {
    return taskCategories.find(cat => cat.id === categoryId) || taskCategories[0]
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const saveEstimate = () => {
    if (!estimateName) return

    const estimate: LaborEstimate = {
      id: Date.now().toString(),
      name: estimateName,
      projectType,
      quantity,
      tasks: [...tasks],
      totalHours: getTotalHours(),
      totalCost: getTotalCost(),
      averageHourlyRate: getAverageHourlyRate(),
      costPerUnit: getCostPerUnit(),
      timestamp: new Date().toISOString()
    }

    setSavedEstimates(prev => [estimate, ...prev])
    setEstimateName('')
  }

  const loadEstimate = (estimate: LaborEstimate) => {
    setEstimateName(estimate.name)
    setProjectType(estimate.projectType)
    setQuantity(estimate.quantity)
    setTasks(estimate.tasks)
  }

  const exportEstimate = () => {
    const categoryBreakdown = getCategoryBreakdown()
    const skillBreakdown = getSkillLevelBreakdown()
    const complexity = getComplexityAnalysis()
    
    const csvContent = [
      'Labor Estimate Report',
      `Project: ${estimateName}`,
      `Type: ${projectType}`,
      `Quantity: ${quantity}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      'Summary:',
      `Total Hours,${getTotalHours().toFixed(2)}`,
      `Total Cost,${getTotalCost().toFixed(2)}`,
      `Average Hourly Rate,${getAverageHourlyRate().toFixed(2)}`,
      `Cost per Unit,${getCostPerUnit().toFixed(2)}`,
      `Average Complexity,${complexity.average.toFixed(1)}/5`,
      '',
      'Task Details:',
      'Task Name,Category,Skill Level,Hours,Hourly Rate,Total Cost,Complexity,Notes',
      ...tasks.map(task => 
        `"${task.name}",${task.category},${task.skillLevel},${task.estimatedHours},${task.hourlyRate.toFixed(2)},${task.totalCost.toFixed(2)},${task.complexity},"${task.notes}"`
      ),
      '',
      'Category Breakdown:',
      'Category,Tasks,Hours,Cost',
      ...Object.entries(categoryBreakdown).map(([category, data]) => 
        `${category},${data.tasks},${data.hours.toFixed(2)},${data.cost.toFixed(2)}`
      ),
      '',
      'Skill Level Breakdown:',
      'Skill Level,Tasks,Hours,Cost',
      ...Object.entries(skillBreakdown).map(([level, data]) => 
        `${level},${data.tasks},${data.hours.toFixed(2)},${data.cost.toFixed(2)}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `labor-estimate-${estimateName || 'unnamed'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearEstimate = () => {
    setTasks([{
      id: Date.now().toString(),
      name: '',
      category: 'sewing',
      skillLevel: 'intermediate',
      estimatedHours: 1,
      hourlyRate: skillLevelRates.intermediate,
      totalCost: skillLevelRates.intermediate,
      complexity: 3,
      notes: ''
    }])
    setEstimateName('')
    setQuantity(1)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Labor Estimator</h1>
          <p className="text-gray-600">Estimate labor costs and time requirements for production tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Project Header */}
          <Card>
            <CardHeader>
              <CardTitle>Labor Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="estimateName">Project Name</Label>
                  <Input
                    id="estimateName"
                    placeholder="Jedi Robe Production Labor"
                    value={estimateName}
                    onChange={(e) => setEstimateName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select 
                    value={projectType} 
                    onValueChange={(value: any) => setProjectType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_item">Single Item</SelectItem>
                      <SelectItem value="batch_production">Batch Production</SelectItem>
                      <SelectItem value="custom_order">Custom Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={saveEstimate} disabled={!estimateName}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={exportEstimate}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={clearEstimate}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Labor Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Labor Tasks</span>
                <Button onClick={addTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task, index) => {
                  const categoryInfo = getCategoryInfo(task.category)
                  return (
                    <div key={task.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Task {index + 1}</Badge>
                          <Badge className={categoryInfo.color}>
                            {categoryInfo.icon} {categoryInfo.name}
                          </Badge>
                          <Badge className={getSkillLevelColor(task.skillLevel)}>
                            {task.skillLevel}
                          </Badge>
                        </div>
                        {tasks.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label>Task Name</Label>
                          <Input
                            placeholder="Fabric Cutting"
                            value={task.name}
                            onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select 
                            value={task.category} 
                            onValueChange={(value: any) => updateTask(task.id, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {taskCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Skill Level</Label>
                          <Select 
                            value={task.skillLevel} 
                            onValueChange={(value: any) => updateTask(task.id, 'skillLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entry">Entry (${skillLevelRates.entry}/hr)</SelectItem>
                              <SelectItem value="intermediate">Intermediate (${skillLevelRates.intermediate}/hr)</SelectItem>
                              <SelectItem value="advanced">Advanced (${skillLevelRates.advanced}/hr)</SelectItem>
                              <SelectItem value="expert">Expert (${skillLevelRates.expert}/hr)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Complexity (1-5)</Label>
                          <Select 
                            value={task.complexity.toString()} 
                            onValueChange={(value) => updateTask(task.id, 'complexity', Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Very Simple</SelectItem>
                              <SelectItem value="2">2 - Simple</SelectItem>
                              <SelectItem value="3">3 - Moderate</SelectItem>
                              <SelectItem value="4">4 - Complex</SelectItem>
                              <SelectItem value="5">5 - Very Complex</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Estimated Hours</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.25"
                            value={task.estimatedHours}
                            onChange={(e) => updateTask(task.id, 'estimatedHours', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Hourly Rate ($)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={task.hourlyRate}
                            onChange={(e) => updateTask(task.id, 'hourlyRate', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Total Cost</Label>
                          <Input
                            value={`$${task.totalCost.toFixed(2)}`}
                            readOnly
                            className="bg-gray-50 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Notes</Label>
                        <Input
                          placeholder="Additional notes or requirements"
                          value={task.notes}
                          onChange={(e) => updateTask(task.id, 'notes', e.target.value)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Labor Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Labor Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{getTotalHours().toFixed(1)}h</div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium">${getTotalCost().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Rate:</span>
                    <span className="font-medium">${getAverageHourlyRate().toFixed(2)}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost/Unit:</span>
                    <span className="font-medium">${getCostPerUnit().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{quantity} units</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Project Total:</span>
                    <span>${(getTotalCost() * quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(getCategoryBreakdown()).map(([categoryId, data]) => {
                  if (data.tasks === 0) return null
                  const categoryInfo = getCategoryInfo(categoryId)
                  return (
                    <div key={categoryId} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{categoryInfo.icon}</span>
                        <span className="text-sm">{categoryInfo.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${data.cost.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{data.hours.toFixed(1)}h</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Skill Level Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Level Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(getSkillLevelBreakdown()).map(([level, data]) => {
                  if (data.tasks === 0) return null
                  return (
                    <div key={level} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={getSkillLevelColor(level)} variant="outline">
                          {level}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${data.cost.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{data.hours.toFixed(1)}h • {data.tasks} tasks</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Complexity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Complexity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{getComplexityAnalysis().average.toFixed(1)}/5</span>
                </div>
                <div className="text-xs text-gray-500">
                  {getComplexityAnalysis().average >= 4 && "High complexity project"}
                  {getComplexityAnalysis().average >= 2.5 && getComplexityAnalysis().average < 4 && "Moderate complexity"}
                  {getComplexityAnalysis().average < 2.5 && "Low complexity project"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Estimates */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Estimates ({savedEstimates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {savedEstimates.length > 0 ? (
                <div className="space-y-3">
                  {savedEstimates.slice(0, 3).map((estimate) => (
                    <div 
                      key={estimate.id} 
                      className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => loadEstimate(estimate)}
                    >
                      <div className="font-medium text-sm truncate">{estimate.name}</div>
                      <div className="text-xs text-gray-500">
                        {estimate.totalHours.toFixed(1)}h • ${estimate.totalCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {estimate.tasks.length} tasks • {new Date(estimate.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {savedEstimates.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{savedEstimates.length - 3} more estimates
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">No saved estimates</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
