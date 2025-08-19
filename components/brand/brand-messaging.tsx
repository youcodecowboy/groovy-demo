'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Search, 
  Filter,
  MoreVertical,
  Star,
  Archive,
  Trash2
} from 'lucide-react'
import { brandAdapter } from '@/lib/brand-adapter'
import { BrandThread, BrandOrder, BrandFactory } from '@/lib/brand-mock-data'
import { format, formatDistanceToNow } from 'date-fns'
import { useSearchParams } from 'next/navigation'

// Mock message data for selected thread
const mockMessages = [
  {
    id: 'msg-1',
    from: 'Nguyen Van A',
    fromEmail: 'nguyen@apexmfg.com',
    content: 'Hello! We have started production on PO-2024-001. The materials have been sourced and our team is ready to begin cutting tomorrow.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    attachments: ['production-schedule.pdf']
  },
  {
    id: 'msg-2',
    from: 'Brand Team',
    fromEmail: 'brand@company.com',
    content: 'Great to hear! Please keep us updated on the progress. We noticed the delivery date is quite tight - will you be able to meet the promised timeline?',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    attachments: []
  },
  {
    id: 'msg-3',
    from: 'Nguyen Van A',
    fromEmail: 'nguyen@apexmfg.com',
    content: 'Yes, we are confident about meeting the timeline. We have allocated extra resources to this order given its priority. I\'ll send daily progress updates.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    attachments: []
  },
  {
    id: 'msg-4',
    from: 'Brand Team',
    fromEmail: 'brand@company.com',
    content: 'Perfect! Looking forward to the updates. Please also share photos of the first few pieces for quality review.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    attachments: []
  }
]

export function BrandMessaging() {
  const searchParams = useSearchParams()
  const [threads, setThreads] = useState<BrandThread[]>([])
  const [selectedThread, setSelectedThread] = useState<BrandThread | null>(null)
  const [orders, setOrders] = useState<BrandOrder[]>([])
  const [factories, setFactories] = useState<BrandFactory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUnread, setFilterUnread] = useState(false)
  const [filterFactory, setFilterFactory] = useState<string>('all')
  const [newMessage, setNewMessage] = useState('')
  const [filteredThreads, setFilteredThreads] = useState<BrandThread[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [threadsData, ordersData, factoriesData] = await Promise.all([
          brandAdapter.getThreads(),
          brandAdapter.getOrders(),
          brandAdapter.getFactories()
        ])
        
        setThreads(threadsData)
        setOrders(ordersData)
        setFactories(factoriesData)
        setFilteredThreads(threadsData)

        // Auto-select thread if order parameter is provided
        const orderParam = searchParams?.get('order')
        if (orderParam) {
          const orderThread = threadsData.find(thread => thread.orderId === orderParam)
          if (orderThread) {
            setSelectedThread(orderThread)
          }
        } else if (threadsData.length > 0) {
          setSelectedThread(threadsData[0])
        }
      } catch (error) {
        console.error('Failed to load messaging data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchParams])

  useEffect(() => {
    let filtered = [...threads]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(thread => 
        thread.subject.toLowerCase().includes(search) ||
        thread.participants.some(p => p.toLowerCase().includes(search))
      )
    }

    if (filterUnread) {
      filtered = filtered.filter(thread => thread.unreadCount > 0)
    }

    if (filterFactory !== 'all') {
      filtered = filtered.filter(thread => thread.factoryId === filterFactory)
    }

    setFilteredThreads(filtered)
  }, [threads, searchTerm, filterUnread, filterFactory])

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedThread) {
      // In a real app, this would send the message via the adapter
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const getThreadOrder = (thread: BrandThread) => {
    return thread.orderId ? orders.find(order => order.id === thread.orderId) : null
  }

  const getThreadFactory = (thread: BrandThread) => {
    return thread.factoryId ? factories.find(factory => factory.id === thread.factoryId) : null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <Card className="animate-pulse">
            <CardContent className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 animate-pulse">
            <CardContent className="p-4">
              <div className="h-full bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Thread List */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Conversations</CardTitle>
            
            {/* Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterUnread ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterUnread(!filterUnread)}
                >
                  Unread
                </Button>
                
                <Select value={filterFactory} onValueChange={setFilterFactory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Factories</SelectItem>
                    {factories.map((factory) => (
                      <SelectItem key={factory.id} value={factory.id}>
                        {factory.name.split(' ')[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="space-y-1">
              {filteredThreads.map((thread) => {
                const order = getThreadOrder(thread)
                const factory = getThreadFactory(thread)
                const isSelected = selectedThread?.id === thread.id
                
                return (
                  <div
                    key={thread.id}
                    className={`p-4 cursor-pointer border-l-4 transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {thread.unreadCount > 0 && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <h4 className={`text-sm font-medium truncate ${
                            thread.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {thread.subject}
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {order && (
                            <Badge variant="outline" className="text-xs">
                              {order.poNumber}
                            </Badge>
                          )}
                          {factory && (
                            <span className="text-xs text-gray-600 truncate">
                              {factory.name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(thread.lastMessage, { addSuffix: true })}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {thread.hasAttachments && (
                              <Paperclip className="h-3 w-3 text-gray-400" />
                            )}
                            {thread.unreadCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {thread.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {thread.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {filteredThreads.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Panel */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedThread ? (
            <>
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedThread.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const order = getThreadOrder(selectedThread)
                        const factory = getThreadFactory(selectedThread)
                        return (
                          <>
                            {order && (
                              <Badge variant="outline">
                                {order.poNumber}
                              </Badge>
                            )}
                            {factory && (
                              <span className="text-sm text-gray-600">
                                {factory.name}
                              </span>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mockMessages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {message.from.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{message.from}</span>
                          <span className="text-xs text-gray-500">
                            {format(message.timestamp, 'MMM d, h:mm a')}
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm">{message.content}</p>
                          
                          {message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs text-blue-600">
                                  <Paperclip className="h-3 w-3" />
                                  <span>{attachment}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message Composer */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleSendMessage()
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach Files
                    </Button>
                    
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
