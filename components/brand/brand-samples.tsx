'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  FileText,
  MessageSquare,
  Eye,
  Download,
  Upload,
  Edit,
  Save,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Palette,
  Scissors,
  Tag,
  ArrowRight,
  Star,
  AlertTriangle,
  TrendingUp,
  FileImage,
  Send,
  History,
  Layers,
  Target,
  Factory
} from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandSample } from '@/lib/brand-mock-data'
import { format } from 'date-fns'
import Link from 'next/link'

// Enhanced mock sample data
interface SampleVersion {
  id: string
  version: number
  sentDate: Date
  receivedDate?: Date
  status: 'sent' | 'received' | 'approved' | 'rejected' | 'pending'
  comments: string[]
  attachments: string[]
  cost?: number
  materialUpdates: string[]
  patternUpdates: string[]
  feedback: string
  approvedBy?: string
  approvedDate?: Date
}

interface EnhancedSample {
  id: string
  name: string
  description: string
  factory: string
  factoryId: string
  contactPerson: string
  contactEmail: string
  contactPhone?: string
  status: 'requested' | 'in_progress' | 'approved' | 'rejected' | 'shipped'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: Date
  createdAt: Date
  totalCost: number
  currency: 'USD' | 'EUR'
  
  // Material details
  materials: {
    fabric: string
    composition: string
    supplier: string
    pattern: string
    patternFileUpdated: boolean
    colors: string[]
    sizes: string[]
  }
  
  // Version history
  versions: SampleVersion[]
  currentVersion: number
  
  // Production details
  minOrderQuantity: number
  leadTime: string
  productionCost: number
  
  // Quality metrics
  qualityScore?: number
  defects?: number
  reworks?: number
  
  // Files and attachments
  attachments: string[]
  comments: number
  messages: number
}

