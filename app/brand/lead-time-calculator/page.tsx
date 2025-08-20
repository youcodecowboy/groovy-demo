"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Calculator, Calendar, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

interface LeadTimePhase {
  id: string
  name: string
  duration: number
  unit: 'days' | 'weeks' | 'months'
  isOptional: boolean
  description: string
}

interface LeadTimeCalculation {
  totalDays: number
  totalWeeks: number
  totalMonths: number
  startDate: Date
  endDate: Date
  phases: LeadTimePhase[]
}

const defaultPhases: LeadTimePhase[] = [
  {
    id: "1",
    name: "Design & Development",
    duration: 7,
    unit: "days",
    isOptional: false,
    description: "Brand design and product development phase"
  },
  {
    id: "2",
    name: "Sample Production",
    duration: 5,
    unit: "days",
    isOptional: true,
    description: "Sample creation and approval process"
  },
  {
    id: "3",
    name: "Material Sourcing",
    duration: 10,
    unit: "days",
    isOptional: false,
    description: "Sourcing and procurement of materials"
  },
  {
    id: "4",
    name: "Production",
    duration: 14,
    unit: "days",
    isOptional: false,
    description: "Main production and manufacturing"
  },
  {
    id: "5",
    name: "Quality Control",
    duration: 3,
    unit: "days",
    isOptional: false,
    description: "Quality inspection and testing"
  },
  {
    id: "6",
    name: "Packaging & Labeling",
    duration: 2,
    unit: "days",
    isOptional: false,
    description: "Final packaging and brand labeling"
  },
  {
    id: "7",
    name: "Shipping & Delivery",
    duration: 7,
    unit: "days",
    isOptional: false,
    description: "Transportation and final delivery"
  }
]

