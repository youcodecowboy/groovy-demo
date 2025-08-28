"use client"

import { OnboardingStepConfig } from "../../types"

interface IntegrationsProps {
  step: OnboardingStepConfig
  value?: string[]
  onChange: (value: string[]) => void
}

export function Integrations({ step, value = [], onChange }: IntegrationsProps) {
  const handleToggle = (integrationValue: string) => {
    const newValue = value.includes(integrationValue)
      ? value.filter(v => v !== integrationValue)
      : [...value, integrationValue]
    onChange(newValue)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {step.options?.map((option) => (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            className={`
              p-4 rounded-xl border transition-all duration-200 text-center
              ${value.includes(option.value)
                ? 'border-black bg-black text-white'
                : 'border-black/10 bg-white hover:border-black hover:shadow-md'
              }
            `}
          >
            <div className="text-2xl mb-2">{getIntegrationIcon(option.value)}</div>
            <h3 className={`font-semibold text-sm mb-1 ${
              value.includes(option.value) ? 'text-white' : 'text-gray-900'
            }`}>
              {option.label}
            </h3>
            <p className={`text-xs ${
              value.includes(option.value) ? 'text-gray-200' : 'text-gray-600'
            }`}>
              {option.description}
            </p>
            {value.includes(option.value) && (
              <div className="mt-2 text-lg">✓</div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-6 bg-purple-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center gap-3 text-purple-800">
          <span className="text-lg">🔌</span>
          <div>
            <p className="font-medium">Multi-Select</p>
            <p className="text-sm italic">
              Choose all the applications you use. We'll set up integrations for each one.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getIntegrationIcon(integration: string): string {
  const icons: Record<string, string> = {
    shopify: "🛒",
    woocommerce: "📦",
    magento: "🛍️",
    salesforce: "☁️",
    hubspot: "🎯",
    slack: "💬",
    teams: "👥",
    zoom: "📹",
  }
  return icons[integration] || "🔗"
}
