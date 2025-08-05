import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    MessageSquare,
    Send,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Phone,
    Mail
} from "lucide-react"
import { BrandHeader } from "@/components/brand/brand-header"

export default function BrandMessaging() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrandHeader />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messaging Hub</h1>
          <p className="text-gray-600">Communicate with your factory partners and track conversations</p>
        </div>

        {/* Messaging Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Messages</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Conversations</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

                      <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">2.3h</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Button className="bg-black hover:bg-gray-800">
                <Send className="w-4 h-4 mr-2" />
                New Message
              </Button>
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Schedule Call
              </Button>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Search messages by factory, order, or content..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        <div className="space-y-4">
          {/* Conversation 1 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Factory A - Production Update</h3>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Unread
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "Hi there! We've completed 75% of the PO-2024-001 order. Everything is on schedule..."
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Order: PO-2024-001</span>
                      <span>2 hours ago</span>
                      <span>5 messages</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    View Thread
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation 2 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Factory B - Quality Issue</h3>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "We've identified a quality issue with batch SKU-456. Need your input on how to proceed..."
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Order: PO-2024-002</span>
                      <span>1 day ago</span>
                      <span>3 messages</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    View Thread
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation 3 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Factory C - Order Confirmation</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "Thank you for the PO-2024-003 order. We've confirmed all specifications and will begin..."
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Order: PO-2024-003</span>
                      <span>3 days ago</span>
                      <span>2 messages</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    View Thread
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation 4 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Factory A - General Inquiry</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      "Hello! We wanted to discuss potential capacity expansion for future orders..."
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>General</span>
                      <span>1 week ago</span>
                      <span>4 messages</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    View Thread
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 