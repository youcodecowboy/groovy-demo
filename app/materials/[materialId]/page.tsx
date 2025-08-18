'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MaterialHeader from '@/components/materials/material-header'
import MaterialOverview from '@/components/materials/material-overview'
import { dataAdapter } from '@/lib/dataAdapter'
import { useToast } from '@/hooks/use-toast'
import { 
  type Material, 
  type InventorySnapshot,
  type MaterialMovement,
  type MaterialLot
} from '@/types/materials'

export default function MaterialDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const materialId = params.materialId as string
  const initialTab = searchParams.get('tab') || 'overview'
  
  const [material, setMaterial] = useState<Material | null>(null)
  const [inventorySnapshot, setInventorySnapshot] = useState<InventorySnapshot | null>(null)
  const [recentMovements, setRecentMovements] = useState<MaterialMovement[]>([])
  const [lots, setLots] = useState<MaterialLot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load material
        const materialData = await dataAdapter.getMaterial(materialId)
        if (!materialData) {
          toast({
            title: "Error",
            description: "Material not found",
            variant: "destructive",
          })
          router.push('/materials')
          return
        }
        setMaterial(materialData)

        // Load inventory snapshot
        const snapshot = await dataAdapter.getInventorySnapshot(materialId)
        setInventorySnapshot(snapshot)

        // Load recent movements
        const movements = await dataAdapter.getMaterialMovements(materialId)
        setRecentMovements(movements)

        // Load lots
        const lotsData = await dataAdapter.getMaterialLots(materialId)
        setLots(lotsData)

      } catch (error) {
        console.error('Failed to load material data:', error)
        toast({
          title: "Error",
          description: "Failed to load material data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (materialId) {
      loadData()
    }
  }, [materialId, router, toast])

  const handleBack = () => {
    router.push('/materials')
  }

  const handleEdit = () => {
    router.push(`/materials/${materialId}?tab=settings`)
  }

  const handleReceive = () => {
    toast({
      title: "Receive Material",
      description: "Receive dialog would open here",
    })
  }

  const handleIssue = () => {
    toast({
      title: "Issue Material",
      description: "Issue dialog would open here",
    })
  }

  const handleTransfer = () => {
    toast({
      title: "Transfer Material",
      description: "Transfer dialog would open here",
    })
  }

  const handlePrintLabel = () => {
    router.push(`/materials/labels?materials=${materialId}`)
  }

  const handleArchive = async () => {
    if (!material) return
    
    try {
      await dataAdapter.updateMaterial(materialId, {
        archived: !material.archived
      })
      
      setMaterial({
        ...material,
        archived: !material.archived
      })
      
      toast({
        title: "Success",
        description: `Material ${material.archived ? 'unarchived' : 'archived'} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update material status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!material || !inventorySnapshot) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold mb-2">Material not found</h2>
        <p className="text-muted-foreground mb-4">
          The material you're looking for doesn't exist or has been removed.
        </p>
        <button onClick={handleBack} className="text-primary hover:underline">
          Return to materials list
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MaterialHeader
        material={material}
        inventorySnapshot={inventorySnapshot}
        onBack={handleBack}
        onEdit={handleEdit}
        onReceive={handleReceive}
        onIssue={handleIssue}
        onTransfer={handleTransfer}
        onPrintLabel={handlePrintLabel}
        onArchive={handleArchive}
      />

      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lots">Lots & Locations</TabsTrigger>
            <TabsTrigger value="movements">Movements</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="labels">Labels</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MaterialOverview
              material={material}
              inventorySnapshot={inventorySnapshot}
              recentMovements={recentMovements}
            />
          </TabsContent>

          <TabsContent value="lots" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">Lots & Locations</h3>
              <p>Lot tracking and location management coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">Movement History</h3>
              <p>Detailed movement ledger coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">Usage Analytics</h3>
              <p>Usage by orders and consumption tracking coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">Price History</h3>
              <p>Price tracking and valuation methods coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="labels" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">Label Management</h3>
              <p>QR codes and label printing coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">Material Settings</h3>
              <p>Attribute editing and configuration coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">Audit Trail</h3>
              <p>Complete audit history coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}