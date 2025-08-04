"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRScanner } from "@/components/ui/qr-scanner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Home, ScanLine, MessageSquare, Scan, Move } from "lucide-react"

interface FactoryFooterProps {
  onScan: (data: string) => void
  onMove?: () => void
  onMessages?: () => void
  unreadMessages?: number
}

export function FactoryFooter({ onScan, onMove, onMessages, unreadMessages = 0 }: FactoryFooterProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const handleScan = (data: string) => {
    onScan(data)
    setIsScannerOpen(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 border-t shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Home Button */}
          <Link href="/">
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 flex-col gap-1 h-auto py-2">
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>

          {/* Move Button */}
          <Button
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/20 flex-col gap-1 h-auto py-2"
            onClick={onMove}
          >
            <Move className="w-6 h-6" />
            <span className="text-xs">Move</span>
          </Button>

          {/* Scanner Button - Center */}
          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 rounded-full w-16 h-16 shadow-lg">
                <div className="flex flex-col items-center">
                  <ScanLine className="w-8 h-8" />
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  QR Code Scanner
                </DialogTitle>
                <DialogDescription>Point your camera at a QR code to scan and process an item</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                <QRScanner onScan={handleScan} />
              </div>
            </DialogContent>
          </Dialog>

          {/* Messages Button */}
          <Link href="/floor/messaging">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20 flex-col gap-1 h-auto py-2 relative"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs">Messages</span>
              {unreadMessages > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
                >
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
