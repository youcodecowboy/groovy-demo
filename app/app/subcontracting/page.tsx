"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
  Star,
  Shield,
  Activity,
  MessageSquare,
  Award,
  Target
} from "lucide-react"

// Mock data for subcontracting management
const mockSubcontractors = [
  {
    id: 1,
    name: "Precision Stitching Co.",
    contact: "Sarah Johnson",
    email: "sarah@precisionstitching.com",
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA",
    status: "active",
    rating: 4.8,
    specialization: "Garment Assembly",
    capacity: 1000,
    currentLoad: 750,
    onTimeDelivery: 95,
    qualityScore: 92,
    contractValue: "$125,000",
    activeProjects: 8,
    completedProjects: 156,
    paymentTerms: "Net 30",
    certifications: ["ISO 9001", "Fair Trade"],
    lastCommunication: "2024-02-08 14:30"
  },
  {
    id: 2,
    name: "Elite Finishing Services",
    contact: "Mike Chen",
    email: "mike@elitefinishing.com",
    phone: "+1 (555) 234-5678",
    location: "New York, NY",
    status: "active",
    rating: 4.6,
    specialization: "Quality Control & Finishing",
    capacity: 800,
    currentLoad: 600,
    onTimeDelivery: 88,
    qualityScore: 89,
    contractValue: "$95,000",
    activeProjects: 6,
    completedProjects: 89,
    paymentTerms: "Net 45",
    certifications: ["ISO 14001", "GOTS"],
    lastCommunication: "2024-02-07 16:45"
  },
  {
    id: 3,
    name: "Swift Logistics Solutions",
    contact: "Lisa Rodriguez",
    email: "lisa@swiftlogistics.com",
    phone: "+1 (555) 345-6789",
    location: "Chicago, IL",
    status: "review",
    rating: 4.2,
    specialization: "Transportation & Distribution",
    capacity: 500,
    currentLoad: 300,
    onTimeDelivery: 82,
    qualityScore: 85,
    contractValue: "$75,000",
    activeProjects: 4,
    completedProjects: 45,
    paymentTerms: "Net 30",
    certifications: ["ISO 9001"],
    lastCommunication: "2024-02-06 11:20"
  },
  {
    id: 4,
    name: "Artisan Textile Works",
    contact: "David Wilson",
    email: "david@artisantextile.com",
    phone: "+1 (555) 456-7890",
    location: "Miami, FL",
    status: "suspended",
    rating: 3.8,
    specialization: "Specialty Fabric Processing",
    capacity: 300,
    currentLoad: 0,
    onTimeDelivery: 75,
    qualityScore: 78,
    contractValue: "$45,000",
    activeProjects: 0,
    completedProjects: 23,
    paymentTerms: "Net 60",
    certifications: ["Fair Trade"],
    lastCommunication: "2024-02-05 09:15"
  }
]

const mockProjects = [
  {
    id: 1,
    name: "Spring Collection Assembly",
    subcontractor: "Precision Stitching Co.",
    status: "in-progress",
    priority: "high",
    startDate: "2024-02-01",
    dueDate: "2024-02-15",
    progress: 65,
    quantity: 500,
    completed: 325,
    value: "$25,000",
    qualityScore: 94,
    issues: []
  },
  {
    id: 2,
    name: "Denim Finishing Process",
    subcontractor: "Elite Finishing Services",
    status: "on-hold",
    priority: "medium",
    startDate: "2024-01-28",
    dueDate: "2024-02-20",
    progress: 45,
    quantity: 300,
    completed: 135,
    value: "$18,000",
    qualityScore: 87,
    issues: ["Material delay from supplier"]
  },
  {
    id: 3,
    name: "Distribution Network Setup",
    subcontractor: "Swift Logistics Solutions",
    status: "completed",
    priority: "low",
    startDate: "2024-01-15",
    dueDate: "2024-02-10",
    progress: 100,
    quantity: 200,
    completed: 200,
    value: "$12,000",
    qualityScore: 91,
    issues: []
  }
]

const mockQualityReports = [
  {
    id: 1,
    subcontractor: "Precision Stitching Co.",
    period: "January 2024",
    totalInspections: 45,
    passed: 42,
    failed: 3,
    qualityScore: 93.3,
    majorIssues: 1,
    minorIssues: 2,
    recommendations: ["Improve thread tension consistency", "Enhance final inspection process"]
  },
  {
    id: 2,
    subcontractor: "Elite Finishing Services",
    period: "January 2024",
    totalInspections: 38,
    passed: 34,
    failed: 4,
    qualityScore: 89.5,
    majorIssues: 2,
    minorIssues: 2,
    recommendations: ["Update quality control checklist", "Additional staff training needed"]
  }
]

