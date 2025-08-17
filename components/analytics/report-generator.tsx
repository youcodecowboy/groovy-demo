"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Users, 
  Package, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Zap,
  Lightbulb,
  Settings
} from "lucide-react"

interface ReportGeneratorProps {
  items: any[]
  completedItems: any[]
  workflows: any[]
  users: any[]
  activityLog: any[]
  scans: any[]
}

const reportTemplates = [
  {
    id: "production-summary",
    name: "Production Summary",
    description: "Overview of production metrics and completion rates",
    icon: BarChart3,
    metrics: ["total_items", "completion_rate", "quality_score", "avg_completion_time"],
    suggested: true
  },
  {
    id: "team-performance",
    name: "Team Performance",
    description: "Individual and team productivity analysis",
    icon: Users,
    metrics: ["user_completion_rates", "team_efficiency", "workload_distribution"],
    suggested: true
  },
  {
    id: "workflow-analysis",
    name: "Workflow Analysis",
    description: "Detailed workflow performance and bottlenecks",
    icon: TrendingUp,
    metrics: ["workflow_completion_rates", "stage_performance", "bottleneck_identification"],
    suggested: false
  },
  {
    id: "quality-report",
    name: "Quality Report",
    description: "Quality metrics and defect analysis",
    icon: CheckCircle,
    metrics: ["defect_rate", "quality_trends", "defect_categories"],
    suggested: false
  },
  {
    id: "activity-audit",
    name: "Activity Audit",
    description: "System activity and user engagement",
    icon: Activity,
    metrics: ["user_activity", "scan_success_rate", "system_usage"],
    suggested: false
  },
  {
    id: "custom-report",
    name: "Custom Report",
    description: "Build your own report with selected metrics",
    icon: Settings,
    metrics: [],
    suggested: false,
    customizable: true
  }
]

const availableMetrics = [
  { id: "total_items", name: "Total Items", category: "Production" },
  { id: "active_items", name: "Active Items", category: "Production" },
  { id: "completed_items", name: "Completed Items", category: "Production" },
  { id: "completion_rate", name: "Completion Rate", category: "Production" },
  { id: "avg_completion_time", name: "Average Completion Time", category: "Production" },
  { id: "quality_score", name: "Quality Score", category: "Quality" },
  { id: "defect_rate", name: "Defect Rate", category: "Quality" },
  { id: "user_completion_rates", name: "User Completion Rates", category: "Team" },
  { id: "team_efficiency", name: "Team Efficiency", category: "Team" },
  { id: "workload_distribution", name: "Workload Distribution", category: "Team" },
  { id: "workflow_completion_rates", name: "Workflow Completion Rates", category: "Workflow" },
  { id: "stage_performance", name: "Stage Performance", category: "Workflow" },
  { id: "bottleneck_identification", name: "Bottleneck Identification", category: "Workflow" },
  { id: "quality_trends", name: "Quality Trends", category: "Quality" },
  { id: "defect_categories", name: "Defect Categories", category: "Quality" },
  { id: "user_activity", name: "User Activity", category: "Activity" },
  { id: "scan_success_rate", name: "Scan Success Rate", category: "Activity" },
  { id: "system_usage", name: "System Usage", category: "Activity" }
]

