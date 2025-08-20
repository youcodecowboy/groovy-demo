"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Palette, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  Filter,
  Download,
  Upload,
  MessageSquare,
  Users,
  Calendar,
  Star,
  Image as ImageIcon,
  FileText,
  Share2
} from "lucide-react"

// Mock data for sample studio
const mockSamples = [
  {
    id: 1,
    name: "Denim Jacket V1",
    category: "Outerwear",
    designer: "Sarah Chen",
    status: "pending-approval",
    priority: "high",
    createdAt: "2024-02-01",
    dueDate: "2024-02-10",
    progress: 75,
    version: "1.0",
    images: ["/sample1.jpg", "/sample2.jpg"],
    description: "Classic denim jacket with modern fit",
    reviewers: ["John Smith", "Lisa Rodriguez"],
    comments: 5,
    rating: 4.2
  },
  {
    id: 2,
    name: "Cotton T-Shirt Collection",
    category: "Tops",
    designer: "Mike Johnson",
    status: "approved",
    priority: "medium",
    createdAt: "2024-01-28",
    dueDate: "2024-02-05",
    progress: 100,
    version: "2.1",
    images: ["/sample3.jpg"],
    description: "Premium cotton t-shirt collection in 5 colors",
    reviewers: ["Sarah Chen", "David Wilson"],
    comments: 12,
    rating: 4.8
  },
  {
    id: 3,
    name: "Wool Sweater Pattern",
    category: "Knitwear",
    designer: "Emma Davis",
    status: "in-review",
    priority: "low",
    createdAt: "2024-02-03",
    dueDate: "2024-02-15",
    progress: 45,
    version: "1.2",
    images: ["/sample4.jpg", "/sample5.jpg", "/sample6.jpg"],
    description: "Cozy wool sweater with cable knit pattern",
    reviewers: ["Mike Johnson"],
    comments: 3,
    rating: 3.9
  },
  {
    id: 4,
    name: "Leather Bag Prototype",
    category: "Accessories",
    designer: "Alex Thompson",
    status: "rejected",
    priority: "high",
    createdAt: "2024-01-25",
    dueDate: "2024-02-08",
    progress: 60,
    version: "1.5",
    images: ["/sample7.jpg"],
    description: "Premium leather crossbody bag",
    reviewers: ["Sarah Chen", "John Smith", "Lisa Rodriguez"],
    comments: 8,
    rating: 2.5
  }
]

const mockCategories = [
  { id: 1, name: "Outerwear", count: 12, color: "bg-blue-100 text-blue-800" },
  { id: 2, name: "Tops", count: 25, color: "bg-green-100 text-green-800" },
  { id: 3, name: "Bottoms", count: 18, color: "bg-purple-100 text-purple-800" },
  { id: 4, name: "Dresses", count: 15, color: "bg-pink-100 text-pink-800" },
  { id: 5, name: "Knitwear", count: 8, color: "bg-orange-100 text-orange-800" },
  { id: 6, name: "Accessories", count: 22, color: "bg-gray-100 text-gray-800" }
]

const mockReviewers = [
  { id: 1, name: "John Smith", role: "Creative Director", avatar: "/avatar1.jpg", availability: "available" },
  { id: 2, name: "Sarah Chen", role: "Senior Designer", avatar: "/avatar2.jpg", availability: "busy" },
  { id: 3, name: "Lisa Rodriguez", role: "Product Manager", avatar: "/avatar3.jpg", availability: "available" },
  { id: 4, name: "David Wilson", role: "Quality Control", avatar: "/avatar4.jpg", availability: "offline" }
]

export default function SampleStudioPage() {
  const [selectedView, setSelectedView] = useState<'samples' | 'categories' | 'reviewers' | 'analytics'>('samples')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending-approval': return 'bg-yellow-100 text-yellow-800'
      case 'in-review': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSamples = mockSamples.filter(sample => {
    if (selectedStatus !== 'all' && sample.status !== selectedStatus) return false
    if (selectedCategory !== 'all' && sample.category !== selectedCategory) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Studio</h1>
          <p className="text-gray-600">Digital sample management and approval workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Sample
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Sample
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'samples', label: 'Samples', icon: Palette },
          { key: 'categories', label: 'Categories', icon: FileText },
          { key: 'reviewers', label: 'Reviewers', icon: Users },
          { key: 'analytics', label: 'Analytics', icon: Star }
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

      {/* Samples View */}
      {selectedView === 'samples' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending-approval">Pending Approval</option>
                <option value="in-review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Category:</span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Categories</option>
                {mockCategories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Samples Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSamples.map((sample) => (
              <Card key={sample.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{sample.name}</CardTitle>
                      <CardDescription>v{sample.version} • {sample.designer}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(sample.status)}>
                        {sample.status.replace('-', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(sample.priority)}>
                        {sample.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sample Images */}
                  <div className="flex gap-2">
                    {sample.images.map((image, index) => (
                      <div key={index} className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600">{sample.description}</p>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{sample.progress}%</span>
                    </div>
                    <Progress value={sample.progress} />
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Due Date</span>
                      <div className="font-medium">{sample.dueDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{sample.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reviewers */}
                  <div>
                    <span className="text-sm text-muted-foreground">Reviewers</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sample.reviewers.map((reviewer, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reviewer}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {sample.comments}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories View */}
      {selectedView === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sample Categories</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge className={category.color}>
                      {category.count} samples
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Active Samples</span>
                      <span className="font-medium">{Math.floor(category.count * 0.7)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Pending Review</span>
                      <span className="font-medium">{Math.floor(category.count * 0.3)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Approval Rate</span>
                      <span className="font-medium text-green-600">85%</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Samples
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviewers View */}
      {selectedView === 'reviewers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Review Team</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Reviewer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockReviewers.map((reviewer) => (
              <Card key={reviewer.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{reviewer.name}</CardTitle>
                      <CardDescription>{reviewer.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getAvailabilityColor(reviewer.availability)}>
                      {reviewer.availability}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Samples Reviewed</span>
                      <div className="font-medium">24</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Response Time</span>
                      <div className="font-medium">2.3 days</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
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
          <h2 className="text-xl font-semibold">Sample Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2 days</div>
                <p className="text-xs text-muted-foreground">
                  -0.5 days from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Reviewers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  2 available now
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sample Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'Approved', count: 45, color: 'bg-green-500' },
                    { status: 'Pending Approval', count: 23, color: 'bg-yellow-500' },
                    { status: 'In Review', count: 18, color: 'bg-blue-500' },
                    { status: 'Rejected', count: 12, color: 'bg-red-500' }
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

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCategories.slice(0, 5).map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <span className="text-sm">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.floor(Math.random() * 100)}%</span>
                      </div>
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
