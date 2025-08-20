"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Scissors, 
  Download, 
  Upload, 
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Copy,
  Trash2,
  Share2,
  Layers,
  Ruler,
  Palette,
  FileText,
  Users,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"

// Mock data for pattern making
const mockPatterns = [
  {
    id: 1,
    name: "Classic Denim Jacket",
    category: "Outerwear",
    designer: "Sarah Chen",
    status: "completed",
    priority: "high",
    createdAt: "2024-01-15",
    lastModified: "2024-02-01",
    version: "2.1",
    sizeRange: ["XS", "S", "M", "L", "XL", "XXL"],
    complexity: "intermediate",
    pieces: 8,
    fabricType: "Denim",
    measurements: "Standard",
    grading: "automated",
    files: ["front.pdf", "back.pdf", "sleeve.pdf", "collar.pdf"],
    description: "Classic denim jacket with modern fit and detailed construction",
    rating: 4.8,
    downloads: 156,
    collaborators: ["Mike Johnson", "Lisa Rodriguez"]
  },
  {
    id: 2,
    name: "Fitted T-Shirt Basic",
    category: "Tops",
    designer: "Mike Johnson",
    status: "in-progress",
    priority: "medium",
    createdAt: "2024-01-28",
    lastModified: "2024-02-03",
    version: "1.3",
    sizeRange: ["XS", "S", "M", "L", "XL"],
    complexity: "beginner",
    pieces: 3,
    fabricType: "Cotton",
    measurements: "Fitted",
    grading: "manual",
    files: ["front.pdf", "back.pdf", "sleeve.pdf"],
    description: "Basic fitted t-shirt pattern with clean lines",
    rating: 4.2,
    downloads: 89,
    collaborators: ["Sarah Chen"]
  },
  {
    id: 3,
    name: "A-Line Skirt",
    category: "Bottoms",
    designer: "Emma Davis",
    status: "review",
    priority: "low",
    createdAt: "2024-02-01",
    lastModified: "2024-02-05",
    version: "1.0",
    sizeRange: ["XS", "S", "M", "L", "XL"],
    complexity: "beginner",
    pieces: 4,
    fabricType: "Wool",
    measurements: "Standard",
    grading: "automated",
    files: ["front.pdf", "back.pdf", "waistband.pdf"],
    description: "Classic A-line skirt with waistband",
    rating: 4.5,
    downloads: 67,
    collaborators: ["Alex Thompson"]
  },
  {
    id: 4,
    name: "Cable Knit Sweater",
    category: "Knitwear",
    designer: "Alex Thompson",
    status: "draft",
    priority: "high",
    createdAt: "2024-01-20",
    lastModified: "2024-02-02",
    version: "0.8",
    sizeRange: ["S", "M", "L", "XL"],
    complexity: "advanced",
    pieces: 12,
    fabricType: "Wool",
    measurements: "Oversized",
    grading: "manual",
    files: ["front.pdf", "back.pdf", "sleeve.pdf", "cable-chart.pdf"],
    description: "Complex cable knit sweater with detailed stitch patterns",
    rating: 4.9,
    downloads: 234,
    collaborators: ["Sarah Chen", "Mike Johnson", "Emma Davis"]
  }
]

const mockCategories = [
  { id: 1, name: "Outerwear", count: 15, color: "bg-blue-100 text-blue-800" },
  { id: 2, name: "Tops", count: 28, color: "bg-green-100 text-green-800" },
  { id: 3, name: "Bottoms", count: 22, color: "bg-purple-100 text-purple-800" },
  { id: 4, name: "Dresses", count: 18, color: "bg-pink-100 text-pink-800" },
  { id: 5, name: "Knitwear", count: 12, color: "bg-orange-100 text-orange-800" },
  { id: 6, name: "Accessories", count: 8, color: "bg-gray-100 text-gray-800" }
]

const mockTools = [
  { id: 1, name: "Pattern Grading", status: "active", efficiency: 95 },
  { id: 2, name: "Measurement Calculator", status: "active", efficiency: 88 },
  { id: 3, name: "Fabric Calculator", status: "maintenance", efficiency: 92 },
  { id: 4, name: "Size Chart Generator", status: "active", efficiency: 97 }
]

