'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, AlertTriangle, CheckCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MaterialAlertsPanel from '@/components/materials/material-alerts-panel'

export default function MaterialAlertsPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/materials')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Materials
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Material Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage material inventory alerts
          </p>
        </div>
      </div>

      {/* Alerts panel */}
      <MaterialAlertsPanel />
    </div>
  )
}
