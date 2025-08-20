"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Archive, 
  Search, 
  Filter,
  Eye,
  Download,
  Upload,
  Plus,
  Calendar,
  FileText,
  Image as ImageIcon,
  Tag,
  Users,
  BarChart3,
  Clock,
  Star,
  History,
  Layers,
  Package,
  Settings,
  Trash2,
  RefreshCw,
  Share2,
  DollarSign
} from "lucide-react"

// Mock data for product archive
const mockArchivedProducts = [
  {
    id: 1,
    name: "Classic Denim Jacket 2023",
    sku: "DJ-2023-001",
    category: "Outerwear",
    status: "discontinued",
    archivedDate: "2024-01-15",
    originalLaunch: "2023-03-01",
    totalProduced: 2500,
    totalSold: 2340,
    revenue: "$117,000",
    designer: "Sarah Chen",
    materials: ["Denim", "Cotton", "Brass Hardware"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "Black", "White"],
    rating: 4.6,
    reviews: 156,
    images: ["/product1.jpg", "/product1-2.jpg", "/product1-3.jpg"],
    documents: ["tech-specs.pdf", "pattern-files.zip", "quality-reports.pdf"],
    notes: "Discontinued due to material cost increases"
  },
  {
    id: 2,
    name: "Premium Cotton T-Shirt Collection",
    sku: "TS-2023-002",
    category: "Tops",
    status: "seasonal",
    archivedDate: "2024-01-20",
    originalLaunch: "2023-05-15",
    totalProduced: 5000,
    totalSold: 4875,
    revenue: "$97,500",
    designer: "Mike Johnson",
    materials: ["Organic Cotton", "Recycled Polyester"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Black", "Gray", "Navy", "Red"],
    rating: 4.8,
    reviews: 234,
    images: ["/product2.jpg", "/product2-2.jpg"],
    documents: ["material-specs.pdf", "production-guide.pdf"],
    notes: "Seasonal collection - may return next spring"
  },
  {
    id: 3,
    name: "Wool Blend Sweater",
    sku: "SW-2023-003",
    category: "Knitwear",
    status: "limited-edition",
    archivedDate: "2024-01-10",
    originalLaunch: "2023-09-01",
    totalProduced: 800,
    totalSold: 800,
    revenue: "$64,000",
    designer: "Emma Davis",
    materials: ["Wool", "Cashmere", "Silk"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Charcoal", "Burgundy"],
    rating: 4.9,
    reviews: 89,
    images: ["/product3.jpg", "/product3-2.jpg", "/product3-3.jpg"],
    documents: ["knitting-pattern.pdf", "care-instructions.pdf"],
    notes: "Limited edition - sold out completely"
  },
  {
    id: 4,
    name: "Leather Crossbody Bag",
    sku: "LB-2023-004",
    category: "Accessories",
    status: "discontinued",
    archivedDate: "2024-01-25",
    originalLaunch: "2023-07-01",
    totalProduced: 1200,
    totalSold: 980,
    revenue: "$78,400",
    designer: "Alex Thompson",
    materials: ["Genuine Leather", "Brass Hardware", "Cotton Lining"],
    sizes: ["One Size"],
    colors: ["Brown", "Black", "Tan"],
    rating: 4.4,
    reviews: 67,
    images: ["/product4.jpg", "/product4-2.jpg"],
    documents: ["leather-specs.pdf", "construction-guide.pdf"],
    notes: "Discontinued due to leather sourcing issues"
  }
]

const mockArchiveStats = [
  { category: "Outerwear", count: 45, revenue: "$2.3M", avgRating: 4.5 },
  { category: "Tops", count: 78, revenue: "$1.8M", avgRating: 4.6 },
  { category: "Bottoms", count: 34, revenue: "$1.2M", avgRating: 4.4 },
  { category: "Knitwear", count: 23, revenue: "$890K", avgRating: 4.7 },
  { category: "Accessories", count: 56, revenue: "$1.5M", avgRating: 4.3 }
]

const mockArchiveCategories = [
  { id: 1, name: "Discontinued", count: 45, color: "bg-red-100 text-red-800" },
  { id: 2, name: "Seasonal", count: 67, color: "bg-blue-100 text-blue-800" },
  { id: 3, name: "Limited Edition", count: 23, color: "bg-purple-100 text-purple-800" },
  { id: 4, name: "Out of Stock", count: 34, color: "bg-yellow-100 text-yellow-800" },
  { id: 5, name: "Prototype", count: 12, color: "bg-gray-100 text-gray-800" }
]

export default function ProductArchivePage() {
  const [selectedView, setSelectedView] = useState<'products' | 'categories' | 'analytics' | 'search'>('products')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'discontinued': return 'bg-red-100 text-red-800'
      case 'seasonal': return 'bg-blue-100 text-blue-800'
      case 'limited-edition': return 'bg-purple-100 text-purple-800'
      case 'out-of-stock': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Outerwear': return 'bg-blue-100 text-blue-800'
      case 'Tops': return 'bg-green-100 text-green-800'
      case 'Bottoms': return 'bg-purple-100 text-purple-800'
      case 'Knitwear': return 'bg-orange-100 text-orange-800'
      case 'Accessories': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProducts = mockArchivedProducts.filter(product => {
    if (selectedStatus !== 'all' && product.status !== selectedStatus) return false
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Archive</h1>
          <p className="text-gray-600">Comprehensive product history and archive system</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Archive
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Archive Product
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'products', label: 'Products', icon: Archive },
          { key: 'categories', label: 'Categories', icon: Tag },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 },
          { key: 'search', label: 'Search', icon: Search }
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

      {/* Products View */}
      {selectedView === 'products' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search archived products..."
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
                <option value="discontinued">Discontinued</option>
                <option value="seasonal">Seasonal</option>
                <option value="limited-edition">Limited Edition</option>
                <option value="out-of-stock">Out of Stock</option>
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
                <option value="Outerwear">Outerwear</option>
                <option value="Tops">Tops</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Knitwear">Knitwear</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.sku} • {product.designer}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                      <Badge className={getCategoryColor(product.category)}>
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Image */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>

                  {/* Sales Data */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{product.totalSold}</div>
                      <div className="text-xs text-gray-500">Sold</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{product.revenue}</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{product.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">{product.reviews} reviews</div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Materials</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.materials.slice(0, 2).map((material, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                        {product.materials.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.materials.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Colors</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.colors.map((color, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Archive Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Launch Date</span>
                      <div className="font-medium">{product.originalLaunch}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Archived Date</span>
                      <div className="font-medium">{product.archivedDate}</div>
                    </div>
                  </div>

                  {/* Notes */}
                  {product.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Notes</span>
                      <div className="font-medium mt-1">{product.notes}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Export
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
            <h2 className="text-xl font-semibold">Archive Categories</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockArchiveCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge className={category.color}>
                      {category.count} products
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Products</span>
                      <span className="font-medium">{category.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Avg Rating</span>
                      <span className="font-medium">4.5</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Revenue</span>
                      <span className="font-medium">$450K</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Browse
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Export
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
          <h2 className="text-xl font-semibold">Archive Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Archived</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +45 this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8.9M</div>
                <p className="text-xs text-muted-foreground">
                  From archived products
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.6</div>
                <p className="text-xs text-muted-foreground">
                  Across all archived
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4GB</div>
                <p className="text-xs text-muted-foreground">
                  Documents & images
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockArchiveStats.map((stat) => (
                    <div key={stat.category} className="flex items-center justify-between">
                      <span className="text-sm">{stat.category}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{stat.count} products</div>
                          <div className="text-xs text-gray-500">{stat.revenue}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{stat.avgRating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Archive Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockArchiveCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <span className="text-sm">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(category.count / 180) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{category.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Search View */}
      {selectedView === 'search' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Advanced Search</h2>
            <Button>
              <History className="h-4 w-4 mr-2" />
              Search History
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
              <CardDescription>Find specific products in the archive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <input type="text" placeholder="Search by name..." className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <input type="text" placeholder="Search by SKU..." className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Designer</label>
                  <input type="text" placeholder="Search by designer..." className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Launch Date Range</label>
                  <div className="flex gap-2 mt-1">
                    <input type="date" className="flex-1 border rounded-md px-3 py-2 text-sm" />
                    <input type="date" className="flex-1 border rounded-md px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Revenue Range</label>
                  <div className="flex gap-2 mt-1">
                    <input type="number" placeholder="Min" className="flex-1 border rounded-md px-3 py-2 text-sm" />
                    <input type="number" placeholder="Max" className="flex-1 border rounded-md px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm">
                    <option>Any Rating</option>
                    <option>4.5+ Stars</option>
                    <option>4.0+ Stars</option>
                    <option>3.5+ Stars</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Search Archive
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
