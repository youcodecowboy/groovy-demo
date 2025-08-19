"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
    Plus,
    Bell,
    Globe,
    Shield,
    Database,
    Smartphone,
    Truck,
    CreditCard,
    BarChart,
    Calendar,
    Mail,
    CheckCircle,
    Clock,
    Settings,
    Zap,
    AlertTriangle,
    Info,
    Package,
    Users,
    Palette,
    Scissors,
    Warehouse,
    WashingMachine,
    Archive,
    X,
    Trash2
} from "lucide-react"

// Available features that can be added to the application
const availableFeatures = [
  {
    id: "material-tracking",
    name: "Material Tracking",
    description: "Comprehensive material inventory and tracking system",
    icon: Package,
    category: "Inventory",
    status: "available",
    priority: "high",
    estimatedTime: "1-2 weeks",
    benefits: ["Real-time inventory", "Material consumption tracking", "Reorder alerts"],
    longDescription: "Track materials from procurement to consumption with real-time inventory levels, material consumption analytics, and automated reorder alerts. Monitor material costs, usage patterns, and optimize your material management workflow."
  },
  {
    id: "capacity-planning",
    name: "Capacity Planning",
    description: "Resource scheduling and production capacity optimization",
    icon: Calendar,
    category: "Operations",
    status: "available",
    priority: "high",
    estimatedTime: "2-3 weeks",
    benefits: ["Resource scheduling", "Capacity optimization", "Production planning"],
    longDescription: "Optimize your production capacity with advanced scheduling tools, resource allocation, and production planning. Monitor machine utilization, worker productivity, and forecast production capacity to maximize efficiency."
  },
  {
    id: "sample-studio",
    name: "Sample Studio",
    description: "Digital sample management and approval workflow",
    icon: Palette,
    category: "Design",
    status: "available",
    priority: "medium",
    estimatedTime: "2-3 weeks",
    benefits: ["Sample tracking", "Digital approvals", "Version control"],
    longDescription: "Manage your sample development process digitally with sample tracking, digital approvals, and version control. Streamline the sample-to-production workflow with collaborative tools and approval workflows."
  },
  {
    id: "pattern-making",
    name: "Pattern Making",
    description: "Digital pattern creation and management system",
    icon: Scissors,
    category: "Design",
    status: "available",
    priority: "medium",
    estimatedTime: "3-4 weeks",
    benefits: ["Digital patterns", "Pattern library", "Size grading"],
    longDescription: "Create and manage digital patterns with advanced CAD tools, pattern library management, and automated size grading. Streamline the pattern development process from concept to production-ready patterns."
  },
  {
    id: "logistics-tracking",
    name: "Logistics Tracking",
    description: "End-to-end logistics and shipping management",
    icon: Truck,
    category: "Logistics",
    status: "available",
    priority: "high",
    estimatedTime: "2-3 weeks",
    benefits: ["Shipment tracking", "Route optimization", "Delivery management"],
    longDescription: "Track shipments from factory to customer with real-time logistics monitoring, route optimization, and delivery management. Integrate with shipping providers for seamless logistics operations."
  },
  {
    id: "design",
    name: "Design Management",
    description: "Complete design workflow and collaboration platform",
    icon: Palette,
    category: "Design",
    status: "available",
    priority: "medium",
    estimatedTime: "3-4 weeks",
    benefits: ["Design collaboration", "Version control", "Design approval"],
    longDescription: "Manage your entire design workflow from concept to production with collaborative design tools, version control, and design approval processes. Streamline communication between designers and production teams."
  },
  {
    id: "storage-tracking",
    name: "Storage Tracking",
    description: "Warehouse and storage facility management",
    icon: Warehouse,
    category: "Inventory",
    status: "available",
    priority: "medium",
    estimatedTime: "2-3 weeks",
    benefits: ["Warehouse management", "Storage optimization", "Location tracking"],
    longDescription: "Optimize your warehouse operations with storage tracking, location management, and storage optimization. Monitor storage capacity, track item locations, and improve warehouse efficiency."
  },
  {
    id: "subcontracting",
    name: "Subcontracting Management",
    description: "Manage subcontractor relationships and workflows",
    icon: Users,
    category: "Operations",
    status: "available",
    priority: "medium",
    estimatedTime: "2-3 weeks",
    benefits: ["Subcontractor tracking", "Quality control", "Payment management"],
    longDescription: "Manage subcontractor relationships, track work progress, and ensure quality control across your subcontracting network. Streamline communication and payment processes with subcontractors."
  },
  {
    id: "wash-management",
    name: "Wash Management",
    description: "Specialized wash and finishing process tracking",
    icon: WashingMachine,
    category: "Production",
    status: "available",
    priority: "low",
    estimatedTime: "1-2 weeks",
    benefits: ["Wash tracking", "Process optimization", "Quality control"],
    longDescription: "Track wash and finishing processes with specialized tools for garment care, process optimization, and quality control. Monitor wash cycles, chemical usage, and finishing quality."
  },
  {
    id: "product-archive",
    name: "Product Archive",
    description: "Comprehensive product history and archive system",
    icon: Archive,
    category: "Data",
    status: "available",
    priority: "low",
    estimatedTime: "1-2 weeks",
    benefits: ["Product history", "Archive management", "Data preservation"],
    longDescription: "Maintain a comprehensive archive of all products with complete history, specifications, and production data. Preserve product knowledge and enable historical analysis and reference."
  }
]

interface FeatureManagerProps {
  onFeatureToggle?: (featureId: string, enabled: boolean) => void
  enabledFeatures?: string[]
  onFeaturesChange?: (features: string[]) => void
  size?: 'default' | 'small'
  hideButton?: boolean
}

