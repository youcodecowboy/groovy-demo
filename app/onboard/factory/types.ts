export interface OnboardingData {
  industry: string
  garmentType: string
  location: string
  address: string
  coordinates: { lat: number; lng: number } | null
  language: string
  capacity: string
  designManagement: boolean
  subcontractors: boolean
  inventorySystem: string
  integrations: string[]
  manufacturingStages: string[]
  teams: string[]
  employeeCount: string
  productionLines: string
}

export interface OnboardingStepConfig {
  id: string
  title: string
  subtitle: string
  type: 'industry-select' | 'text-input' | 'location-input' | 'language-select' | 'capacity-input' | 'boolean-choice' | 'inventory-system' | 'integrations' | 'manufacturing-stages' | 'teams' | 'employee-count' | 'production-lines'
  required?: boolean
  options?: Array<{
    value: string
    label: string
    description?: string
    icon?: string
    comingSoon?: boolean
  }>
  placeholder?: string
  validation?: (value: any) => boolean
  field?: keyof OnboardingData
}

export interface OnboardingStepProps {
  step: OnboardingStepConfig
  data: OnboardingData
  onUpdate: (updates: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}
