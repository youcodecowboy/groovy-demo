"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { OnboardingStepProps } from "../types"
import { IndustrySelect } from "./step-types/IndustrySelect"
import { TextInput } from "./step-types/TextInput"
import { LocationInput } from "./step-types/LocationInput"
import { LanguageSelect } from "./step-types/LanguageSelect"
import { CapacityInput } from "./step-types/CapacityInput"
import { BooleanChoice } from "./step-types/BooleanChoice"
import { InventorySystem } from "./step-types/InventorySystem"
import { Integrations } from "./step-types/Integrations"
import { ManufacturingStages } from "./step-types/ManufacturingStages"
import { Teams } from "./step-types/Teams"
import { EmployeeCount } from "./step-types/EmployeeCount"
import { ProductionLines } from "./step-types/ProductionLines"

export function OnboardingStep({
  step,
  data,
  onUpdate,
  onNext,
  onBack,
  isFirst,
  isLast,
}: OnboardingStepProps) {
  const currentValue = step.field ? data[step.field] : undefined
  
  const isValid = () => {
    if (step.required && !currentValue) return false
    if (step.required && Array.isArray(currentValue) && currentValue.length === 0) return false
    if (step.required && typeof currentValue === 'string' && currentValue.trim() === '') return false
    if (step.validation) return step.validation(currentValue)
    return true
  }

  const handleValueChange = (value: any) => {
    if (step.field) {
      onUpdate({ [step.field]: value })
    }
  }

  const renderStepContent = () => {
    const commonProps = {
      step,
      value: step.field ? data[step.field] : undefined,
      onChange: handleValueChange,
    }

    switch (step.type) {
      case "industry-select":
        return <IndustrySelect {...commonProps} />
      case "text-input":
        return <TextInput {...commonProps} />
      case "location-input":
        return <LocationInput {...commonProps} />
      case "language-select":
        return <LanguageSelect {...commonProps} />
      case "capacity-input":
        return <CapacityInput {...commonProps} />
      case "boolean-choice":
        return <BooleanChoice {...commonProps} />
      case "inventory-system":
        return <InventorySystem {...commonProps} />
      case "integrations":
        return <Integrations {...commonProps} />
      case "manufacturing-stages":
        return <ManufacturingStages {...commonProps} />
      case "teams":
        return <Teams {...commonProps} />
      case "employee-count":
        return <EmployeeCount {...commonProps} />
      case "production-lines":
        return <ProductionLines {...commonProps} />
      default:
        return <div>Unknown step type</div>
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      <div className="bg-white rounded-xl border border-black/10 shadow-sm p-8">
        {/* Step header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-3">{step.title}</h1>
          <p className="text-gray-600 italic text-lg">{step.subtitle}</p>
        </div>

        {/* Step content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-black/10">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFirst}
            className="h-11 rounded-full border border-black bg-white px-6 text-black hover:bg-black hover:text-white"
          >
            Back
          </Button>

          <Button
            onClick={onNext}
            disabled={!isValid()}
            className="h-11 rounded-full border border-black bg-black px-6 text-white hover:bg-white hover:text-black"
          >
            {isLast ? "Complete Setup" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