export function FeatureManager({ 
  onFeatureToggle, 
  enabledFeatures = [], 
  onFeaturesChange,
  size = 'default',
  hideButton = false
}: FeatureManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [localEnabledFeatures, setLocalEnabledFeatures] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({})

  // Load enabled features from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('groovy-enabled-features')
    if (saved) {
      try {
        const savedFeatures = JSON.parse(saved)
        setLocalEnabledFeatures(savedFeatures)
      } catch (e) {
        console.error('Failed to parse saved features:', e)
      }
    }

    // Listen for custom event to open dialog
    const handleOpenFeatureManager = () => {
      setIsOpen(true)
    }

    window.addEventListener('open-feature-manager', handleOpenFeatureManager)

    return () => {
      window.removeEventListener('open-feature-manager', handleOpenFeatureManager)
    }
  }, [])

  // Save enabled features to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('groovy-enabled-features', JSON.stringify(localEnabledFeatures))
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('groovy-features-changed'))
  }, [localEnabledFeatures])

  const handleFeatureToggle = async (featureId: string) => {
    setIsLoading(prev => ({ ...prev, [featureId]: true }))
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const isCurrentlyEnabled = localEnabledFeatures.includes(featureId)
    const newEnabledFeatures = isCurrentlyEnabled 
      ? localEnabledFeatures.filter(id => id !== featureId)
      : [...localEnabledFeatures, featureId]
    
    setLocalEnabledFeatures(newEnabledFeatures)
    setIsLoading(prev => ({ ...prev, [featureId]: false }))
    
    // Call parent callback if provided
    if (onFeatureToggle) {
      onFeatureToggle(featureId, !isCurrentlyEnabled)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200"
      case "medium": return "text-orange-600 bg-orange-50 border-orange-200"
      case "low": return "text-green-600 bg-green-50 border-green-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (featureId: string) => {
    if (isLoading[featureId]) {
      return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    }
    if (localEnabledFeatures.includes(featureId)) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <Plus className="h-4 w-4 text-blue-600" />
  }

  const selectedFeatureData = selectedFeature 
    ? availableFeatures.find(f => f.id === selectedFeature) 
    : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!hideButton && (
        <DialogTrigger asChild>
                  <Button 
          variant="ghost" 
          className={`w-full justify-between rounded-md hover:bg-gray-50 ${
            size === 'small' ? 'h-10 px-4' : 'h-12 px-4'
          }`}
        >
          <div className="flex items-center gap-3">
            <Plus className={`${size === 'small' ? 'h-5 w-5' : 'h-5 w-5'} text-blue-600`} />
            <span className={`font-semibold text-gray-800 ${size === 'small' ? 'text-sm' : 'text-base'}`}>Add Features</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
            {availableFeatures.length}
          </Badge>
        </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-6xl h-[85vh] p-0 flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Sidebar with feature list */}
          <div className="w-80 border-r bg-gray-50 flex flex-col min-h-0">
            <div className="p-4 border-b bg-white flex-shrink-0">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Available Features
                </DialogTitle>
                <DialogDescription>
                  Add new functionality to your application
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0">
              {Object.entries(
                availableFeatures.reduce((acc, feature) => {
                  if (!acc[feature.category]) acc[feature.category] = []
                  acc[feature.category].push(feature)
                  return acc
                }, {} as Record<string, typeof availableFeatures>)
              ).map(([category, features]) => (
                <div key={category}>
                  <div className="px-4 py-2 bg-gray-100 border-b flex-shrink-0">
                    <h3 className="text-sm font-medium text-gray-700">{category}</h3>
                  </div>
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-100 transition-colors ${
                        selectedFeature === feature.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedFeature(feature.id)}
                    >
                      <div className="flex items-center gap-3">
                        <feature.icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">{feature.name}</span>
                            {getStatusIcon(feature.id)}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t bg-white flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Enabled: {localEnabledFeatures.length}</span>
                <span>Available: {availableFeatures.length}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Features are automatically saved</span>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedFeatureData ? (
              <>
                <div className="p-6 border-b bg-white flex-shrink-0">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <selectedFeatureData.icon className="h-12 w-12 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold mb-2">{selectedFeatureData.name}</h2>
                        <p className="text-muted-foreground mb-4">{selectedFeatureData.description}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={getPriorityColor(selectedFeatureData.priority)}
                          >
                            {selectedFeatureData.priority} priority
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {selectedFeatureData.estimatedTime}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleFeatureToggle(selectedFeatureData.id)}
                      disabled={isLoading[selectedFeatureData.id]}
                      className="flex items-center gap-2 flex-shrink-0 ml-4"
                    >
                      {isLoading[selectedFeatureData.id] ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : localEnabledFeatures.includes(selectedFeatureData.id) ? (
                        <>
                          <X className="h-4 w-4" />
                          Disable Feature
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Enable Feature
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                  <div className="space-y-6 max-w-none">
                    {/* Long Description */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">About This Feature</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedFeatureData.longDescription}
                      </p>
                    </div>

                    <Separator />

                    {/* Key Benefits */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Benefits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedFeatureData.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm font-medium">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Implementation Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Implementation Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Implementation Time</span>
                          <span className="text-muted-foreground">{selectedFeatureData.estimatedTime}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Priority Level</span>
                          <Badge variant="outline" className={getPriorityColor(selectedFeatureData.priority)}>
                            {selectedFeatureData.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Category</span>
                          <span className="text-muted-foreground">{selectedFeatureData.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Feature</h3>
                  <p className="text-muted-foreground">
                    Choose a feature from the sidebar to view details and enable it
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
