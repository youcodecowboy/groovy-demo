'use client'

import { ArrowLeft, QrCode, Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MaterialLabelsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Material Labels</h1>
          <p className="text-muted-foreground">
            Print QR codes and labels for materials, lots, and locations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Label Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create and manage label templates for different material types
            </p>
            <Button variant="outline" className="w-full">
              Manage Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Print Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View and manage your label printing queue
            </p>
            <Button variant="outline" className="w-full">
              View Queue
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Bulk Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Export labels in bulk for printing or digital use
            </p>
            <Button variant="outline" className="w-full">
              Export Labels
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-12 text-muted-foreground">
        <QrCode className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Label System Coming Soon</h3>
        <p>
          Full label management and QR code generation will be available in the next update.
        </p>
      </div>
    </div>
  )
}
