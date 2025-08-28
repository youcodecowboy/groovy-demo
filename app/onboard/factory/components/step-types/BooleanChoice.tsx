"use client"

import { OnboardingStepConfig } from "../../types"

interface BooleanChoiceProps {
  step: OnboardingStepConfig
  value?: boolean
  onChange: (value: boolean) => void
}

export function BooleanChoice({ step, value, onChange }: BooleanChoiceProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-6">
        {/* Yes Option */}
        <button
          onClick={() => onChange(true)}
          className={`
            p-8 rounded-xl border transition-all duration-200 text-center
            ${value === true
              ? 'border-black bg-black text-white'
              : 'border-black/10 bg-white hover:border-black hover:shadow-md'
            }
          `}
        >
          <div className="text-4xl mb-4">✅</div>
          <h3 className={`font-semibold text-xl mb-2 ${
            value === true ? 'text-white' : 'text-gray-900'
          }`}>
            Yes
          </h3>
          <p className={`text-sm ${
            value === true ? 'text-gray-200' : 'text-gray-600'
          }`}>
            Enable this feature
          </p>
        </button>

        {/* No Option */}
        <button
          onClick={() => onChange(false)}
          className={`
            p-8 rounded-xl border transition-all duration-200 text-center
            ${value === false
              ? 'border-black bg-black text-white'
              : 'border-black/10 bg-white hover:border-black hover:shadow-md'
            }
          `}
        >
          <div className="text-4xl mb-4">❌</div>
          <h3 className={`font-semibold text-xl mb-2 ${
            value === false ? 'text-white' : 'text-gray-900'
          }`}>
            No
          </h3>
          <p className={`text-sm ${
            value === false ? 'text-gray-200' : 'text-gray-600'
          }`}>
            Skip for now
          </p>
        </button>
      </div>
    </div>
  )
}
