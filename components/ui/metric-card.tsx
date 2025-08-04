import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  color?: string
  className?: string
}

export function MetricCard({ title, value, subtitle, icon: Icon, color = "#6b7280", className }: MetricCardProps) {
  return (
    <Card className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {Icon && (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl shadow-sm"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-7 w-7" style={{ color }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
