"use client"

import { useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Building, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Star, 
  Package, 
  Truck, 
  Users, 
  Award, 
  CheckCircle, 
  Share2, 
  MessageCircle,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Factory,
  Zap,
  Target,
  Shield,
  Calendar,
  DollarSign,
  User,
  Cpu,
  Settings,
  BarChart3
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function PublicFactoryProfilePage() {
  const params = useParams()
  const slug = params.slug as string

  const factory = useQuery(api.factoryProfiles.getBySlug, { slug })
  const recordView = useMutation(api.factoryProfiles.recordView)
  const addToBrandCRM = useMutation(api.factoryProfiles.addToBrandCRM)

  // Record view on page load
  useEffect(() => {
    if (factory) {
      recordView({
        factoryId: factory._id,
        visitorType: "direct_visit",
        visitorInfo: {
          ipAddress: "unknown",
          userAgent: navigator.userAgent,
          location: "unknown",
          referrer: document.referrer,
        },
        actionTaken: "viewed_profile",
      })
    }
  }, [factory, recordView])

  const handleConnect = async () => {
    if (!factory) return
    try {
      await addToBrandCRM({
        factoryId: factory._id,
        brandId: "brand-123" as any, // Mock brand ID for demo
        notes: "Added from trade show QR scan",
      })
      await recordView({
        factoryId: factory._id,
        visitorType: "direct_visit",
        visitorInfo: {
          ipAddress: "unknown",
          userAgent: navigator.userAgent,
          location: "unknown",
          referrer: document.referrer,
        },
        actionTaken: "contacted",
      })
      alert("Factory added to your CRM! We'll connect you soon.")
    } catch (error) {
      console.error("Error adding to CRM:", error)
      alert("Failed to connect. Please try again.")
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${factory?.name} - Factory Profile`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Profile URL copied to clipboard!")
    }
  }

  if (!factory) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading factory profile...</p>
        </div>
      </div>
    )
  }

  const profile = factory.publicProfile

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      {/* Header Bar - Matching Homepage */}
      <div className="sticky top-0 z-40 w-full bg-white border-b-2 border-black">
        <div className="container mx-auto grid grid-cols-[auto,1fr,auto] items-center px-2 md:px-4 h-16 md:h-20">
          {/* Left - Logo */}
          <div className="flex items-center pr-4 border-r-2 border-black h-full">
            <Link href="/" className="flex items-center pl-1 md:pl-2">
              <Image 
                src="/groovy-logo.png" 
                alt="Groovy" 
                width={160} 
                height={48} 
                className="h-9 md:h-10 w-auto" 
              />
            </Link>
          </div>
          {/* Center - Factory Name */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate px-4">
                {factory.name}
              </h1>
              <p className="text-sm text-gray-600 hidden md:block">Factory Profile</p>
            </div>
          </div>
          {/* Right - Action Buttons */}
          <div className="flex items-center pl-4 border-l-2 border-black h-full gap-3 justify-end pr-1 md:pr-2">
            <Button onClick={handleShare} variant="outline" size="sm" className="h-10 md:h-12 px-4 md:px-5 rounded-[6px] border-2 border-sky-600 text-sky-700 italic bg-white hover:bg-sky-50">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleConnect} size="sm" className="h-10 md:h-12 px-4 md:h-12 px-4 md:px-5 rounded-[6px] border-2 border-black bg-black text-white hover:bg-zinc-900">
              <MessageCircle className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section - Factory Overview */}
      <div className="bg-white border-b-2 border-black">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left - Factory Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {factory.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{factory.location}</span>
                  </div>
                  {profile?.description && (
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      {profile.description}
                    </p>
                  )}
                </div>

                {/* Factory Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 italic">Employees</p>
                    <p className="text-xl font-bold text-gray-900">150+</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <Cpu className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 italic">Machines</p>
                    <p className="text-xl font-bold text-gray-900">25+</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 italic">Capacity</p>
                    <p className="text-xl font-bold text-gray-900">{factory.capacity?.toLocaleString() || "10K"}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 italic">Experience</p>
                    <p className="text-xl font-bold text-gray-900">5+ yrs</p>
                  </div>
                </div>
              </div>

              {/* Right - Key Metrics */}
              <div className="space-y-4">
                <Card className="border-2 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Lead Time</span>
                      <span className="font-bold text-blue-600">{profile?.leadTime || "N/A"} days</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-bold text-purple-600">{profile?.responseTime || "N/A"} hours</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Min Order</span>
                      <span className="font-bold text-green-600">{profile?.minimumOrderQuantity || "N/A"}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-bold text-yellow-600">{profile?.verifiedMetrics?.averageRating || "N/A"}/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Main Contact */}
                <Card className="border-2 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5" />
                      Main Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">Sales Manager</p>
                      <p className="text-sm text-gray-600">Primary point of contact</p>
                    </div>
                    {profile?.contactInfo?.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a 
                          href={`mailto:${profile.contactInfo.email}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {profile.contactInfo.email}
                        </a>
                      </div>
                    )}
                    {profile?.contactInfo?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a 
                          href={`tel:${profile.contactInfo.phone}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {profile.contactInfo.phone}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* What We Make */}
              {profile?.whatWeMake && (
                <Card className="border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      What We Make
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{profile.whatWeMake}</p>
                  </CardContent>
                </Card>
              )}

              {/* Certifications */}
              {profile?.certifications && profile.certifications.length > 0 && (
                <Card className="border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certifications & Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {profile.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Photo Gallery */}
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Factory Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
                        <span className="text-gray-500 text-sm">Photo {i}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-6">
              {/* Business Information */}
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Terms</span>
                    <span className="font-medium">{profile?.paymentTerms || "N/A"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Production Capacity</span>
                    <span className="font-medium">{factory.capacity?.toLocaleString() || "N/A"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Years in Business</span>
                    <span className="font-medium">5+ years</span>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{factory.location}</p>
                      <p className="text-sm text-gray-600">Manufacturing Facility</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specialties */}
              {factory.specialties && factory.specialties.length > 0 && (
                <Card className="border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Specialties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {factory.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800 border-2 border-gray-300">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile?.contactInfo?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`mailto:${profile.contactInfo.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {profile.contactInfo.email}
                      </a>
                    </div>
                  )}
                  {profile?.contactInfo?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`tel:${profile.contactInfo.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {profile.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {profile?.contactInfo?.website && (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      <a 
                        href={profile.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-t-2 border-black">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Work Together?</h3>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Connect with {factory.name} to discuss your manufacturing needs. 
                  Get quotes, samples, and start your production journey today.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleConnect} size="lg" className="h-12 px-8 rounded-[6px] border-2 border-black bg-black text-white hover:bg-zinc-900">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Connect Now
                  </Button>
                  <Button variant="outline" size="lg" className="h-12 px-8 rounded-[6px] border-2 border-sky-600 text-sky-700 italic bg-white hover:bg-sky-50">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t-2 border-black">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/groovy-logo.png"
                alt="Groovy"
                width={120}
                height={36}
                className="h-8 w-auto"
              />
              <span className="text-gray-600">Powered by Groovy</span>
            </div>
            <p className="text-sm text-gray-500">
              Professional factory profiles for modern manufacturing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
