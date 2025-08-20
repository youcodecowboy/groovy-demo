"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Palette, 
  Eye, 
  Edit, 
  Plus,
  Filter,
  Search,
  Download,
  Upload,
  Share2,
  MessageSquare,
  Users,
  Calendar,
  Star,
  FileText,
  Image as ImageIcon,
  Layers,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Heart,
  ThumbsUp,
  ThumbsDown,
  GitBranch,
  History,
  Settings
} from "lucide-react"

// Mock data for design management
const mockDesigns = [
  {
    id: 1,
    name: "Spring Collection 2024",
    category: "Collection",
    designer: "Sarah Chen",
    status: "in-review",
    priority: "high",
    createdAt: "2024-01-15",
    lastModified: "2024-02-05",
    version: "2.3",
    collaborators: ["Mike Johnson", "Lisa Rodriguez", "David Wilson"],
    description: "Complete spring collection featuring sustainable materials and modern silhouettes",
    rating: 4.8,
    likes: 156,
    views: 892,
    files: ["collection-overview.pdf", "mood-board.jpg", "color-palette.pdf"],
    tags: ["sustainable", "modern", "spring", "casual"],
    feedback: 12,
    approvalStatus: "pending"
  },
  {
    id: 2,
    name: "Denim Jacket Redesign",
    category: "Product",
    designer: "Mike Johnson",
    status: "approved",
    priority: "medium",
    createdAt: "2024-01-28",
    lastModified: "2024-02-03",
    version: "1.5",
    collaborators: ["Sarah Chen"],
    description: "Redesigned denim jacket with updated fit and sustainable wash techniques",
    rating: 4.6,
    likes: 89,
    views: 445,
    files: ["technical-drawing.pdf", "fabric-specs.pdf", "fit-photos.jpg"],
    tags: ["denim", "jacket", "sustainable", "fit"],
    feedback: 8,
    approvalStatus: "approved"
  },
  {
    id: 3,
    name: "Brand Identity Update",
    category: "Branding",
    designer: "Emma Davis",
    status: "draft",
    priority: "low",
    createdAt: "2024-02-01",
    lastModified: "2024-02-06",
    version: "0.8",
    collaborators: ["Alex Thompson", "Sarah Chen"],
    description: "Updated brand identity with new logo, color scheme, and typography",
    rating: 4.2,
    likes: 67,
    views: 234,
    files: ["logo-variations.pdf", "color-guide.pdf", "typography.pdf"],
    tags: ["branding", "logo", "identity", "typography"],
    feedback: 5,
    approvalStatus: "draft"
  },
  {
    id: 4,
    name: "Sustainable Packaging Design",
    category: "Packaging",
    designer: "Alex Thompson",
    status: "in-progress",
    priority: "high",
    createdAt: "2024-01-20",
    lastModified: "2024-02-04",
    version: "1.2",
    collaborators: ["Emma Davis", "Mike Johnson"],
    description: "Eco-friendly packaging design using recycled materials and minimal waste",
    rating: 4.9,
    likes: 234,
    views: 567,
    files: ["packaging-mockup.pdf", "material-specs.pdf", "sustainability-report.pdf"],
    tags: ["packaging", "sustainable", "eco-friendly", "recycled"],
    feedback: 15,
    approvalStatus: "in-review"
  }
]

const mockCategories = [
  { id: 1, name: "Collection", count: 8, color: "bg-blue-100 text-blue-800" },
  { id: 2, name: "Product", count: 24, color: "bg-green-100 text-green-800" },
  { id: 3, name: "Branding", count: 12, color: "bg-purple-100 text-purple-800" },
  { id: 4, name: "Packaging", count: 6, color: "bg-orange-100 text-orange-800" },
  { id: 5, name: "Marketing", count: 18, color: "bg-pink-100 text-pink-800" },
  { id: 6, name: "Digital", count: 15, color: "bg-gray-100 text-gray-800" }
]