export default function LeadTimeCalculatorPage() {
  const [phases, setPhases] = useState<LeadTimePhase[]>(defaultPhases)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [calculation, setCalculation] = useState<LeadTimeCalculation | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const templates = [
    { id: "fast-track", name: "Fast Track", description: "Quick turnaround for urgent orders", multiplier: 0.7 },
    { id: "standard", name: "Standard", description: "Normal production timeline", multiplier: 1.0 },
    { id: "premium", name: "Premium", description: "High-quality production with extra care", multiplier: 1.3 },
    { id: "custom", name: "Custom", description: "Fully customizable timeline", multiplier: 1.0 }
  ]

  const calculateLeadTime = () => {
    const selectedTemplateData = templates.find(t => t.id === selectedTemplate)
    const multiplier = selectedTemplateData?.multiplier || 1.0

    let totalDays = 0
    const activePhases = phases.filter(phase => !phase.isOptional || phase.duration > 0)

    activePhases.forEach(phase => {
      let phaseDays = phase.duration
      switch (phase.unit) {
        case 'weeks':
          phaseDays = phase.duration * 7
          break
        case 'months':
          phaseDays = phase.duration * 30
          break
      }
      totalDays += phaseDays
    })

    // Apply template multiplier
    totalDays = Math.round(totalDays * multiplier)

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + totalDays)

    const result: LeadTimeCalculation = {
      totalDays,
      totalWeeks: Math.round(totalDays / 7 * 10) / 10,
      totalMonths: Math.round(totalDays / 30 * 10) / 10,
      startDate: start,
      endDate: end,
      phases: activePhases
    }

    setCalculation(result)
  }

  const updatePhase = (id: string, field: keyof LeadTimePhase, value: any) => {
    setPhases(prev => prev.map(phase => 
      phase.id === id ? { ...phase, [field]: value } : phase
    ))
  }

  const addPhase = () => {
    const newPhase: LeadTimePhase = {
      id: Date.now().toString(),
      name: "",
      duration: 1,
      unit: "days",
      isOptional: false,
      description: ""
    }
    setPhases(prev => [...prev, newPhase])
  }

  const removePhase = (id: string) => {
    setPhases(prev => prev.filter(phase => phase.id !== id))
  }

  const getTimelineStatus = (totalDays: number) => {
    if (totalDays <= 14) return { status: "Fast", color: "bg-green-100 text-green-800", icon: CheckCircle }
    if (totalDays <= 30) return { status: "Standard", color: "bg-blue-100 text-blue-800", icon: Clock }
    return { status: "Extended", color: "bg-orange-100 text-orange-800", icon: AlertTriangle }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Time Calculator</h1>
          <p className="text-gray-600">Calculate accurate lead times for brand operations and production</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Production Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a production template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedTemplate && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {templates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Start Date */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Project Start Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Production Phases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Production Phases</span>
                <Button onClick={addPhase} size="sm">
                  Add Phase
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Phase {index + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`optional-${phase.id}`}
                          checked={phase.isOptional}
                          onChange={(e) => updatePhase(phase.id, 'isOptional', e.target.checked)}
                        />
                        <Label htmlFor={`optional-${phase.id}`} className="text-sm">Optional</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePhase(phase.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Phase Name</Label>
                      <Input
                        value={phase.name}
                        onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                        placeholder="e.g., Design & Development"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Duration</Label>
                        <Input
                          type="number"
                          min="0"
                          value={phase.duration}
                          onChange={(e) => updatePhase(phase.id, 'duration', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select 
                          value={phase.unit} 
                          onValueChange={(value: 'days' | 'weeks' | 'months') => updatePhase(phase.id, 'unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={phase.description}
                        onChange={(e) => updatePhase(phase.id, 'description', e.target.value)}
                        placeholder="Brief description of this phase"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calculate Button */}
          <Button 
            onClick={calculateLeadTime} 
            className="w-full"
            size="lg"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Lead Time
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {calculation ? (
            <>
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Lead Time Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{calculation.totalDays}</div>
                        <div className="text-sm text-gray-600">Days</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{calculation.totalWeeks}</div>
                        <div className="text-sm text-gray-600">Weeks</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{calculation.totalMonths}</div>
                        <div className="text-sm text-gray-600">Months</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(() => {
                        const status = getTimelineStatus(calculation.totalDays)
                        const IconComponent = status.icon
                        return (
                          <>
                            <IconComponent className="h-4 w-4" />
                            <Badge className={status.color}>
                              {status.status} Timeline
                            </Badge>
                          </>
                        )
                      })()}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{calculation.startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Completion:</span>
                        <span className="font-medium">{calculation.endDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Production Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calculation.phases.map((phase, index) => {
                      let phaseDays = phase.duration
                      switch (phase.unit) {
                        case 'weeks':
                          phaseDays = phase.duration * 7
                          break
                        case 'months':
                          phaseDays = phase.duration * 30
                          break
                      }

                      const startDate = new Date(calculation.startDate)
                      const phaseStart = new Date(startDate)
                      phaseStart.setDate(startDate.getDate() + calculation.phases.slice(0, index).reduce((acc, p) => {
                        let pDays = p.duration
                        switch (p.unit) {
                          case 'weeks':
                            pDays = p.duration * 7
                            break
                          case 'months':
                            pDays = p.duration * 30
                            break
                        }
                        return acc + pDays
                      }, 0))

                      const phaseEnd = new Date(phaseStart)
                      phaseEnd.setDate(phaseStart.getDate() + phaseDays)

                      return (
                        <div key={phase.id} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{phase.name}</div>
                              <div className="text-sm text-gray-600">{phase.description}</div>
                              <div className="text-xs text-gray-500">
                                {phaseStart.toLocaleDateString()} - {phaseEnd.toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{phase.duration} {phase.unit}</div>
                              {phase.isOptional && (
                                <Badge variant="outline" className="text-xs">Optional</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calculation.totalDays > 30 && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-yellow-800">Extended Timeline</div>
                          <div className="text-sm text-yellow-700">
                            Consider breaking down longer phases or adding parallel processes to reduce lead time.
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {calculation.phases.filter(p => p.isOptional).length > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-800">Optional Phases</div>
                          <div className="text-sm text-blue-700">
                            You have {calculation.phases.filter(p => p.isOptional).length} optional phases that can be skipped if needed.
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800">Optimization Tips</div>
                        <div className="text-sm text-green-700">
                          • Consider parallel processing for independent phases<br/>
                          • Review material sourcing lead times<br/>
                          • Plan for quality control bottlenecks
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Calculate Lead Time</h3>
                  <p className="text-gray-600">Select a template and configure your production phases to calculate lead time</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
