import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function AppHeader() {
  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Alert className="border-blue-200/50 bg-blue-50/50 w-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode</strong> - Front-end demonstration of the Groovy workflow system
          </AlertDescription>
        </Alert>
        <Image src="/groovy-logo.png" alt="Groovy" width={120} height={36} className="h-9 w-auto" />
      </div>
    </div>
  )
}