export default function SubcontractingPage() {
  const [selectedView, setSelectedView] = useState<'subcontractors' | 'projects' | 'quality' | 'analytics'>('subcontractors')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSubcontractors = mockSubcontractors.filter(subcontractor => {
    if (selectedStatus !== 'all' && subcontractor.status !== selectedStatus) return false
    if (searchQuery && !subcontractor.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subcontracting Management</h1>
          <p className="text-gray-600">Manage subcontractor relationships and workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Subcontractor
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'subcontractors', label: 'Subcontractors', icon: Users },
          { key: 'projects', label: 'Projects', icon: Target },
          { key: 'quality', label: 'Quality', icon: Shield },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedView(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subcontractors View */}
      {selectedView === 'subcontractors' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search subcontractors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Subcontractors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSubcontractors.map((subcontractor) => (
              <Card key={subcontractor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{subcontractor.name}</CardTitle>
                      <CardDescription>
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {subcontractor.location}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(subcontractor.status)}>
                        {subcontractor.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{subcontractor.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Contact</span>
                      <div className="font-medium">{subcontractor.contact}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Specialization</span>
                      <div className="font-medium">{subcontractor.specialization}</div>
                    </div>
                  </div>

                  {/* Capacity and Load */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacity Utilization</span>
                      <span>{subcontractor.currentLoad}/{subcontractor.capacity} units</span>
                    </div>
                    <Progress value={(subcontractor.currentLoad / subcontractor.capacity) * 100} />
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">On-Time Delivery</span>
                      <div className="font-medium">{subcontractor.onTimeDelivery}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quality Score</span>
                      <div className="font-medium">{subcontractor.qualityScore}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active Projects</span>
                      <div className="font-medium">{subcontractor.activeProjects}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contract Value</span>
                      <div className="font-medium">{subcontractor.contractValue}</div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <span className="text-sm text-muted-foreground">Certifications</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {subcontractor.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Projects View */}
      {selectedView === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Projects</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="space-y-4">
            {mockProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Target className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.subcontractor}</p>
                        <p className="text-sm text-gray-500">
                          {project.completed}/{project.quantity} units completed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Progress</div>
                        <div className="font-semibold">{project.progress}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Value</div>
                        <div className="font-semibold">{project.value}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getProjectStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Date</span>
                      <div className="font-medium">{project.startDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due Date</span>
                      <div className="font-medium">{project.dueDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quality Score</span>
                      <div className="font-medium">{project.qualityScore}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Issues</span>
                      <div className="font-medium">{project.issues.length}</div>
                    </div>
                  </div>

                  {project.issues.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Issues</span>
                      </div>
                      <ul className="text-sm text-yellow-700">
                        {project.issues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quality View */}
      {selectedView === 'quality' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quality Reports</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockQualityReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.subcontractor}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800">
                      {report.period}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quality Score */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{report.qualityScore}%</div>
                    <div className="text-sm text-gray-600">Quality Score</div>
                  </div>

                  {/* Inspection Results */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{report.passed}</div>
                      <div className="text-xs text-gray-600">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">{report.failed}</div>
                      <div className="text-xs text-gray-600">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{report.totalInspections}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>

                  {/* Issues Breakdown */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Major Issues</span>
                      <div className="font-medium text-red-600">{report.majorIssues}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Minor Issues</span>
                      <div className="font-medium text-yellow-600">{report.minorIssues}</div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <span className="text-sm text-muted-foreground">Recommendations</span>
                    <ul className="mt-1 text-sm text-gray-700">
                      {report.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-1" />
                      View Full Report
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {selectedView === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Subcontracting Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subcontractors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  3 in review, 1 suspended
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">
                  $450K total value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">91%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  +3% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subcontractor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSubcontractors.slice(0, 4).map((subcontractor) => (
                    <div key={subcontractor.id} className="flex items-center justify-between">
                      <span className="text-sm">{subcontractor.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${subcontractor.qualityScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{subcontractor.qualityScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'Completed', count: 45, color: 'bg-green-500' },
                    { status: 'In Progress', count: 18, color: 'bg-blue-500' },
                    { status: 'On Hold', count: 8, color: 'bg-yellow-500' },
                    { status: 'Cancelled', count: 3, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.status}</span>
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
