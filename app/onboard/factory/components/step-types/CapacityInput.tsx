"use client"

import { OnboardingStepConfig } from "../../types"

interface CapacityInputProps {
  step: OnboardingStepConfig
  value?: string
  onChange: (value: string) => void
}

export function CapacityInput({ step, value, onChange }: CapacityInputProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {step.options?.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              p-6 rounded-xl border transition-all duration-200 text-left
              ${value === option.value
                ? 'border-black bg-black text-white'
                : 'border-black/10 bg-white hover:border-black hover:shadow-md'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold text-lg mb-1 ${
                  value === option.value ? 'text-white' : 'text-gray-900'
                }`}>
                  {option.label}
                </h3>
                <p className={`text-sm ${
                  value === option.value ? 'text-gray-200' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
              </div>
              {value === option.value && (
                <div className="text-2xl">✓</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