export function ReportGenerator({
  items,
  completedItems,
  workflows,
  users,
  activityLog,
  scans
}: ReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [dateRange, setDateRange] = useState("30d")
  const [reportFormat, setReportFormat] = useState("pdf")
  const [generatedReport, setGeneratedReport] = useState<any>(null)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = reportTemplates.find(t => t.id === templateId)
    if (template && !template.customizable) {
      setSelectedMetrics(template.metrics)
    } else {
      setSelectedMetrics([])
    }
  }

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    )
  }

  const generateReport = () => {
    // Simulate report generation
    const report = {
      id: Date.now(),
      template: selectedTemplate,
      metrics: selectedMetrics,
      dateRange,
      format: reportFormat,
      generatedAt: new Date().toISOString(),
      data: {
        totalItems: items?.length || 0,
        completedItems: completedItems?.length || 0,
        completionRate: items?.length > 0 ? (completedItems?.length || 0) / items.length * 100 : 0,
        qualityScore: items?.length > 0 ? ((items.length - (items.filter(i => i.isDefective).length)) / items.length) * 100 : 100,
        avgCompletionTime: completedItems?.length > 0 
          ? completedItems.reduce((acc, item) => acc + (item.completedAt - item.startedAt), 0) / completedItems.length / (1000 * 60 * 60)
          : 0
      }
    }
    setGeneratedReport(report)
  }

  const downloadReport = () => {
    // Simulate download
    console.log("Downloading report:", generatedReport)
  }

  return (
    <div className="space-y-6">
      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Templates
          </CardTitle>
          <CardDescription>
            Choose from pre-built templates or create a custom report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <template.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{template.name}</h4>
                        {template.suggested && (
                          <Badge variant="secondary" className="text-xs">
                            <Lightbulb className="h-3 w-3 mr-1" />
                            Suggested
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      {template.metrics.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            Includes: {template.metrics.length} metrics
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Configuration */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Report Configuration
            </CardTitle>
            <CardDescription>
              Customize your report settings and metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="flex gap-2">
                {["7d", "30d", "90d", "1y"].map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            {/* Metrics Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Select Metrics</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(
                  availableMetrics.reduce((acc, metric) => {
                    if (!acc[metric.category]) acc[metric.category] = []
                    acc[metric.category].push(metric)
                    return acc
                  }, {} as Record<string, typeof availableMetrics>)
                ).map(([category, metrics]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                    {metrics.map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={metric.id}
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={() => handleMetricToggle(metric.id)}
                        />
                        <label
                          htmlFor={metric.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {metric.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Report Format */}
            <div>
              <label className="text-sm font-medium mb-2 block">Report Format</label>
              <div className="flex gap-2">
                {["pdf", "excel", "csv"].map((format) => (
                  <Button
                    key={format}
                    variant={reportFormat === format ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReportFormat(format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-2">
              <Button 
                onClick={generateReport}
                disabled={selectedMetrics.length === 0}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
              {generatedReport && (
                <Button 
                  variant="outline"
                  onClick={downloadReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Report Preview */}
      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Preview
            </CardTitle>
            <CardDescription>
              Generated on {new Date(generatedReport.generatedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{generatedReport.data.totalItems}</div>
                  <div className="text-sm text-blue-700">Total Items</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">{generatedReport.data.completedItems}</div>
                  <div className="text-sm text-green-700">Completed Items</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">{generatedReport.data.completionRate.toFixed(1)}%</div>
                  <div className="text-sm text-purple-700">Completion Rate</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900">{generatedReport.data.qualityScore.toFixed(1)}%</div>
                  <div className="text-sm text-orange-700">Quality Score</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Report Details</h4>
                <div className="text-sm text-muted-foreground">
                  <p>Template: {reportTemplates.find(t => t.id === generatedReport.template)?.name}</p>
                  <p>Metrics: {generatedReport.metrics.length} selected</p>
                  <p>Date Range: {generatedReport.dateRange}</p>
                  <p>Format: {generatedReport.format.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions
          </CardTitle>
          <CardDescription>
            AI-powered recommendations for your reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">High Completion Rate Trend</p>
                <p className="text-sm text-blue-700">
                  Your completion rate has increased by 15% this month. Consider adding "Completion Rate Trends" to your report.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Quality Improvement Opportunity</p>
                <p className="text-sm text-green-700">
                  Quality score is at 95%. Adding "Quality Trends" and "Defect Categories" could help identify improvement areas.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Workflow Bottleneck Detected</p>
                <p className="text-sm text-orange-700">
                  Stage 3 shows slower completion times. Include "Stage Performance" and "Bottleneck Identification" in your analysis.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
