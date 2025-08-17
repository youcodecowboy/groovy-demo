"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { QRDisplay } from "@/components/ui/qr-display"
import { 
  QrCode, 
  Eye, 
  Edit, 
  Save, 
  BarChart3, 
  Globe,
  Building,
  Clock,
  Star,
  Package,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  EyeOff
} from "lucide-react"
import Link from "next/link"

export default function FactoryProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  
  // Get the current factory (assuming single factory per org for now)
  const factories = useQuery(api.factoryProfiles.getAll)
  const factory = factories?.[0] // Get the first/only factory
  
  const generateQR = useMutation(api.factoryProfiles.generateQRCode)
  const updateProfile = useMutation(api.factoryProfiles.updateProfile)

  const [formData, setFormData] = useState<any>({})

  const handleGenerateQR = async () => {
    if (!factory) return
    try {
      await generateQR({ factoryId: factory._id })
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  const handleEdit = () => {
    if (!factory) return
    setIsEditing(true)
    setFormData({
      isEnabled: factory.publicProfile?.isEnabled || false,
      description: factory.publicProfile?.description || "",
      leadTime: factory.publicProfile?.leadTime || 30,
      responseTime: factory.publicProfile?.responseTime || 24,
      whatWeMake: factory.publicProfile?.whatWeMake || "",
      minimumOrderQuantity: factory.publicProfile?.minimumOrderQuantity || 100,
      paymentTerms: factory.publicProfile?.paymentTerms || "Net 30",
      shippingInfo: factory.publicProfile?.shippingInfo || "",
      contactInfo: {
        email: factory.publicProfile?.contactInfo?.email || "",
        phone: factory.publicProfile?.contactInfo?.phone || "",
        website: factory.publicProfile?.contactInfo?.website || "",
      },
      certifications: factory.publicProfile?.certifications || [],
      photoGallery: factory.publicProfile?.photoGallery || [],
    })
  }

  const handleSave = async () => {
    if (!factory) return
    try {
      await updateProfile({
        factoryId: factory._id,
        publicProfile: {
          ...formData,
          isEnabled: formData.isEnabled,
          qrCode: formData.qrCode,
          slug: formData.slug,
          description: formData.description,
          leadTime: formData.leadTime,
          responseTime: formData.responseTime,
          certifications: formData.certifications,
          photoGallery: formData.photoGallery,
          whatWeMake: formData.whatWeMake,
          minimumOrderQuantity: formData.minimumOrderQuantity,
          paymentTerms: formData.paymentTerms,
          shippingInfo: formData.shippingInfo,
          contactInfo: formData.contactInfo,
          socialLinks: formData.socialLinks || {},
          verifiedMetrics: formData.verifiedMetrics || {
            totalOrders: 0,
            averageRating: 0,
            onTimeDelivery: 0,
            customerSatisfaction: 0,
          },
        },
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  if (!factories) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!factory) {
    return (
      <div className="p-6">
        <Card className="border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Factory Found</h2>
            <p className="text-gray-600 mb-4">You need to create a factory first to set up your public profile.</p>
            <Link href="/app/customers/create-factory">
              <Button className="bg-black text-white hover:bg-gray-800">
                Create Factory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profile = factory.publicProfile

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factory Profile</h1>
          <p className="text-gray-600 italic">Your public profile for buyers and trade shows</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/customers">
            <Button variant="outline">
              Back to Customers
            </Button>
          </Link>
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Profile Status</p>
                <Badge className={profile?.isEnabled ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                  {profile?.isEnabled ? "Active" : "Inactive"}
                </Badge>
              </div>
              {profile?.isEnabled ? <Globe className="h-8 w-8 text-green-400" /> : <EyeOff className="h-8 w-8 text-gray-400" />}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Lead Time</p>
                <p className="text-2xl font-bold">{profile?.leadTime || "N/A"} days</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Response Time</p>
                <p className="text-2xl font-bold">{profile?.responseTime || "N/A"} hours</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="h-6 w-6 text-yellow-500 fill-current" />
                  <p className="text-2xl font-bold">{profile?.verifiedMetrics?.averageRating || "N/A"}/5</p>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="qr-code">QR Code</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {isEditing ? (
            <div className="space-y-6">
              {/* Edit Form */}
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isEnabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
                    />
                    <Label>Enable Public Profile</Label>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>About Your Factory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your factory and capabilities..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What You Make</Label>
                    <Textarea
                      value={formData.whatWeMake}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatWeMake: e.target.value }))}
                      placeholder="Describe your products and services..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Business Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lead Time (days)</Label>
                      <Input
                        type="number"
                        value={formData.leadTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, leadTime: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Response Time (hours)</Label>
                      <Input
                        type="number"
                        value={formData.responseTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, responseTime: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Order Quantity</Label>
                      <Input
                        type="number"
                        value={formData.minimumOrderQuantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, minimumOrderQuantity: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Terms</Label>
                      <Input
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                        placeholder="e.g., Net 30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Shipping Information</Label>
                    <Textarea
                      value={formData.shippingInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingInfo: e.target.value }))}
                      placeholder="Describe your shipping terms and options..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.contactInfo?.email}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))}
                        placeholder="sales@yourfactory.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.contactInfo?.phone}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contactInfo: { ...prev.contactInfo, phone: e.target.value }
                        }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={formData.contactInfo?.website}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contactInfo: { ...prev.contactInfo, website: e.target.value }
                        }))}
                        placeholder="https://yourfactory.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* View Mode */}
              <Card className="border-2 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{factory.name}</h3>
                        <Badge className={profile?.isEnabled ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                          {profile?.isEnabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{factory.location}</p>
                      {profile?.description && (
                        <p className="text-gray-700">{profile.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  {profile && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 italic">Lead Time</p>
                        <p className="font-semibold">{profile.leadTime || "N/A"} days</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 italic">Response Time</p>
                        <p className="font-semibold">{profile.responseTime || "N/A"} hours</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 italic">Min Order</p>
                        <p className="font-semibold">{profile.minimumOrderQuantity || "N/A"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 italic">Rating</p>
                        <p className="font-semibold">{profile.verifiedMetrics?.averageRating || "N/A"}/5</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {profile?.whatWeMake && (
                <Card className="border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      What We Make
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{profile.whatWeMake}</p>
                  </CardContent>
                </Card>
              )}

              {profile?.certifications && profile.certifications.length > 0 && (
                <Card className="border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {profile.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-gray-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="qr-code" className="space-y-4">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Your QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.qrCode ? (
                <div className="flex flex-col items-center space-y-4">
                  <QRDisplay
                    qrData={profile.qrCode}
                    title={factory.name}
                    description="Scan to view your public profile"
                  />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Public Profile URL:</p>
                    <a 
                      href={profile.qrCode} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {profile.qrCode}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                  <p className="text-gray-600">No QR code generated yet</p>
                  <Button onClick={handleGenerateQR} className="bg-black text-white hover:bg-gray-800">
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Profile Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
