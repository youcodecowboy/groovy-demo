"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  History, 
  Search, 
  Filter,
  User,
  Clock,
  Edit3,
  ArrowRight,
  Settings,
  AlertTriangle,
  CheckCircle,
  MapPin,
  DollarSign,
  MessageSquare
} from "lucide-react"

interface AuditEntry {
  id: string
  timestamp: number
  user: string
  action: string
  type: 'attribute' | 'stage' | 'costing' | 'admin_override' | 'location' | 'note' | 'message'
  details: string
  metadata?: Record<string, any>
}

interface AuditLogProps {
  entries: AuditEntry[]
  maxEntries?: number
}

export function AuditLog({ entries, maxEntries = 50 }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterUser, setFilterUser] = useState<string>("all")

  // Get unique users and types for filters
  const users = useMemo(() => {
    const uniqueUsers = [...new Set(entries.map(entry => entry.user))]
    return uniqueUsers.sort()
  }, [entries])

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(entries.map(entry => entry.type))]
    return uniqueTypes.sort()
  }, [entries])

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const matchesSearch = entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.user.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesType = filterType === "all" || entry.type === filterType
        const matchesUser = filterUser === "all" || entry.user === filterUser
        
        return matchesSearch && matchesType && matchesUser
      })
      .slice(0, maxEntries)
  }, [entries, searchTerm, filterType, filterUser, maxEntries])

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionIcon = (type: AuditEntry['type']) => {
    switch (type) {
      case 'attribute': return <Edit3 className="h-4 w-4" />
      case 'stage': return <ArrowRight className="h-4 w-4" />
      case 'costing': return <DollarSign className="h-4 w-4" />
      case 'admin_override': return <Settings className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      case 'note': return <MessageSquare className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      default: return <History className="h-4 w-4" />
    }
  }

  const getActionColor = (type: AuditEntry['type']) => {
    switch (type) {
      case 'attribute': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'stage': return 'bg-green-100 text-green-800 border-green-200'
      case 'costing': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin_override': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'location': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'note': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'message': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setFilterUser("all")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Audit Log
          <Badge variant="outline" className="ml-auto">
            {filteredEntries.length} of {entries.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search audit entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user} value={user}>
                    {user.split('@')[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Audit Entries */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                <div className={`p-2 rounded-lg border ${getActionColor(entry.type)}`}>
                  {getActionIcon(entry.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{entry.action}</span>
                    <Badge className={`text-xs ${getActionColor(entry.type)}`}>
                      {entry.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-2">
                    {entry.details}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {entry.user.split('@')[0]}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Metadata:</div>
                      <div className="space-y-1">
                        {Object.entries(entry.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">No audit entries</h4>
              <p className="text-gray-600">
                {entries.length === 0 
                  ? "No audit entries found for this item"
                  : "No entries match your current filters"
                }
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        {entries.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Entries</div>
                <div className="font-medium">{entries.length}</div>
              </div>
              <div>
                <div className="text-gray-500">Filtered</div>
                <div className="font-medium">{filteredEntries.length}</div>
              </div>
              <div>
                <div className="text-gray-500">Latest</div>
                <div className="font-medium">
                  {entries.length > 0 ? formatTimestamp(entries[0].timestamp) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
