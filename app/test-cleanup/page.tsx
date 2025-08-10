"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function TestCleanupPage() {
  const cleanup = useMutation(api.tenancy.cleanupDefaultOrgs)
  const deleteCurrent = useMutation(api.tenancy.deleteCurrentUserOrg)
  const debugInfo = useQuery(api.tenancy.debugUserOrg)
  const [result, setResult] = useState<string>("")

  const handleCleanup = async () => {
    try {
      const res = await cleanup()
      setResult(`Cleaned up ${res.deleted} default organizations`)
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  const handleDeleteCurrent = async () => {
    try {
      const res = await deleteCurrent()
      if (res.success) {
        setResult(`Deleted your organization: ${res.deletedOrg}`)
      } else {
        setResult(`Error: ${res.error}`)
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Test Cleanup</h1>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Current User Organization:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
      
      <div className="space-y-2">
        <Button onClick={handleCleanup}>Cleanup Default Organizations</Button>
        <Button onClick={handleDeleteCurrent} variant="destructive">Delete My Organization</Button>
      </div>
      {result && <p className="text-sm">{result}</p>}
    </div>
  )
}
