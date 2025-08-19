"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Page() {
  const router = useRouter()
  
  const handleSignIn = () => {
    // Redirect to sign-up page to choose interface
    router.push("/sign-up")
  }
  
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-gray-600 mt-2">Development mode - no authentication required</p>
        </div>
        <Button onClick={handleSignIn} className="w-full">
          Continue to Interface Selection
        </Button>
      </div>
    </div>
  )
}


