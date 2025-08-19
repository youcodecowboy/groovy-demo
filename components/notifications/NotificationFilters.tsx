"use client"

import { useState } from "react"
import { Search, Filter, Calendar, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface NotificationFiltersProps {
  filters: {
    search: string
    kinds: string[]
    severity: string
    unreadOnly: boolean
    dateFrom: Date | undefined
    dateTo: Date | undefined
  }
  onFiltersChange: (filters: any) => void
}

const notificationKinds = [
  { value: "item.flagged", label: "Item Flagged" },
  { value: "item.defective", label: "Item Defective" },
  { value: "item.stuck", label: "Item Stuck" },
  { value: "message.inbound", label: "Inbound Message" },
  { value: "order.completed", label: "Order Completed" },
  { value: "order.behind", label: "Order Behind Schedule" },
  { value: "materials.lowstock", label: "Materials Low Stock" },
  { value: "materials.received", label: "Materials Received" },
  { value: "system.alert", label: "System Alert" },
]

const severityOptions = [
  { value: "all", label: "All Severities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export function NotificationFilters({ filters, onFiltersChange }: NotificationFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleKindToggle = (kind: string) => {
    const newKinds = filters.kinds.includes(kind)
      ? filters.kinds.filter(k => k !== kind)
      : [...filters.kinds, kind]
    onFiltersChange({ ...filters, kinds: newKinds })
  }

  const handleSeverityChange = (value: string) => {
    onFiltersChange({ ...filters, severity: value })
  }

  const handleUnreadToggle = (checked: boolean) => {
    onFiltersChange({ ...filters, unreadOnly: checked })
  }

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateFrom: date })
  }

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateTo: date })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      kinds: [],
      severity: "all",
      unreadOnly: false,
      dateFrom: undefined,
      dateTo: undefined,
    })
  }

  const hasActiveFilters = filters.search || 
    filters.kinds.length > 0 || 
    filters.severity || 
    filters.unreadOnly || 
    filters.dateFrom || 
    filters.dateTo

  return (
    <div className="space-y-4">
      {/* Search and main filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notifications..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filters.severity} onValueChange={handleSeverityChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent>
            {severityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="unread-only"
            checked={filters.unreadOnly}
            onCheckedChange={handleUnreadToggle}
          />
          <label htmlFor="unread-only" className="text-sm font-medium">
            Unread only
          </label>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Kind filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Types:</span>
        {notificationKinds.map((kind) => (
          <Badge
            key={kind.value}
            variant={filters.kinds.includes(kind.value) ? "default" : "outline"}
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => handleKindToggle(kind.value)}
          >
            {kind.label}
          </Badge>
        ))}
      </div>

      {/* Date range filters */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Date range:</span>
        
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-48 justify-start text-left font-normal",
                !filters.dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, "PPP") : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateFrom}
              onSelect={handleDateFromChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-gray-500">to</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-48 justify-start text-left font-normal",
                !filters.dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, "PPP") : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateTo}
              onSelect={handleDateToChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: "{filters.search}"
            </Badge>
          )}
          {filters.kinds.map((kind) => (
            <Badge key={kind} variant="secondary" className="text-xs">
              {notificationKinds.find(k => k.value === kind)?.label}
            </Badge>
          ))}
          {filters.severity && (
            <Badge variant="secondary" className="text-xs">
              {severityOptions.find(s => s.value === filters.severity)?.label}
            </Badge>
          )}
          {filters.unreadOnly && (
            <Badge variant="secondary" className="text-xs">
              Unread only
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="text-xs">
              From: {format(filters.dateFrom, "MMM d")}
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="text-xs">
              To: {format(filters.dateTo, "MMM d")}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
