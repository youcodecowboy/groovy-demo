"use client"

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="px-6 py-4 bg-white border-b border-black/10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% complete
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
