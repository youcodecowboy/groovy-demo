"use client"

import { OnboardingStepConfig } from "../../types"

interface IndustrySelectProps {
  step: OnboardingStepConfig
  value?: string
  onChange: (value: string) => void
}

export function IndustrySelect({ step, value, onChange }: IndustrySelectProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {step.options?.map((option) => (
        <button
          key={option.value}
          onClick={() => !option.comingSoon && onChange(option.value)}
          disabled={option.comingSoon}
          className={`
            relative p-6 rounded-xl border transition-all duration-200 text-left
            ${option.comingSoon 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
              : value === option.value
                ? 'border-black bg-black text-white'
                : 'border-black/10 bg-white hover:border-black hover:shadow-md'
            }
          `}
        >
          {option.comingSoon && (
            <div className="absolute top-3 right-3">
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          )}
          
          <div className="flex items-start gap-4">
            <div className="text-2xl">{option.icon}</div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg mb-1 ${
                option.comingSoon ? 'text-gray-500' : ''
              }`}>
                {option.label}
              </h3>
              <p className={`text-sm ${
                option.comingSoon ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {option.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
