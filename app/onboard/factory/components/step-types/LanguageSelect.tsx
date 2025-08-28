"use client"

import { OnboardingStepConfig } from "../../types"

interface LanguageSelectProps {
  step: OnboardingStepConfig
  value?: string
  onChange: (value: string) => void
}

export function LanguageSelect({ step, value, onChange }: LanguageSelectProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {step.options?.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              p-4 rounded-xl border transition-all duration-200 text-center
              ${value === option.value
                ? 'border-black bg-black text-white'
                : 'border-black/10 bg-white hover:border-black hover:shadow-md'
              }
            `}
          >
            <div className="font-semibold text-lg">{option.label}</div>
          </button>
        ))}
      </div>
      
      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-3 text-blue-800">
          <span className="text-lg">📱</span>
          <div>
            <p className="font-medium">Disco Floor App</p>
            <p className="text-sm italic">
              This language will be used for your factory floor operators
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
