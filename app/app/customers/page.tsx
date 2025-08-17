"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, Users2, TrendingUp, Clock, DollarSign, QrCode } from "lucide-react"
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

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const customers = useQuery(api.customers.getAll)
  const stats = useQuery(api.customers.getStats)
  const followUpData = useQuery(api.customers.getFollowUpRequired)

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter
    const matchesType = typeFilter === "all" || customer.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  }) || []

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (!customers || !stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 italic">Manage your customer relationships</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/customers/factory-profile">
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Factory Profile
            </Button>
          </Link>
          <Link href="/app/customers/new">
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Total Customers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Prospects</p>
                <p className="text-2xl font-bold text-blue-600">{stats.prospects}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 italic">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredCustomers.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({customers.filter(c => c.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="prospects">Prospects ({customers.filter(c => c.status === 'prospect').length})</TabsTrigger>
          <TabsTrigger value="followup">Follow-up ({followUpData?.customers.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <CustomersList customers={filteredCustomers} />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <CustomersList customers={customers.filter(c => c.status === 'active')} />
        </TabsContent>

        <TabsContent value="prospects" className="space-y-4">
          <CustomersList customers={customers.filter(c => c.status === 'prospect')} />
        </TabsContent>

        <TabsContent value="followup" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customers Requiring Follow-up</h3>
            {followUpData?.customers.length === 0 ? (
              <Card className="border-2 border-gray-200">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No customers require follow-up</p>
                </CardContent>
              </Card>
            ) : (
              <CustomersList customers={followUpData?.customers || []} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CustomersList({ customers }: { customers: any[] }) {
  if (customers.length === 0) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-8 text-center">
          <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No customers found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {customers.map((customer) => (
        <Link key={customer._id} href={`/app/customers/${customer._id}`}>
          <Card className="border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <Badge className={statusColors[customer.status as keyof typeof statusColors]}>
                      {customer.status}
                    </Badge>
                    <Badge className={typeColors[customer.type as keyof typeof typeColors]}>
                      {customer.type}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {customer.companyName && (
                      <p><span className="italic">Company:</span> {customer.companyName}</p>
                    )}
                    {customer.email && (
                      <p><span className="italic">Email:</span> {customer.email}</p>
                    )}
                    {customer.phone && (
                      <p><span className="italic">Phone:</span> {customer.phone}</p>
                    )}
                    {customer.industry && (
                      <p><span className="italic">Industry:</span> {customer.industry}</p>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  {customer.value && (
                    <p className="font-semibold text-green-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(customer.value)}
                    </p>
                  )}
                  {customer.lastContact && (
                    <p className="text-sm text-gray-500">
                      Last contact: {new Date(customer.lastContact).toLocaleDateString()}
                    </p>
                  )}
                  {customer.nextFollowUp && (
                    <p className="text-sm text-orange-600">
                      Follow-up: {new Date(customer.nextFollowUp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
