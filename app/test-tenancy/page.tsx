"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestTenancyPage() {
  const simpleTest = useQuery(api.tenancy.simpleTest)
  const testTenancy = useQuery(api.tenancy.testMockTenancy)
  const ensureOrg = useMutation(api.tenancy.ensureOrgForCurrentUser)
  const getOrg = useQuery(api.tenancy.getOrganization)
  
  const handleTestEnsureOrg = async () => {
    try {
      const result = await ensureOrg()
      console.log("ensureOrg result:", result)
    } catch (error) {
      console.error("ensureOrg error:", error)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Tenancy Test Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Simple Test (No Auth)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(simpleTest, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Mock Tenancy</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testTenancy, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Get Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(getOrg, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test ensureOrgForCurrentUser</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestEnsureOrg}>
            Test ensureOrgForCurrentUser
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 