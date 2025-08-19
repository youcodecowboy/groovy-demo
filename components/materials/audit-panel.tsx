'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Eye, 
  Calendar,
  User,
  Edit,
  Plus,
  Trash2,
  Download,
  Filter,
  Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { type Material } from '@/types/materials'

interface AuditEntry {
  id: string
  timestamp: number
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RECEIVE' | 'ISSUE' | 'TRANSFER' | 'ADJUST'
  entity: 'material' | 'lot' | 'location' | 'price' | 'settings'
  entityId: string
  actor: string
  changes: Record<string, { from: any; to: any }>
  metadata?: Record<string, any>
}

interface AuditPanelProps {
  material: Material
}

export default function AuditPanel({ material }: AuditPanelProps) {
  const { toast } = useToast()
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)

  useEffect(() => {
    loadAuditTrail()
  }, [material.id])

  const loadAuditTrail = async () => {
    try {
      setLoading(true)
      const auditData = await dataAdapter.getAuditTrail(material.id)
      setAuditEntries(auditData)
    } catch (error) {
      console.error('Failed to load audit trail:', error)
      toast({
        title: "Error",
        description: "Failed to load audit trail",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredEntries = auditEntries.filter(entry => {
    const matchesAction = filterAction === 'all' || entry.action === filterAction
    const matchesEntity = filterEntity === 'all' || entry.entity === filterEntity
    const matchesSearch = searchTerm === '' || 
      entry.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entityId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAction && matchesEntity && matchesSearch
  })

  const getActionBadge = (action: string) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      RECEIVE: 'bg-purple-100 text-purple-800',
      ISSUE: 'bg-orange-100 text-orange-800',
      TRANSFER: 'bg-teal-100 text-teal-800',
      ADJUST: 'bg-yellow-100 text-yellow-800',
    }
    return (
      <Badge className={colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {action}
      </Badge>
    )
  }

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'material': return Edit
      case 'lot': return Package
      case 'location': return Calendar
      case 'price': return DollarSign
      case 'settings': return Settings
      default: return Eye
    }
  }

  const exportAuditTrail = () => {
    const csvData = filteredEntries.map(entry => ({
      Timestamp: new Date(entry.timestamp).toLocaleString(),
      Action: entry.action,
      Entity: entry.entity,
      'Entity ID': entry.entityId,
      Actor: entry.actor,
      Changes: Object.keys(entry.changes).length,
      'Change Details': Object.entries(entry.changes)
        .map(([key, change]) => `${key}: ${change.from} → ${change.to}`)
        .join('; ')
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${material.code}-audit-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `Exported ${filteredEntries.length} audit entries to CSV`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters and search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="RECEIVE">Receive</SelectItem>
              <SelectItem value="ISSUE">Issue</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
              <SelectItem value="ADJUST">Adjust</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterEntity} onValueChange={setFilterEntity}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="material">Material</SelectItem>
              <SelectItem value="lot">Lot</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={exportAuditTrail}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Audit trail table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Audit Trail ({filteredEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => {
                  const EntityIcon = getEntityIcon(entry.entity)
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(entry.action)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EntityIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{entry.entity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{entry.actor}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {Object.keys(entry.changes).length} field{Object.keys(entry.changes).length !== 1 ? 's' : ''} changed
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Object.keys(entry.changes).slice(0, 2).join(', ')}
                          {Object.keys(entry.changes).length > 2 && ` +${Object.keys(entry.changes).length - 2} more`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Audit Entry Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Timestamp</Label>
                                  <p className="text-sm">{new Date(entry.timestamp).toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label>Actor</Label>
                                  <p className="text-sm">{entry.actor}</p>
                                </div>
                                <div>
                                  <Label>Action</Label>
                                  {getActionBadge(entry.action)}
                                </div>
                                <div>
                                  <Label>Entity</Label>
                                  <div className="flex items-center gap-2">
                                    <EntityIcon className="w-4 h-4" />
                                    <span className="text-sm capitalize">{entry.entity}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Entity ID</Label>
                                <code className="text-xs bg-muted px-1 rounded">{entry.entityId}</code>
                              </div>

                              {Object.keys(entry.changes).length > 0 && (
                                <div>
                                  <Label>Changes</Label>
                                  <div className="mt-2 space-y-2">
                                    {Object.entries(entry.changes).map(([field, change]) => (
                                      <div key={field} className="p-3 border rounded-lg">
                                        <div className="font-medium text-sm mb-1 capitalize">
                                          {field.replace('_', ' ')}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                                            From: {String(change.from)}
                                          </span>
                                          <span>→</span>
                                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                            To: {String(change.to)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                                <div>
                                  <Label>Additional Information</Label>
                                  <div className="mt-2 p-3 bg-muted rounded-lg">
                                    <pre className="text-xs overflow-auto">
                                      {JSON.stringify(entry.metadata, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <p>No audit entries found</p>
              {(filterAction !== 'all' || filterEntity !== 'all' || searchTerm) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setFilterAction('all')
                    setFilterEntity('all')
                    setSearchTerm('')
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <Edit className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">
                  {auditEntries.filter(e => e.action === 'UPDATE').length}
                </div>
                <div className="text-sm text-muted-foreground">Updates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-full">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">
                  {auditEntries.filter(e => e.action === 'RECEIVE').length}
                </div>
                <div className="text-sm text-muted-foreground">Receipts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">
                  {[...new Set(auditEntries.map(e => e.actor))].length}
                </div>
                <div className="text-sm text-muted-foreground">Unique Actors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
