"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Building, 
  User, 
  Calendar,
  DollarSign,
  Tag,
  MessageSquare,
  Plus,
  Users2,
  History
} from "lucide-react"
import Link from "next/link"

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
  lead: "bg-yellow-100 text-yellow-800 border-yellow-200",
}

const typeColors = {
  individual: "bg-purple-100 text-purple-800 border-purple-200",
  business: "bg-indigo-100 text-indigo-800 border-indigo-200",
  enterprise: "bg-red-100 text-red-800 border-red-200",
}

const interactionTypeColors = {
  call: "bg-blue-100 text-blue-800 border-blue-200",
  email: "bg-green-100 text-green-800 border-green-200",
  meeting: "bg-purple-100 text-purple-800 border-purple-200",
  note: "bg-gray-100 text-gray-800 border-gray-200",
  quote: "bg-yellow-100 text-yellow-800 border-yellow-200",
  order: "bg-green-100 text-green-800 border-green-200",
  support: "bg-red-100 text-red-800 border-red-200",
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.customerId as string
  
  const customer = useQuery(api.customers.getById, { id: customerId as any })
  const contacts = useQuery(api.customers.getContacts, { customerId: customerId as any })
  const interactions = useQuery(api.customers.getInteractions, { customerId: customerId as any })
  const removeCustomer = useMutation(api.customers.remove)

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await removeCustomer({ id: customerId as any })
      router.push("/app/customers")
    } catch (error) {
      console.error("Error deleting customer:", error)
      alert("Failed to delete customer. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600 italic">
              {customer.companyName && `${customer.companyName} • `}
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/customers/${customerId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Status</p>
                <Badge className={statusColors[customer.status as keyof typeof statusColors]}>
                  {customer.status}
                </Badge>
              </div>
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Type</p>
                <Badge className={typeColors[customer.type as keyof typeof typeColors]}>
                  {customer.type}
                </Badge>
              </div>
              <Building className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Value</p>
                <p className="text-xl font-bold text-green-600">
                  {customer.value ? formatCurrency(customer.value) : "N/A"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Contacts</p>
                <p className="text-xl font-bold">{contacts?.length || 0}</p>
              </div>
              <Users2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts?.length || 0})</TabsTrigger>
          <TabsTrigger value="interactions">Interactions ({interactions?.length || 0})</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 italic">Email</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 italic">Phone</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>
                )}
                {customer.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 italic">Website</p>
                      <a href={customer.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                        {customer.website}
                      </a>
                    </div>
                  </div>
                )}
                {customer.industry && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 italic">Industry</p>
                      <p className="font-medium">{customer.industry}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            {customer.address && (
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 italic">Address</p>
                      <p className="font-medium">
                        {customer.address.street}<br />
                        {customer.address.city}, {customer.address.state} {customer.address.zipCode}<br />
                        {customer.address.country}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Information */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customer.source && (
                  <div>
                    <p className="text-sm text-gray-600 italic">Lead Source</p>
                    <p className="font-medium">{customer.source}</p>
                  </div>
                )}
                {customer.assignedTo && (
                  <div>
                    <p className="text-sm text-gray-600 italic">Assigned To</p>
                    <p className="font-medium">{customer.assignedTo}</p>
                  </div>
                )}
                {customer.lastContact && (
                  <div>
                    <p className="text-sm text-gray-600 italic">Last Contact</p>
                    <p className="font-medium">{formatDate(customer.lastContact)}</p>
                  </div>
                )}
              </div>

              {customer.tags && customer.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 italic mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {customer.notes && (
                <div>
                  <p className="text-sm text-gray-600 italic mb-2">Notes</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Customer Contacts</h3>
            <Link href={`/app/customers/${customerId}/contacts/new`}>
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </Link>
          </div>
          
          {contacts?.length === 0 ? (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8 text-center">
                <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contacts found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {contacts?.map((contact) => (
                <Card key={contact._id} className="border-2 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">
                            {contact.firstName} {contact.lastName}
                          </h4>
                          {contact.isPrimary && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {contact.title && (
                            <p><span className="italic">Title:</span> {contact.title}</p>
                          )}
                          {contact.email && (
                            <p><span className="italic">Email:</span> {contact.email}</p>
                          )}
                          {contact.phone && (
                            <p><span className="italic">Phone:</span> {contact.phone}</p>
                          )}
                          {contact.department && (
                            <p><span className="italic">Department:</span> {contact.department}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/app/customers/${customerId}/contacts/${contact._id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Customer Interactions</h3>
            <Link href={`/app/customers/${customerId}/interactions/new`}>
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Add Interaction
              </Button>
            </Link>
          </div>
          
          {interactions?.length === 0 ? (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No interactions found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {interactions?.map((interaction) => (
                <Card key={interaction._id} className="border-2 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={interactionTypeColors[interaction.type as keyof typeof interactionTypeColors]}>
                            {interaction.type}
                          </Badge>
                          <h4 className="font-semibold">{interaction.subject}</h4>
                        </div>
                        <p className="text-gray-600 mb-2">{interaction.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(interaction.createdAt)}
                          </span>
                          {interaction.followUpRequired && (
                            <span className="text-orange-600">Follow-up required</span>
                          )}
                        </div>
                        {interaction.outcome && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="italic">Outcome:</span> {interaction.outcome}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/app/customers/${customerId}/interactions/${interaction._id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href={`/app/customers/${customerId}/contacts/new`}>
                  <Button variant="outline" className="w-full h-20 flex-col">
                    <Users2 className="h-6 w-6 mb-2" />
                    Add Contact
                  </Button>
                </Link>
                <Link href={`/app/customers/${customerId}/interactions/new`}>
                  <Button variant="outline" className="w-full h-20 flex-col">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    Log Interaction
                  </Button>
                </Link>
                <Link href={`/app/customers/${customerId}/edit`}>
                  <Button variant="outline" className="w-full h-20 flex-col">
                    <Edit className="h-6 w-6 mb-2" />
                    Edit Customer
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full h-20 flex-col text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-6 w-6 mb-2" />
                  {isDeleting ? "Deleting..." : "Delete Customer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
