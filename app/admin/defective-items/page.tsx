"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Package, User, Calendar } from "lucide-react"
import Link from "next/link"

export default function DefectiveItemsPage() {
  const defectiveItems = useQuery(api.items.getDefectiveItems)
  const workflows = useQuery(api.workflows.getAll)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows?.find(w => w._id === workflowId)
    return workflow?.name || "Unknown Workflow"
  }

  const getStageName = (workflowId: string, stageId: string) => {
    const workflow = workflows?.find(w => w._id === workflowId)
    const stage = workflow?.stages.find(s => s.id === stageId)
    return stage?.name || "Unknown Stage"
  }

  if (defectiveItems === undefined) {
    return (
      <AdminSidebar>
        <div className="flex-1 space-y-6 p-6">
          <div className="text-center py-12">
            <div className="text-lg">Loading defective items...</div>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Defective Items</h1>
            <p className="text-muted-foreground">
              View and manage items that have been marked as defective
            </p>
          </div>
          <Badge variant="destructive" className="text-sm">
            {defectiveItems?.length || 0} Defective Items
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Defective Items List
            </CardTitle>
            <CardDescription>
              Items that have been flagged as defective and require attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {defectiveItems?.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Defective Items
                </h3>
                <p className="text-gray-500">
                  There are currently no items marked as defective
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Defect Notes</TableHead>
                    <TableHead>Flagged By</TableHead>
                    <TableHead>Flagged At</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defectiveItems?.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-mono">
                        <Link 
                          href={`/floor/items/${item.itemId}`}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {item.itemId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          {getWorkflowName(item.workflowId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getStageName(item.workflowId, item.currentStageId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === "active" ? "default" : "secondary"}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={item.defectNotes}>
                          {item.defectNotes || "No notes provided"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {item.flaggedBy || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {item.flaggedAt ? formatDate(item.flaggedAt) : "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {item.assignedTo}
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/floor/items/${item.itemId}`}>
                              Floor View
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  )
} 