const mockTeam = [
  { id: 1, name: "Sarah Chen", role: "Senior Designer", avatar: "/avatar1.jpg", availability: "available", projects: 8 },
  { id: 2, name: "Mike Johnson", role: "Product Designer", avatar: "/avatar2.jpg", availability: "busy", projects: 6 },
  { id: 3, name: "Emma Davis", role: "Brand Designer", avatar: "/avatar3.jpg", availability: "available", projects: 4 },
  { id: 4, name: "Alex Thompson", role: "Packaging Designer", avatar: "/avatar4.jpg", availability: "offline", projects: 3 }
]

export default function DesignPage() {
  const [selectedView, setSelectedView] = useState<'designs' | 'team' | 'inspiration' | 'analytics'>('designs')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'in-review': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDesigns = mockDesigns.filter(design => {
    if (selectedStatus !== 'all' && design.status !== selectedStatus) return false
    if (selectedCategory !== 'all' && design.category !== selectedCategory) return false
    if (searchQuery && !design.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Design Management</h1>
          <p className="text-gray-600">Complete design workflow and collaboration platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Design
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Design
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'designs', label: 'Designs', icon: Palette },
          { key: 'team', label: 'Team', icon: Users },
          { key: 'inspiration', label: 'Inspiration', icon: Heart },
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

      {/* Designs View */}
      {selectedView === 'designs' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search designs..."
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
                <option value="approved">Approved</option>
                <option value="in-review">In Review</option>
                <option value="in-progress">In Progress</option>
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

          {/* Designs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design) => (
              <Card key={design.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{design.name}</CardTitle>
                      <CardDescription>v{design.version} • {design.designer}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(design.status)}>
                        {design.status}
                      </Badge>
                      <Badge className={getPriorityColor(design.priority)}>
                        {design.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Design Preview */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Layers className="h-8 w-8 text-gray-400" />
                  </div>

                  <p className="text-sm text-gray-600">{design.description}</p>

                  {/* Tags */}
                  <div>
                    <span className="text-sm text-muted-foreground">Tags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {design.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className="font-medium">{design.likes}</span>
                      </div>
                      <div className="text-xs text-gray-500">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3 text-blue-500" />
                        <span className="font-medium">{design.views}</span>
                      </div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-3 w-3 text-green-500" />
                        <span className="font-medium">{design.feedback}</span>
                      </div>
                      <div className="text-xs text-gray-500">Feedback</div>
                    </div>
                  </div>

                  {/* Collaborators */}
                  <div>
                    <span className="text-sm text-muted-foreground">Collaborators</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {design.collaborators.map((collaborator, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {collaborator}
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

      {/* Team View */}
      {selectedView === 'team' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Design Team</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTeam.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getAvailabilityColor(member.availability)}>
                      {member.availability}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Active Projects</span>
                      <div className="font-medium">{member.projects}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">4.8</span>
                        <span className="text-yellow-500">★</span>
                      </div>
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

      {/* Inspiration View */}
      {selectedView === 'inspiration' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Inspiration Gallery</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Inspiration
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 1, title: "Color Trends 2024", category: "Color", likes: 234, image: "/inspiration1.jpg" },
              { id: 2, title: "Sustainable Materials", category: "Materials", likes: 189, image: "/inspiration2.jpg" },
              { id: 3, title: "Typography Guide", category: "Typography", likes: 156, image: "/inspiration3.jpg" },
              { id: 4, title: "Minimalist Design", category: "Style", likes: 298, image: "/inspiration4.jpg" },
              { id: 5, title: "Pattern Collection", category: "Patterns", likes: 167, image: "/inspiration5.jpg" },
              { id: 6, title: "Brand Identity", category: "Branding", likes: 223, image: "/inspiration6.jpg" }
            ].map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">{item.likes}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
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
          <h2 className="text-xl font-semibold">Design Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
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
                <div className="text-2xl font-bold">2.3 days</div>
                <p className="text-xs text-muted-foreground">
                  -0.5 days from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  8 active today
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Design Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'Approved', count: 456, color: 'bg-green-500' },
                    { status: 'In Review', count: 234, color: 'bg-yellow-500' },
                    { status: 'In Progress', count: 345, color: 'bg-blue-500' },
                    { status: 'Draft', count: 212, color: 'bg-gray-500' }
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
