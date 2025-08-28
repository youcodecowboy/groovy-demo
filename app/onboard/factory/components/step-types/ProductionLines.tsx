"use client"

import { OnboardingStepConfig } from "../../types"

interface ProductionLinesProps {
  step: OnboardingStepConfig
  value?: string
  onChange: (value: string) => void
}

export function ProductionLines({ step, value, onChange }: ProductionLinesProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {step.options?.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              p-6 rounded-xl border transition-all duration-200 text-center
              ${value === option.value
                ? 'border-black bg-black text-white'
                : 'border-black/10 bg-white hover:border-black hover:shadow-md'
              }
            `}
          >
            <div className="text-3xl mb-3">🏭</div>
            <h3 className={`font-semibold text-lg mb-1 ${
              value === option.value ? 'text-white' : 'text-gray-900'
            }`}>
              {option.label}
            </h3>
            {value === option.value && (
              <div className="mt-2 text-2xl">✓</div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-6 bg-purple-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center gap-3 text-purple-800">
          <span className="text-lg">🏗️</span>
          <div>
            <p className="font-medium">Floor Layout</p>
            <p className="text-sm italic">
              This helps us set up your factory floor layout and capacity planning.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