export default function PatternMakingPage() {
  const [selectedView, setSelectedView] = useState<'patterns' | 'library' | 'tools' | 'analytics'>('patterns')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
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

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPatterns = mockPatterns.filter(pattern => {
    if (selectedStatus !== 'all' && pattern.status !== selectedStatus) return false
    if (selectedCategory !== 'all' && pattern.category !== selectedCategory) return false
    if (searchQuery && !pattern.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pattern Making</h1>
          <p className="text-gray-600">Digital pattern creation and management system</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Pattern
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Pattern
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'patterns', label: 'Patterns', icon: Scissors },
          { key: 'library', label: 'Library', icon: FileText },
          { key: 'tools', label: 'Tools', icon: Ruler },
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

      {/* Patterns View */}
      {selectedView === 'patterns' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patterns..."
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
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="draft">Draft</option>
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

          {/* Patterns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatterns.map((pattern) => (
              <Card key={pattern.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{pattern.name}</CardTitle>
                      <CardDescription>v{pattern.version} • {pattern.designer}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(pattern.status)}>
                        {pattern.status}
                      </Badge>
                      <Badge className={getPriorityColor(pattern.priority)}>
                        {pattern.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pattern Preview */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Layers className="h-8 w-8 text-gray-400" />
                  </div>

                  <p className="text-sm text-gray-600">{pattern.description}</p>

                  {/* Pattern Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Complexity</span>
                      <Badge className={`mt-1 ${getComplexityColor(pattern.complexity)}`}>
                        {pattern.complexity}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pieces</span>
                      <div className="font-medium">{pattern.pieces}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fabric</span>
                      <div className="font-medium">{pattern.fabricType}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Grading</span>
                      <div className="font-medium">{pattern.grading}</div>
                    </div>
                  </div>

                  {/* Size Range */}
                  <div>
                    <span className="text-sm text-muted-foreground">Size Range</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pattern.sizeRange.map((size, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Files */}
                  <div>
                    <span className="text-sm text-muted-foreground">Pattern Files</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pattern.files.map((file, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{pattern.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{pattern.downloads}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
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

      {/* Library View */}
      {selectedView === 'library' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pattern Library</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add to Library
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge className={category.color}>
                      {category.count} patterns
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Completed</span>
                      <span className="font-medium">{Math.floor(category.count * 0.6)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>In Progress</span>
                      <span className="font-medium">{Math.floor(category.count * 0.3)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Drafts</span>
                      <span className="font-medium">{Math.floor(category.count * 0.1)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Browse
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Templates
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tools View */}
      {selectedView === 'tools' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pattern Making Tools</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTools.map((tool) => (
              <Card key={tool.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <Badge className={tool.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {tool.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Efficiency</span>
                      <span>{tool.efficiency}%</span>
                    </div>
                    <Progress value={tool.efficiency} />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Launch
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Measurement Calculator</CardTitle>
                <CardDescription>Calculate pattern measurements and grading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Base Size</label>
                      <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm">
                        <option>XS</option>
                        <option>S</option>
                        <option>M</option>
                        <option>L</option>
                        <option>XL</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Target Size</label>
                      <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm">
                        <option>XS</option>
                        <option>S</option>
                        <option>M</option>
                        <option>L</option>
                        <option>XL</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full">Calculate Grading</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fabric Calculator</CardTitle>
                <CardDescription>Calculate fabric requirements for patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Fabric Width</label>
                    <input type="number" placeholder="150" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <input type="number" placeholder="10" className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                  </div>
                  <Button className="w-full">Calculate Requirements</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {selectedView === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Pattern Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patterns</CardTitle>
                <Scissors className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +18% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  +3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Creation Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 days</div>
                <p className="text-xs text-muted-foreground">
                  -0.8 days from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Designers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  8 working today
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pattern Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'Completed', count: 745, color: 'bg-green-500' },
                    { status: 'In Progress', count: 234, color: 'bg-blue-500' },
                    { status: 'Review', count: 156, color: 'bg-yellow-500' },
                    { status: 'Draft', count: 112, color: 'bg-gray-500' }
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
