'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  FileText, 
  Calendar, 
  Database,
  Clock,
  CheckCircle
} from 'lucide-react'
import { format, subDays } from 'date-fns'

// Mock export data
const mockExports = [
  {
    id: 'export-1',
    name: 'Order Data Export',
    type: 'orders',
    format: 'CSV',
    period: 'Last 30 days',
    status: 'completed',
    createdAt: subDays(new Date(), 1),
    downloadUrl: '/api/exports/orders.csv',
    size: '2.3 MB'
  },
  {
    id: 'export-2',
    name: 'Billing Usage Report',
    type: 'billing',
    format: 'PDF',
    period: 'Current month',
    status: 'completed',
    createdAt: subDays(new Date(), 3),
    downloadUrl: '/api/exports/billing.pdf',
    size: '1.1 MB'
  },
  {
    id: 'export-3',
    name: 'Factory Performance Data',
    type: 'factories',
    format: 'Excel',
    period: 'Last 90 days',
    status: 'processing',
    createdAt: new Date(),
    size: 'Processing...'
  }
]

const exportTemplates = [
  {
    id: 'orders-template',
    name: 'Orders Export',
    description: 'Export all order data including status, progress, and factory information',
    icon: FileText,
    formats: ['CSV', 'Excel', 'JSON']
  },
  {
    id: 'billing-template',
    name: 'Billing & Usage',
    description: 'Export billing data, usage metrics, and cost breakdowns',
    icon: Database,
    formats: ['PDF', 'CSV', 'Excel']
  },
  {
    id: 'factories-template',
    name: 'Factory Performance',
    description: 'Export factory performance metrics and KPIs',
    icon: Calendar,
    formats: ['CSV', 'Excel', 'PDF']
  },
  {
    id: 'messages-template',
    name: 'Communications Log',
    description: 'Export message history and communication records',
    icon: FileText,
    formats: ['PDF', 'CSV']
  }
]

export function BrandBillingExports() {
  const handleCreateExport = (templateId: string, format: string) => {
    console.log(`Creating export for ${templateId} in ${format} format`)
    // In a real app, this would trigger the export creation
  }

  const handleDownload = (exportId: string, url: string) => {
    console.log(`Downloading export ${exportId} from ${url}`)
    // In a real app, this would download the file
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Exports</h1>
        <p className="text-gray-600">
          Export your brand data for analysis, reporting, or backup purposes.
        </p>
      </div>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockExports.map((exportItem) => (
              <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{exportItem.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{exportItem.format}</span>
                      <span>•</span>
                      <span>{exportItem.period}</span>
                      <span>•</span>
                      <span>{format(exportItem.createdAt, 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge 
                      variant={exportItem.status === 'completed' ? 'default' : 'secondary'}
                      className={exportItem.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {exportItem.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {exportItem.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{exportItem.size}</p>
                  </div>
                  
                  {exportItem.status === 'completed' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleDownload(exportItem.id, exportItem.downloadUrl!)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exportTemplates.map((template) => {
              const IconComponent = template.icon
              return (
                <div key={template.id} className="border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                          Available Formats
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {template.formats.map((format) => (
                            <Button
                              key={format}
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateExport(template.id, format)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {format}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Programmatic Access</h3>
              <p className="text-gray-600 mb-4">
                Access your brand data programmatically using our REST API.
              </p>
              <Button variant="outline">
                View API Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
