"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWorkflows, useItemMutations } from "@/hooks/use-convex"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, Clock, Package, ThumbsUp } from "lucide-react"

export default function TestApprovalSystemPage() {
  const { toast } = useToast()
  const { workflows } = useWorkflows()
  const { advanceToStage, advanceStage } = useItemMutations()
  
  // Get test items
  const items = useQuery(api.items.getAll)
  const seedData = useMutation(api.seed.seedDemoData)
  
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  const runApprovalTest = async () => {
    setIsRunningTests(true)
    const results = []

    try {
      // Test 1: Verify DEMO-002 has approval actions
      const demo002 = items?.find(item => item.itemId === "DEMO-002")
      if (demo002) {
        const workflow = workflows?.find(w => w._id === demo002.workflowId)
        const currentStage = workflow?.stages.find(s => s.id === demo002.currentStageId)
        
        const hasApprovalAction = currentStage?.actions?.some(action => action.type === "approval")
        
        results.push({
          test: "DEMO-002 Approval Actions",
          status: hasApprovalAction ? "PASS" : "FAIL",
          details: hasApprovalAction 
            ? `Found ${currentStage?.actions?.filter(a => a.type === "approval").length} approval actions`
            : "No approval actions found in current stage"
        })
      } else {
        results.push({
          test: "DEMO-002 Approval Actions",
          status: "FAIL",
          details: "DEMO-002 item not found"
        })
      }

      // Test 2: Verify workflow structure
      if (workflows && workflows.length > 0) {
        const workflow = workflows[0]
        const hasApprovalStages = workflow.stages.some(stage => 
          stage.actions?.some(action => action.type === "approval")
        )
        
        results.push({
          test: "Workflow Approval Structure",
          status: hasApprovalStages ? "PASS" : "FAIL",
          details: hasApprovalStages 
            ? `Found approval actions in ${workflow.stages.filter(stage => 
                stage.actions?.some(action => action.type === "approval")
              ).length} stages`
            : "No approval actions found in workflow"
        })
      }

      // Test 3: Verify item status defaults
      const activeItems = items?.filter(item => item.status === "active")
      results.push({
        test: "Item Status Defaults",
        status: activeItems && activeItems.length > 0 ? "PASS" : "FAIL",
        details: `Found ${activeItems?.length || 0} active items`
      })

      // Test 4: Test approval action rendering
      const approvalActions = workflows?.flatMap(w => 
        w.stages.flatMap(s => 
          s.actions?.filter(a => a.type === "approval") || []
        )
      ) || []
      
      results.push({
        test: "Approval Action Configuration",
        status: approvalActions.length > 0 ? "PASS" : "FAIL",
        details: `Found ${approvalActions.length} approval actions across all workflows`
      })

    } catch (error) {
      results.push({
        test: "Test Execution",
        status: "ERROR",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    }

    setTestResults(results)
    setIsRunningTests(false)
  }

  const resetTestData = async () => {
    try {
      await seedData({})
      toast({
        title: "✅ Test Data Reset",
        description: "Demo data has been recreated with proper approval actions",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset test data",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "FAIL":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASS":
        return "bg-green-100 text-green-800 border-green-200"
      case "FAIL":
        return "bg-red-100 text-red-800 border-red-200"
      case "ERROR":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Approval System Test Suite
          </h1>
          <p className="text-gray-600">
            Test the approval workflow and verify all components work correctly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5" />
                Test Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runApprovalTest} 
                disabled={isRunningTests}
                className="w-full"
              >
                {isRunningTests ? "Running Tests..." : "Run Approval Tests"}
              </Button>
              
              <Button 
                onClick={resetTestData} 
                variant="outline"
                className="w-full"
              >
                Reset Test Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Current Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Workflows:</span>
                <Badge variant="outline">{workflows?.length || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <Badge variant="outline">{items?.length || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Active Items:</span>
                <Badge variant="outline">
                  {items?.filter(item => item.status === "active").length || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.test}</span>
                      </div>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.details}</p>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Summary:</span>
                  <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      {testResults.filter(r => r.status === "PASS").length} Pass
                    </Badge>
                    <Badge className="bg-red-100 text-red-800">
                      {testResults.filter(r => r.status === "FAIL").length} Fail
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800">
                      {testResults.filter(r => r.status === "ERROR").length} Error
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {items && items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Items Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => {
                  const workflow = workflows?.find(w => w._id === item.workflowId)
                  const currentStage = workflow?.stages.find(s => s.id === item.currentStageId)
                  const approvalActions = currentStage?.actions?.filter(a => a.type === "approval") || []
                  
                  return (
                    <div key={item._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{item.itemId}</h3>
                          <p className="text-sm text-gray-600">
                            Stage: {currentStage?.name || "Unknown"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={item.status === "active" ? "default" : "secondary"}>
                            {item.status}
                          </Badge>
                          {approvalActions.length > 0 && (
                            <Badge className="bg-blue-100 text-blue-800">
                              {approvalActions.length} Approval{approvalActions.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {approvalActions.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <p>Required approvals:</p>
                          <ul className="list-disc list-inside ml-2">
                            {approvalActions.map((action, idx) => (
                              <li key={idx}>{action.label}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 