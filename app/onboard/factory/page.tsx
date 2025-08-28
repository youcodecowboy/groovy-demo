"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingStep } from "./components/OnboardingStep"
import { OnboardingProgress } from "./components/OnboardingProgress"
import { OnboardingLayout } from "./components/OnboardingLayout"
import { onboardingSteps } from "./data/onboardingSteps"
import { OnboardingData } from "./types"

export default function FactoryOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    industry: "",
    garmentType: "",
    location: "",
    address: "",
    coordinates: null,
    language: "en",
    capacity: "",
    designManagement: false,
    subcontractors: false,
    inventorySystem: "",
    integrations: [],
    manufacturingStages: ["planning", "cutting", "sewing", "washing", "qc", "finishing", "packing", "shipping"],
    teams: [],
    employeeCount: "",
    productionLines: "",
  })

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    // TODO: Save onboarding data and configure application
    console.log("Onboarding completed:", onboardingData)
    router.push("/app")
  }

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }))
  }

  const currentStepData = onboardingSteps[currentStep]

  return (
    <OnboardingLayout>
      <div className="flex flex-col h-full">
        <OnboardingProgress 
          currentStep={currentStep} 
          totalSteps={onboardingSteps.length} 
        />
        
        <div className="flex-1 flex items-center justify-center">
          <OnboardingStep
            step={currentStepData}
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={currentStep === 0}
            isLast={currentStep === onboardingSteps.length - 1}
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}