const mockSamples: EnhancedSample[] = [
  {
    id: 'sample-001',
    name: 'Premium Cotton T-Shirt',
    description: 'High-quality organic cotton t-shirt with custom fit',
    factory: 'Textile Excellence Ltd.',
    factoryId: 'factory-a',
    contactPerson: 'Ahmed Khan',
    contactEmail: 'ahmed@textileexcellence.com',
    contactPhone: '+880-2-955-0123',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date('2024-12-20'),
    createdAt: new Date('2024-11-15'),
    totalCost: 450,
    currency: 'USD',
    
    materials: {
      fabric: 'Organic Cotton Jersey',
      composition: '100% Organic Cotton, 180 GSM',
      supplier: 'EcoFabrics Supply',
      pattern: 'Custom Fit T-Shirt',
      patternFileUpdated: true,
      colors: ['Navy Blue', 'Forest Green', 'Charcoal'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    
    versions: [
      {
        id: 'v1',
        version: 1,
        sentDate: new Date('2024-11-20'),
        receivedDate: new Date('2024-11-25'),
        status: 'rejected',
        comments: ['Color too dark', 'Fit too loose', 'Needs adjustment to collar'],
        attachments: ['sample-v1-front.jpg', 'sample-v1-back.jpg', 'measurements-v1.pdf'],
        cost: 150,
        materialUpdates: ['Switched to lighter dye', 'Adjusted fabric weight'],
        patternUpdates: ['Tightened fit', 'Redesigned collar'],
        feedback: 'Overall quality good but needs color and fit adjustments'
      },
      {
        id: 'v2',
        version: 2,
        sentDate: new Date('2024-12-01'),
        receivedDate: new Date('2024-12-08'),
        status: 'received',
        comments: ['Much better color', 'Fit improved', 'Collar looks good'],
        attachments: ['sample-v2-front.jpg', 'sample-v2-back.jpg', 'color-swatch-v2.jpg'],
        cost: 150,
        materialUpdates: ['Lighter dye applied', 'Maintained fabric quality'],
        patternUpdates: ['Adjusted fit based on feedback', 'Refined collar design'],
        feedback: 'Significant improvement. Ready for final approval.'
      }
    ],
    currentVersion: 2,
    
    minOrderQuantity: 500,
    leadTime: '4-6 weeks',
    productionCost: 8.50,
    
    qualityScore: 8.5,
    defects: 0,
    reworks: 1,
    
    attachments: ['design-specs.pdf', 'color-palette.pdf', 'measurement-chart.pdf'],
    comments: 12,
    messages: 8
  },
  {
    id: 'sample-002',
    name: 'Performance Athletic Shorts',
    description: 'Moisture-wicking athletic shorts for active wear',
    factory: 'Vietnam Garment Co.',
    factoryId: 'factory-b',
    contactPerson: 'Nguyen Thi Mai',
    contactEmail: 'mai@vietnamgarment.com',
    contactPhone: '+84-28-382-0124',
    status: 'approved',
    priority: 'medium',
    dueDate: new Date('2024-12-15'),
    createdAt: new Date('2024-11-10'),
    totalCost: 320,
    currency: 'USD',
    
    materials: {
      fabric: 'Moisture-Wicking Polyester',
      composition: '85% Polyester, 15% Spandex, 160 GSM',
      supplier: 'Performance Fabrics Inc.',
      pattern: 'Athletic Shorts Pattern',
      patternFileUpdated: false,
      colors: ['Black', 'Navy', 'Gray'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    
    versions: [
      {
        id: 'v1',
        version: 1,
        sentDate: new Date('2024-11-15'),
        receivedDate: new Date('2024-11-22'),
        status: 'approved',
        comments: ['Perfect fit', 'Great moisture wicking', 'Ready for production'],
        attachments: ['sample-v1-front.jpg', 'sample-v1-back.jpg', 'performance-test.pdf'],
        cost: 160,
        materialUpdates: [],
        patternUpdates: [],
        feedback: 'Excellent quality and performance. Approved for production.',
        approvedBy: 'Sarah Johnson',
        approvedDate: new Date('2024-11-23')
      }
    ],
    currentVersion: 1,
    
    minOrderQuantity: 300,
    leadTime: '3-4 weeks',
    productionCost: 12.75,
    
    qualityScore: 9.2,
    defects: 0,
    reworks: 0,
    
    attachments: ['performance-specs.pdf', 'fabric-testing.pdf'],
    comments: 6,
    messages: 4
  },
  {
    id: 'sample-003',
    name: 'Luxury Silk Blouse',
    description: 'Premium silk blouse with intricate detailing',
    factory: 'Luxury Textiles International',
    factoryId: 'factory-c',
    contactPerson: 'Mehmet Yilmaz',
    contactEmail: 'mehmet@luxurytextiles.com',
    contactPhone: '+90-212-555-0126',
    status: 'requested',
    priority: 'urgent',
    dueDate: new Date('2024-12-25'),
    createdAt: new Date('2024-12-01'),
    totalCost: 850,
    currency: 'USD',
    
    materials: {
      fabric: 'Mulberry Silk Charmeuse',
      composition: '100% Mulberry Silk, 22 Momme',
      supplier: 'Silk Excellence Ltd.',
      pattern: 'Luxury Blouse Pattern',
      patternFileUpdated: true,
      colors: ['Ivory', 'Blush Pink', 'Navy'],
      sizes: ['XS', 'S', 'M', 'L']
    },
    
    versions: [],
    currentVersion: 0,
    
    minOrderQuantity: 100,
    leadTime: '8-10 weeks',
    productionCost: 45.00,
    
    attachments: ['luxury-specs.pdf', 'silk-samples.pdf', 'embroidery-design.pdf'],
    comments: 3,
    messages: 2
  }
]

const statusColors = {
  requested: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  shipped: 'bg-gray-100 text-gray-800'
}

const statusIcons = {
  requested: Clock,
  in_progress: Package,
  approved: CheckCircle,
  rejected: XCircle,
  shipped: Truck
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

export function BrandSamples() {
  const [samples, setSamples] = useState<EnhancedSample[]>(mockSamples)
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedSample, setSelectedSample] = useState<EnhancedSample | null>(null)

  const filteredSamples = selectedStatus === 'all' 
    ? samples 
    : samples.filter(sample => sample.status === selectedStatus)

  const groupedSamples = {
    requested: samples.filter(s => s.status === 'requested'),
    in_progress: samples.filter(s => s.status === 'in_progress'),
    approved: samples.filter(s => s.status === 'approved'),
    rejected: samples.filter(s => s.status === 'rejected'),
    shipped: samples.filter(s => s.status === 'shipped')
  }

  const getVersionStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'received': return 'bg-purple-100 text-purple-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDueStatus = (dueDate: Date) => {
    const daysUntilDue = getDaysUntilDue(dueDate)
    if (daysUntilDue < 0) return { status: 'overdue', color: 'text-red-600', text: 'Overdue' }
    if (daysUntilDue <= 3) return { status: 'urgent', color: 'text-orange-600', text: 'Due soon' }
    if (daysUntilDue <= 7) return { status: 'warning', color: 'text-yellow-600', text: 'Due this week' }
    return { status: 'on-track', color: 'text-green-600', text: 'On track' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sample Hub</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sample Hub</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Sample Request
        </Button>
      </div>

      {/* Sample Cards */}
      <div className="space-y-6">
        {filteredSamples.map((sample) => {
          const StatusIcon = statusIcons[sample.status]
          const dueStatus = getDueStatus(sample.dueDate)
          const latestVersion = sample.versions[sample.versions.length - 1]
          
          return (
            <Card key={sample.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{sample.name}</h3>
                      <Badge className={statusColors[sample.status]}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {sample.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={priorityColors[sample.priority]}>
                        {sample.priority} priority
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{sample.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Factory className="h-4 w-4" />
                        <span>{sample.factory}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{sample.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className={dueStatus.color}>
                          Due {format(sample.dueDate, 'MMM d, yyyy')} ({dueStatus.text})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${sample.totalCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{sample.currency}</div>
                  </div>
                </div>

                {/* Material Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Fabric</span>
                    </div>
                    <p className="text-sm text-gray-900">{sample.materials.fabric}</p>
                    <p className="text-xs text-gray-600">{sample.materials.composition}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Supplier</span>
                    </div>
                    <p className="text-sm text-gray-900">{sample.materials.supplier}</p>
                    <p className="text-xs text-gray-600">{sample.materials.pattern}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Colors</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sample.materials.colors.slice(0, 3).map((color) => (
                        <Badge key={color} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                      {sample.materials.colors.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{sample.materials.colors.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Production</span>
                    </div>
                    <p className="text-sm text-gray-900">MOQ: {sample.minOrderQuantity}</p>
                    <p className="text-xs text-gray-600">Lead time: {sample.leadTime}</p>
                  </div>
                </div>

                {/* Version History */}
                {sample.versions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Version History
                    </h4>
                    <div className="space-y-3">
                      {sample.versions.map((version) => (
                        <div key={version.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Version {version.version}</span>
                              <Badge className={getVersionStatusColor(version.status)}>
                                {version.status}
                              </Badge>
                              {version.cost && (
                                <span className="text-sm text-gray-600">
                                  ${version.cost}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(version.sentDate, 'MMM d, yyyy')}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Feedback</p>
                              <p className="text-gray-600">{version.feedback}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Updates</p>
                              <div className="space-y-1">
                                {version.materialUpdates.length > 0 && (
                                  <div>
                                    <span className="text-xs text-gray-500">Materials:</span>
                                    <p className="text-xs text-gray-600">{version.materialUpdates.join(', ')}</p>
                                  </div>
                                )}
                                {version.patternUpdates.length > 0 && (
                                  <div>
                                    <span className="text-xs text-gray-500">Pattern:</span>
                                    <p className="text-xs text-gray-600">{version.patternUpdates.join(', ')}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {version.attachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center gap-2">
                                <FileImage className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {version.attachments.length} attachments
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Metrics */}
                {sample.qualityScore && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{sample.qualityScore}/10</div>
                      <p className="text-sm text-gray-600">Quality Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{sample.defects || 0}</div>
                      <p className="text-sm text-gray-600">Defects</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{sample.reworks || 0}</div>
                      <p className="text-sm text-gray-600">Reworks</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Factory
                    </Button>
                    {sample.status === 'approved' && (
                      <Button size="sm">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Convert to PO
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredSamples.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No samples found</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus !== 'all' 
                ? "Try adjusting your filters"
                : "Get started by creating your first sample request"
              }
            </p>
            {selectedStatus === 'all' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Sample
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
