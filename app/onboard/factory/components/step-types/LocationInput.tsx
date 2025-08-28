"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { OnboardingStepConfig } from "../../types"

interface LocationInputProps {
  step: OnboardingStepConfig
  value?: string
  onChange: (value: string) => void
}

export function LocationInput({ step, value, onChange }: LocationInputProps) {
  const [address, setAddress] = useState(value || "")

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress)
    onChange(newAddress)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Address Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Factory Address
        </label>
        <Input
          type="text"
          placeholder="Enter your factory address..."
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          className="h-14 text-lg border-black/10 focus:border-black rounded-xl px-6"
        />
      </div>

      {/* Map Preview */}
      <div className="rounded-xl border border-black/10 overflow-hidden">
        <div className="h-64 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm">Map preview will appear here</p>
            <p className="text-xs text-gray-400 mt-1">
              Enter your address above to see the location
            </p>
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="text-lg">📍</span>
          <div>
            <p className="font-medium">Location Services</p>
            <p className="text-xs italic">
              We'll use this to set your timezone and local settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
