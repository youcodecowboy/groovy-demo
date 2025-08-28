"use client"

import { Input } from "@/components/ui/input"
import { OnboardingStepConfig } from "../../types"

interface TextInputProps {
  step: OnboardingStepConfig
  value?: string
  onChange: (value: string) => void
}

export function TextInput({ step, value, onChange }: TextInputProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Input
        type="text"
        placeholder={step.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 text-lg border-black/10 focus:border-black rounded-xl px-6"
      />
    </div>
  )
}
