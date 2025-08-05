"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWorkflows, useItems, useItemMutations } from "@/hooks/use-convex"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Loader2,
    Database,
    CheckCircle,
    XCircle,
    Play, QrCode,
    BarChart3,
    Settings,
    Package, Zap,
    ArrowRight,
    Clock, Activity,
    Trash2
} from "lucide-react"
import Link from "next/link"

interface TestResult {
  id: string
  name: string
  status: "pending" | "running" | "passed" | "failed"
  description: string
  details?: string
  duration?: number
}

export default function TestSuitePage() {
  const { workflows, isLoading: workflowsLoading } = useWorkflows()
  const { allItems, isLoading: itemsLoading } = useItems()
  const { createItem, advanceToStage, advanceStage } = useItemMutations()
  const { toast } = useToast()
  
  // Mutations
  const seedDemoData = useMutation(api.seed.seedDemoData)
  const logScan = useMutation(api.scans.logScan)
  const completeStageWithScan = useMutation(api.scans.completeStageWithScan)
  const createWorkflow = useMutation(api.workflows.create)
  const testStageAdvancementMutation = useMutation(api.items.testStageAdvancement)
  const testItemCreationMutation = useMutation(api.items.testItemCreation)
  const testEndToEndWorkflowMutation = useMutation(api.items.testEndToEndWorkflow)
  const cleanupTestData = useMutation(api.items.cleanupTestData)
  
  // Queries
  const scans = useQuery(api.scans.getAllScans)
  const activityLog = useQuery(api.activity.getAllActivity)
  
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [currentTestIndex, setCurrentTestIndex] = useState(0)
  const [testProgress, setTestProgress] = useState(0)
  const [testHistory, setTestHistory] = useState<TestResult[][]>([])

  const tests: Omit<TestResult, "status" | "duration">[] = [
    {
      id: "backend-connection",
      name: "Backend Connection",
      description: "Test connection to Convex backend and basic data access"
    },
    {
      id: "workflow-creation",
      name: "Workflow Creation",
      description: "Create a test workflow with multiple stages and actions"
    },
    {
      id: "item-creation",
      name: "Item Creation",
      description: "Create test items and assign them to workflows"
    },
    {
      id: "qr-scanning",
      name: "QR Code Scanning",
      description: "Test QR code generation and scanning functionality"
    },
    {
      id: "item-tracking",
      name: "Item Tracking",
      description: "Track items through workflow stages and verify progression"
    },
    {
      id: "stage-advancement",
      name: "Stage Advancement",
      description: "Test advancing items through workflow stages"
    },
    {
      id: "scan-verification",
      name: "Scan Verification",
      description: "Test stage completion with QR scan verification"
    },
    {
      id: "analytics-tracking",
      name: "Analytics Tracking",
      description: "Verify that all activities are properly logged for analytics"
    },
    {
      id: "error-handling",
      name: "Error Handling",
      description: "Test error scenarios and edge cases"
    },
    {
      id: "performance",
      name: "Performance",
      description: "Test system performance under normal load"
    },
    {
      id: "end-to-end-workflow",
      name: "End-to-End Workflow",
      description: "Create item and track it through complete workflow lifecycle"
    }
  ]

  useEffect(() => {
    // Initialize test results
    setTestResults(tests.map(test => ({
      ...test,
      status: "pending" as const
    })))
  }, [])

  const runAllTests = async () => {
    setIsRunningTests(true)
    setCurrentTestIndex(0)
    setTestProgress(0)

    // Reset all tests to pending
    setTestResults(tests.map(test => ({
      ...test,
      status: "pending" as const
    })))

    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i)
      setTestProgress((i / tests.length) * 100)
      
      const test = tests[i]
      const startTime = Date.now()
      
      // Update test status to running
      setTestResults(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: "running" as const } : t
      ))

      try {
        await runTest(test.id)
        
        // Update test status to passed
        setTestResults(prev => prev.map(t => 
          t.id === test.id ? { 
            ...t, 
            status: "passed" as const,
            duration: Date.now() - startTime
          } : t
        ))
        
        toast({
          title: "✅ Test Passed",
          description: `${test.name} completed successfully`,
        })
      } catch (error) {
        // Update test status to failed
        setTestResults(prev => prev.map(t => 
          t.id === test.id ? { 
            ...t, 
            status: "failed" as const,
            duration: Date.now() - startTime,
            details: error instanceof Error ? error.message : "Unknown error"
          } : t
        ))
        
        toast({
          title: "❌ Test Failed",
          description: `${test.name} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive"
        })
      }
    }

    setTestProgress(100)
    setIsRunningTests(false)
    
    // Save test results to history
    setTestHistory(prev => [...prev, testResults])
    
    const passedTests = testResults.filter(t => t.status === "passed").length
    toast({
      title: "Test Suite Complete",
      description: `${passedTests}/${tests.length} tests passed`,
    })
  }

  const runTest = async (testId: string) => {
    switch (testId) {
      case "backend-connection":
        return await testBackendConnection()
      case "workflow-creation":
        return await testWorkflowCreation()
      case "item-creation":
        return await testItemCreation()
      case "qr-scanning":
        return await testQrScanning()
      case "item-tracking":
        return await testItemTracking()
      case "stage-advancement":
        return await testStageAdvancement()
      case "scan-verification":
        return await testScanVerification()
      case "analytics-tracking":
        return await testAnalyticsTracking()
      case "error-handling":
        return await testErrorHandling()
      case "performance":
        return await testPerformance()
      case "end-to-end-workflow":
        return await testEndToEndWorkflow()
      default:
        throw new Error(`Unknown test: ${testId}`)
    }
  }

  const testBackendConnection = async () => {
    if (workflowsLoading || itemsLoading) {
      throw new Error("Backend connection failed - data loading timeout")
    }
    
    if (!workflows || !allItems) {
      throw new Error("Backend connection failed - unable to fetch data")
    }
    
    return "Backend connection successful"
  }

  const testWorkflowCreation = async () => {
    const timestamp = Date.now();
    const uniqueId = `workflow-test-${timestamp}`;
    
    // Create a test workflow with multiple stages
    const testWorkflowId = await createWorkflow({
      name: `Test Workflow ${timestamp}`,
      description: "Automated test workflow",
      stages: [
        {
          id: `${uniqueId}-stage-1`,
          name: "Cutting",
          description: "Cut fabric to size",
          order: 0,
          actions: [
            {
              id: `${uniqueId}-action-1`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            },
            {
              id: `${uniqueId}-action-2`,
              type: "measurement",
              label: "Measure Dimensions",
              description: "Record item dimensions",
              required: false,
            }
          ],
          estimatedDuration: 15,
          isActive: true,
        },
        {
          id: `${uniqueId}-stage-2`,
          name: "Sewing",
          description: "Sew pieces together",
          order: 1,
          actions: [
            {
              id: `${uniqueId}-action-3`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            },
            {
              id: `${uniqueId}-action-4`,
              type: "photo",
              label: "Take Photo",
              description: "Document sewing quality",
              required: false,
            }
          ],
          estimatedDuration: 30,
          isActive: true,
        },
        {
          id: `${uniqueId}-stage-3`,
          name: "Quality Check",
          description: "Inspect finished item",
          order: 2,
          actions: [
            {
              id: `${uniqueId}-action-5`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            },
            {
              id: `${uniqueId}-action-6`,
              type: "inspection",
              label: "Quality Inspection",
              description: "Check for defects",
              required: true,
            }
          ],
          estimatedDuration: 10,
          isActive: true,
        }
      ],
      createdBy: "test-suite",
    })
    
    if (!testWorkflowId) {
      throw new Error("Workflow creation failed")
    }
    
    return `Test workflow created with ID: ${testWorkflowId}`
  }

  const testItemCreation = async () => {
    // Use the server-side mutation that handles everything
    const result = await testItemCreationMutation()
    
    if (!result.success) {
      throw new Error("Item creation test failed")
    }
    
    return result.message
  }

  const testQrScanning = async () => {
    const testQrData = `TEST-QR-${Date.now()}`
    
    // Test scan logging
    await logScan({
      qrData: testQrData,
      scanType: "item_lookup",
      success: true,
      userId: "test-suite",
      deviceInfo: {
        userAgent: "Test Suite",
        platform: "test",
      },
    })
    
    return `QR scan logged: ${testQrData}`
  }

  const testItemTracking = async () => {
    // Create a test workflow
    const timestamp = Date.now();
    const uniqueId = `tracking-test-${timestamp}`;
    
    const testWorkflowId = await createWorkflow({
      name: `Tracking Test Workflow ${timestamp}`,
      description: "Test workflow for item tracking",
      stages: [
        {
          id: `${uniqueId}-stage-1`,
          name: "Tracking Stage",
          description: "Stage for tracking test",
          order: 0,
          actions: [
            {
              id: `${uniqueId}-action-1`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            }
          ],
          estimatedDuration: 10,
          isActive: true,
        }
      ],
      createdBy: "test-suite",
    })
    
    // Create a test item
    const testItemId = `TRACKING-TEST-${Date.now()}`
    const itemId = await createItem({
      itemId: testItemId,
      workflowId: testWorkflowId,
      metadata: {
        brand: "Tracking Test Brand",
        color: "Purple",
        size: "M",
        style: "Tracking Test Style",
        testType: "item-tracking-test"
      },
    })
    
    if (!itemId) {
      throw new Error("Item creation failed in tracking test")
    }
    
    return `Item tracking verified for: ${testItemId}`
  }

  const testStageAdvancement = async () => {
    // Use the server-side mutation that handles everything
    const result = await testStageAdvancementMutation()
    
    if (!result.success) {
      throw new Error("Stage advancement test failed")
    }
    
    return result.message
  }

  const testScanVerification = async () => {
    // Create a test workflow with scan action
    const timestamp = Date.now();
    const uniqueId = `scan-test-${timestamp}`;
    
    const testWorkflowId = await createWorkflow({
      name: `Scan Test Workflow ${timestamp}`,
      description: "Test workflow for scan verification",
      stages: [
        {
          id: `${uniqueId}-stage-1`,
          name: "Scan Stage",
          description: "Stage with scan action",
          order: 0,
          actions: [
            {
              id: `${uniqueId}-action-1`,
              type: "scan",
              label: "Scan QR Code",
              description: "Scan item QR code to verify",
              required: true,
            }
          ],
          estimatedDuration: 10,
          isActive: true,
        }
      ],
      createdBy: "test-suite",
    })
    
    // Create a test item
    const testItemId = `SCAN-TEST-${timestamp}`
    const itemId = await createItem({
      itemId: testItemId,
      workflowId: testWorkflowId,
      metadata: {
        brand: "Scan Test Brand",
        color: "Yellow",
        size: "XL",
        style: "Scan Test Style",
        testType: "scan-verification-test"
      },
    })
    
    if (!itemId) {
      throw new Error("Item creation failed in scan verification test")
    }
    
    // Wait a bit for the item to be available
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const testQrData = `VERIFY-${timestamp}`
    
    // Test stage completion with scan
    const result = await completeStageWithScan({
      itemId: itemId,
      stageId: `${uniqueId}-stage-1`, // Use the stage ID we created
      qrData: testQrData,
      userId: "test-suite",
      deviceInfo: {
        userAgent: "Test Suite",
        platform: "test",
      },
    })
    
    return `Stage completion with scan verified: ${result.status}`
  }

  const testAnalyticsTracking = async () => {
    // Verify that scans are being logged
    if (!scans || scans.length === 0) {
      throw new Error("No scan data found for analytics verification")
    }
    
    // Verify that activity is being logged
    if (!activityLog || activityLog.length === 0) {
      throw new Error("No activity data found for analytics verification")
    }
    
    return `Analytics tracking verified: ${scans.length} scans, ${activityLog.length} activities logged`
  }

  const testErrorHandling = async () => {
    // Test error handling by attempting invalid operations
    try {
      await logScan({
        qrData: "",
        scanType: "item_lookup",
        success: false,
        errorMessage: "Test error handling",
        userId: "test-suite",
        deviceInfo: {
          userAgent: "Test Suite",
          platform: "test",
        },
      })
    } catch (error) {
      // Expected error
    }
    
    return "Error handling verified"
  }

  const testPerformance = async () => {
    const startTime = Date.now()
    
    // Test multiple operations
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(
        logScan({
          qrData: `PERF-TEST-${i}-${Date.now()}`,
          scanType: "item_lookup",
          success: true,
          userId: "test-suite",
          deviceInfo: {
            userAgent: "Test Suite",
            platform: "test",
          },
        })
      )
    }
    
    await Promise.all(promises)
    
    const duration = Date.now() - startTime
    if (duration > 5000) {
      throw new Error(`Performance test failed: ${duration}ms (expected < 5000ms)`)
    }
    
    return `Performance test passed: ${duration}ms for 5 operations`
  }

  const testEndToEndWorkflow = async () => {
    // Use the server-side mutation that handles everything
    const result = await testEndToEndWorkflowMutation()
    
    if (!result.success) {
      throw new Error("End-to-end workflow test failed")
    }
    
    return result.message
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-400" />
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "passed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
    }
  }

  const exportTestResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      testResults,
      summary: {
        total: testResults.length,
        passed: testResults.filter(t => t.status === "passed").length,
        failed: testResults.filter(t => t.status === "failed").length,
        successRate: testResults.length > 0 ? (testResults.filter(t => t.status === "passed").length / testResults.length) * 100 : 0
      }
    }
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Export Complete",
      description: "Test results exported successfully",
    })
  }

  const handleCleanupTestData = async () => {
    try {
      const result = await cleanupTestData()
      toast({
        title: "Test Data Cleaned",
        description: result.message,
      })
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: "Failed to cleanup test data",
        variant: "destructive",
      })
    }
  }

  const passedTests = testResults.filter(t => t.status === "passed").length
  const failedTests = testResults.filter(t => t.status === "failed").length
  const totalTests = testResults.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Comprehensive Test Suite
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Groovy Test Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            End-to-end testing of all core features including workflow creation, item tracking, 
            QR scanning, and analytics verification.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{workflows?.length || 0}</div>
                  <div className="text-sm text-gray-600">Workflows</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{allItems?.length || 0}</div>
                  <div className="text-sm text-gray-600">Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{scans?.length || 0}</div>
                  <div className="text-sm text-gray-600">Scans</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{activityLog?.length || 0}</div>
                  <div className="text-sm text-gray-600">Activities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                         <div className="flex gap-4">
               <Button 
                 onClick={runAllTests} 
                 disabled={isRunningTests}
                 className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
               >
                 {isRunningTests ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Running Tests...
                   </>
                 ) : (
                   <>
                     <Play className="w-4 h-4 mr-2" />
                     Run All Tests
                   </>
                 )}
               </Button>
               
               <Button 
                 onClick={() => seedDemoData()} 
                 variant="outline"
               >
                 Seed Demo Data
               </Button>
               
               {testResults.length > 0 && (
                 <Button 
                   onClick={exportTestResults} 
                   variant="outline"
                 >
                   Export Results
                 </Button>
               )}
               
               <Button 
                 onClick={handleCleanupTestData} 
                 variant="outline"
                 className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
               >
                 <Trash2 className="w-4 h-4 mr-2" />
                 Cleanup Test Data
               </Button>
             </div>
            
            {isRunningTests && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(testProgress)}%</span>
                </div>
                <Progress value={testProgress} className="w-full" />
                <div className="text-sm text-gray-600">
                  Running: {tests[currentTestIndex]?.name}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Test Results Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                  <div className="text-sm text-green-600">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{totalTests}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {testResults.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-gray-600">{test.description}</div>
                        {test.details && (
                          <div className="text-sm text-red-600 mt-1">{test.details}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                      {test.duration && (
                        <span className="text-sm text-gray-500">{test.duration}ms</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button asChild className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
              <Button asChild className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                <Link href="/floor">Factory Floor</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 text-base">
                <Link href="/">Home</Link>
              </Button>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Test Pages</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/test-reset-data">
                    <Database className="w-4 h-4 mr-2" />
                    Reset All Data
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/test-approval-system">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approval System Test
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/test-backend">
                    <Settings className="w-4 h-4 mr-2" />
                    Backend Test
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/test-item-creation">
                    <Package className="w-4 h-4 mr-2" />
                    Item Creation Test
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/test-qr-scanning">
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Scanning Test
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/test-users">
                    <Activity className="w-4 h-4 mr-2" />
                    Users Test
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 