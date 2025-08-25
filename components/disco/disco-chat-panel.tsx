"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  AlertTriangle,
  Bell,
  TrendingUp,
  Loader2,
  CheckCircle,
  X,
  MessageCircle,
  Zap,
  Shield,
} from "lucide-react"

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: number
  citations?: string[]
  enrichment?: {
    labels: string[]
    entities: string[]
    fields?: Record<string, any>
  }
  proposedAction?: {
    type: string
    payload: any
  }
  confidence?: number
}

interface DiscoChatPanelProps {
  userId: string
  factoryId: string
  isOpen: boolean
  onToggle: () => void
  currentTeam?: string
}

export function DiscoChatPanel({ 
  userId, 
  factoryId, 
  isOpen, 
  onToggle,
  currentTeam = "production" 
}: DiscoChatPanelProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showEnrichment, setShowEnrichment] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    try {
      // Call the chat API
      const response = await fetch('/api/disco/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          factoryId,
          text: userMessage.content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chat request failed')
      }

      const result = await response.json()

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        type: 'assistant',
        content: result.answer,
        timestamp: Date.now(),
        citations: result.citations,
        enrichment: result.enrichment,
        proposedAction: result.proposed_action,
        confidence: result.confidence,
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error: any) {
      console.error('Chat error:', error)
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: Date.now(),
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleExecuteAction = async (action: any) => {
    try {
      const response = await fetch('/api/disco/chat/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          factoryId,
          action,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Action failed')
      }

      const result = await response.json()
      
      toast({
        title: "Action Completed",
        description: `${action.type} executed successfully`,
      })

      // Add a confirmation message
      const confirmMessage: ChatMessage = {
        id: `confirm_${Date.now()}`,
        type: 'assistant',
        content: `✅ Action completed: ${action.type}`,
        timestamp: Date.now(),
      }
      
      setMessages(prev => [...prev, confirmMessage])

    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_message': return <MessageCircle className="w-4 h-4" />
      case 'create_alert': return <AlertTriangle className="w-4 h-4" />
      case 'escalate_dashboard': return <TrendingUp className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'send_message': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'create_alert': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'escalate_dashboard': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Sheet open={isOpen} onOpenChange={onToggle}>
      <SheetContent side="bottom" className="h-[70vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <SheetTitle>Production Assistant</SheetTitle>
                <Badge variant="outline" className="text-xs">
                  {currentTeam}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowEnrichment(!showEnrichment)}
                >
                  <Shield className="w-4 h-4" />
                  Data
                </Button>
                <Button variant="ghost" size="sm" onClick={onToggle}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {messages.length === 0 && (
              <p className="text-sm text-gray-600">
                Ask me about production status, inventory, or quality issues
              </p>
            )}
          </SheetHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    Start a conversation about your factory operations
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 max-w-md mx-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setInputText("What's the status of WASHED today?")}
                    >
                      Status Update
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setInputText("Any quality issues this shift?")}
                    >
                      Quality Check
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setInputText("Show me alerts and escalations")}
                    >
                      Alerts
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setInputText("Help me message the team")}
                    >
                      Team Message
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {/* Message */}
                  <div className={`flex items-start gap-3 ${
                    message.type === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                    <div className={`p-2 rounded-full ${
                      message.type === 'user' 
                        ? 'bg-blue-100' 
                        : 'bg-gray-100'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    
                    <div className={`flex-1 ${
                      message.type === 'user' ? 'text-right' : ''
                    }`}>
                      <Card className={`${
                        message.type === 'user'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white'
                      }`}>
                        <CardContent className="p-3">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Confidence and enrichment info */}
                          {message.type === 'assistant' && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                              {message.confidence && (
                                <span className={getConfidenceColor(message.confidence)}>
                                  {Math.round(message.confidence * 100)}% confident
                                </span>
                              )}
                              {message.citations && message.citations.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {message.citations.length} citation{message.citations.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Proposed Action */}
                  {message.proposedAction && (
                    <div className="ml-14">
                      <Card className={`border-2 ${getActionColor(message.proposedAction.type)}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getActionIcon(message.proposedAction.type)}
                              <span className="text-sm font-medium">
                                Suggested Action: {message.proposedAction.type.replace('_', ' ')}
                              </span>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleExecuteAction(message.proposedAction)}
                            >
                              Execute
                            </Button>
                          </div>
                          <pre className="text-xs bg-white/50 p-2 rounded">
                            {JSON.stringify(message.proposedAction.payload, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Enrichment Data (expandable) */}
                  {showEnrichment && message.enrichment && (
                    <div className="ml-14">
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700">
                          <ChevronDown className="w-3 h-3" />
                          View extracted data
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Card className="mt-2 bg-gray-50">
                            <CardContent className="p-3 text-xs">
                              {message.enrichment.labels.length > 0 && (
                                <div className="mb-2">
                                  <span className="font-medium">Labels: </span>
                                  {message.enrichment.labels.map(label => (
                                    <Badge key={label} variant="secondary" className="text-xs mr-1">
                                      {label}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {message.enrichment.entities.length > 0 && (
                                <div className="mb-2">
                                  <span className="font-medium">Entities: </span>
                                  <span>{message.enrichment.entities.join(', ')}</span>
                                </div>
                              )}
                              {message.enrichment.fields && Object.keys(message.enrichment.fields).length > 0 && (
                                <div>
                                  <span className="font-medium">Fields: </span>
                                  <pre className="mt-1 text-xs">
                                    {JSON.stringify(message.enrichment.fields, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <Card className="flex-1">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about production, quality, inventory, or team status..."
                className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setInputText("Message shift lead about delays")}
                disabled={isLoading}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Message Team
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setInputText("Create alert for high wash p75 times")}
                disabled={isLoading}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Create Alert
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setInputText("Escalate variance analysis to dashboard")}
                disabled={isLoading}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Escalate
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}