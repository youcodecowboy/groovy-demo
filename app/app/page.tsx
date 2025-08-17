"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useState } from "react"
import { useOrg } from "@/lib/useOrg"
import { Button } from "@/components/ui/button"
import { useDashboardLayout } from '@/hooks/use-dashboard-layout'
import { WidgetConfigModal } from "@/components/admin/widget-config-modal"
import { DashboardWidget as DashboardWidgetType } from '@/types/dashboard'
import { useWidgetData } from '@/lib/widget-data-service'
import { DashboardTestData } from "@/components/app/dashboard-test-data"
import { WidgetSidebar } from "@/components/app/widget-sidebar"
import { SortableWidgetGrid } from "@/components/app/sortable-widget-grid"
import Image from "next/image"
import {
    Plus,
    UserPlus,
    Wrench,
    List,
    BarChart3,
    Package,
    Clock,
    CheckSquare,
    ArrowRight,
    Workflow,
    Puzzle,
    Users,
    Database,
    Edit3,
    Check,
    X,
    Settings,
    Save,
    Eye,
} from "lucide-react"

export default function TenantAppPage() {
  // These queries are now resilient to auth/org issues
  const layout = useQuery(api.dashboards.getLayout)
  const setLayout = useMutation(api.dashboards.setLayout)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)
  const [showBuildSection, setShowBuildSection] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configuringWidget, setConfiguringWidget] = useState<DashboardWidgetType | null>(null)
  const [showWidgetSidebar, setShowWidgetSidebar] = useState(false)
  const createOrg = useMutation(api.tenancy.createOrganization)
  const updateOrgName = useMutation(api.tenancy.updateOrganizationName)
  const { org, setOrg, isLoading } = useOrg()
  const [orgName, setOrgName] = useState<string | null>(null)
  const [isEditingOrg, setIsEditingOrg] = useState(false)
  const [editOrgName, setEditOrgName] = useState("")
  
  // Get active workflows for onboarding progress
  const activeWorkflows = useQuery(api.workflows.getActive)
  
  // Get items for test data component
  const items = useQuery(api.items.getAll)

  // Dashboard layout management
  const {
    widgets,
    isLoading: dashboardLoading,
    error: dashboardError,
    saveLayout,
    updateWidget,
    resetToDefault,
    addWidget,
    removeWidget,
  } = useDashboardLayout()

  useEffect(() => {
    if (layout && Array.isArray(layout) && layout.length === 0) {
      void setLayout({ layoutJson: JSON.stringify([]) }).catch((error) => {
        console.warn("Failed to set layout:", error)
        // Don't throw - this is not critical
      })
    }
  }, [layout, setLayout])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("groovy_welcome_seen")
      setShowWelcome(!seen)
    }
  }, [])

  // Set org name from server response
  useEffect(() => {
    if (org?.name) {
      setOrgName(org.name)
    } else {
      setOrgName(null)
    }
  }, [org?.name])

  // Handle edit organization name
  const handleStartEdit = () => {
    setEditOrgName(orgName || "")
    setIsEditingOrg(true)
  }

  const handleSaveEdit = async () => {
    const newName = editOrgName.trim()
    if (!newName || newName === orgName) {
      setIsEditingOrg(false)
      return
    }

    try {
      await updateOrgName({ name: newName })
      setOrgName(newName)
      setOrg({ name: newName, slug: newName.toLowerCase().replace(/\s+/g, "-") })
      setIsEditingOrg(false)
    } catch (error) {
      console.warn("Failed to update organization name:", error)
      setIsEditingOrg(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingOrg(false)
    setEditOrgName("")
  }

  const configureWidget = (widgetType: string) => {
    const existingWidget = widgets.find(w => w.type === widgetType)
    if (existingWidget) {
      setConfiguringWidget(existingWidget)
    } else {
      // Create a new widget if it doesn't exist
      const newWidget: DashboardWidgetType = {
        id: `${widgetType}-${Date.now()}`,
        type: widgetType,
        title: widgetType,
        position: widgets.length,
        size: "md",
        config: {},
        dataSource: undefined
      }
      setConfiguringWidget(newWidget)
    }
    setShowConfigModal(true)
  }

  const saveWidgetConfig = (updatedWidget: DashboardWidgetType) => {
    updateWidget(updatedWidget.id, updatedWidget)
    setShowConfigModal(false)
    setConfiguringWidget(null)
  }

  const saveDashboardLayout = async () => {
    const success = await saveLayout(widgets)
    if (success) {
      setIsEditMode(false)
    }
  }

  const handleAddWidget = (newWidget: DashboardWidgetType) => {
    const widgetWithPosition = { ...newWidget, position: widgets.length }
    addWidget(widgetWithPosition)
  }

  const handleRemoveWidget = (widgetId: string) => {
    removeWidget(widgetId)
  }

  const handleEditWidget = (widget: DashboardWidgetType) => {
    if (widget.type === "custom-widget") {
      setConfiguringWidget(widget)
      setShowConfigModal(true)
    } else {
      // For pre-configured widgets, show a simple edit dialog or just allow removal
      alert("This widget is pre-configured. Remove it and add a new one to change settings.")
    }
  }

  if (layout === undefined || isLoading) {
    return (
      <div className="p-6">
        <div className="inline-block rounded-none border border-black bg-white px-4 py-2">
          Loading your app…
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* First-visit Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
          <div className="w-[92vw] max-w-2xl overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl">
            {/* Branded header with white logo */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#0b0b0b] via-[#15161a] to-black px-6 py-5">
              <Image src="/groovy-logo.png" alt="Groovy" width={260} height={74} className="h-12 w-auto invert brightness-0" />
            </div>
            {/* Card body following standard layout */}
            <div className="p-6">
              <div className="flex items-center gap-3">
                <Wrench className="h-6 w-6" />
                <h3 className="text-2xl font-semibold">Welcome to your Operating System</h3>
              </div>
              <p className="mt-2 text-base text-gray-600 italic">You'll complete five quick steps to get production‑ready. Everything is modular and you can change it anytime.</p>
              <div className="mt-5 border-t border-black/10" />
              <ul className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
                <li className="flex items-center gap-2"><Workflow className="h-5 w-5" /> Build a workflow</li>
                <li className="flex items-center gap-2"><Puzzle className="h-5 w-5" /> Add features</li>
                <li className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Configure Disco</li>
                <li className="flex items-center gap-2"><Users className="h-5 w-5" /> Invite team</li>
                <li className="flex items-center gap-2"><Database className="h-5 w-5" /> Add data</li>
              </ul>
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <a href="/onboard" onClick={() => localStorage.setItem("groovy_welcome_seen", "1")}>
                  <Button className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white">Watch video</Button>
                </a>
                <a href="#onboarding" onClick={() => localStorage.setItem("groovy_welcome_seen", "1") }>
                  <Button className="h-10 rounded-full border border-black bg-black px-5 text-white hover:bg-white hover:text-black">Begin building</Button>
                </a>
              </div>
              <div className="mt-2 text-right text-xs text-gray-500">
                <button
                  className="underline"
                  onClick={() => {
                    localStorage.setItem("groovy_welcome_seen", "1")
                    setShowWelcome(false)
                  }}
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header / Actions */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-6 border-b">
        <div className="space-y-2">
          {isEditingOrg ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
                className="text-3xl font-semibold tracking-tight bg-transparent border-b-2 border-black focus:outline-none focus:border-blue-500"
                placeholder="Enter organization name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveEdit()
                  } else if (e.key === "Escape") {
                    handleCancelEdit()
                  }
                }}
                autoFocus
              />
              <span className="text-3xl font-semibold tracking-tight">OS</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSaveEdit}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Save"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Cancel"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                {orgName ? `${orgName} OS` : "Your Operating System"}
              </h1>
              {orgName && (
                <button
                  onClick={handleStartEdit}
                  className="p-1 hover:bg-gray-100 rounded opacity-60 hover:opacity-100 transition-opacity"
                  title="Edit organization name"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <p className="text-gray-600 italic">A blank canvas. Configure to begin.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white">
            <UserPlus className="mr-2 h-4 w-4" /> Invite
          </Button>
          <Button className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white">
            <Plus className="mr-2 h-4 w-4" /> New Workflow
          </Button>
          {isEditMode ? (
            <>
              <Button 
                onClick={saveDashboardLayout}
                disabled={dashboardLoading}
                className="h-10 rounded-full border border-black bg-black px-5 text-white hover:bg-white hover:text-black"
              >
                <Save className="mr-2 h-4 w-4" />
                {dashboardLoading ? "Saving..." : "Save Layout"}
              </Button>
              <Button 
                onClick={() => setShowWidgetSidebar(true)}
                className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditMode(false)}
                className="h-10 rounded-full"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Mode
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditMode(true)}
              className="h-10 rounded-full border border-black bg-black px-5 text-white hover:bg-white hover:text-black"
            >
              <Settings className="mr-2 h-4 w-4" />
              Customize Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Welcome / Org creation banner */}
      {showWelcomeBanner && (
        <div className="relative overflow-hidden rounded-xl border border-black/10 bg-gradient-to-r from-[#0b0b0b] via-[#15161a] to-black p-8 text-white">
          {/* Dismiss button */}
          <button
            onClick={() => setShowWelcomeBanner(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
            title="Dismiss"
          >
            <X className="h-5 w-5 text-white/80" />
          </button>
          {/* subtle grid/texture overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(120% 120% at 0% 50%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%), linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "auto, 18px 18px, 18px 18px",
            }}
          />
          <div className="relative flex items-center gap-6">
          <div className="relative h-20 w-20 md:h-28 md:w-28 lg:h-36 lg:w-36">
            <Image
              src="/groovy%20mascot.png"
              alt="Groovy mascot"
              fill
              className="object-contain origin-center scale-[1.9]"
              priority
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-semibold leading-tight">
              <span className="relative -top-0.5 italic">Welcome to </span>
              <Image
                src="/groovy-logo.png"
                alt="Groovy"
                width={280}
                height={80}
                className="ml-2 inline h-12 md:h-14 w-auto align-[-8px] invert brightness-0"
                priority
              />
            </h2>
            <p className="mt-2 text-base md:text-lg text-white/80 italic">Groovy is the most powerful, and malleable workflow management tool in the universe — let's set up your operating system.</p>
            {orgName ? (
              <div className="mt-4 flex w-full flex-wrap items-center gap-3">
                <a href="/onboard">
                  <Button className="h-10 rounded-full border border-white bg-white/10 px-5 text-white hover:bg-white hover:text-black">Take the guided tour</Button>
                </a>
                <a href="#onboarding">
                  <Button className="h-10 rounded-full border border-white bg-white px-5 text-black hover:bg-black hover:text-white">Start onboarding</Button>
                </a>
              </div>
            ) : (
              <div className="mt-4 flex w-full max-w-xl items-end gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-white/70">Company name</label>
                  <input
                    type="text"
                    defaultValue={orgName ?? ""}
                    placeholder="e.g., Acme"
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                    onBlur={async (e) => {
                      const value = e.currentTarget.value.trim()
                      if (!value) return
                      
                      const slug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
                      try { 
                        const result = await createOrg({ name: value, slug })
                        if (result) {
                          setOrgName(value)
                          setOrg({ name: value, slug })
                        }
                      } catch (createError) { 
                        console.warn("Failed to create org:", createError)
                      }
                    }}
                  />
                </div>
                <Button className="h-10 rounded-full border border-white bg-white/10 px-5 text-white hover:bg-white hover:text-black" onClick={async () => {
                  const el = document.querySelector<HTMLInputElement>("input[placeholder='e.g., Acme']")
                  const value = el?.value?.trim()
                  if (!value) return
                  
                  const slug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
                  try { 
                    const result = await createOrg({ name: value, slug })
                    if (result) {
                      setOrgName(value)
                      setOrg({ name: value, slug })
                    }
                  } catch (createError) { 
                    console.warn("Failed to create org:", createError)
                  }
                }}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Onboarding / Builder (moved to top) */}
      {showBuildSection && (
        <div id="onboarding" className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <Wrench className="h-6 w-6" />
                <h2 className="text-2xl md:text-3xl font-semibold">Build your operating system</h2>
              </div>
              <p className="mt-1.5 text-base text-gray-600 italic">Follow the microsteps to get set up.</p>
            </div>
            <button
              onClick={() => setShowBuildSection(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Dismiss"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        <div className="mt-5 border-t border-black/10" />
        {/* Progress bar - segmented and linked to steps */}
        <div className="mt-5">
          <div className="rounded-full border border-black/10 bg-gray-100 p-1">
            <div className="flex h-4 w-full gap-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const isComplete = i === 0 && activeWorkflows && activeWorkflows.length > 0
                return (
                  <div key={i} className={`flex-1 rounded-full ${isComplete ? "bg-black" : "bg-gray-300"}`} />
                )
              })}
            </div>
          </div>
          <div className="mt-2 text-right text-sm text-gray-600">
            {activeWorkflows && activeWorkflows.length > 0 ? "1/5 complete" : "0/5 complete"}
          </div>
        </div>

        {/* Microsteps - full width rows with Configure buttons */}
        <div className="mt-5 space-y-3">
          {[
            { label: "Build a workflow", icon: Workflow, minutes: 10, key: "workflow" },
            { label: "Add Features", icon: Puzzle, minutes: 10, key: "features" },
            { label: "Configure Disco", icon: Wrench, minutes: 5, key: "disco" },
            { label: "Invite team", icon: Users, minutes: 3, key: "team" },
            { label: "Add data", icon: Database, minutes: 5, key: "data" },
          ].map((step, index) => {
            const isWorkflowComplete = step.key === "workflow" && activeWorkflows && activeWorkflows.length > 0
            const isComplete = isWorkflowComplete
            
            return (
              <div key={step.label} className={`flex items-center justify-between rounded-lg border border-black/10 p-4 ${isComplete ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
                <div className="flex items-center gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-full border text-[14px] font-medium ${isComplete ? "border-green-300 bg-green-100 text-green-700" : "border-black/10 bg-white"}`}>
                    {isComplete ? <Check className="h-6 w-6" /> : index + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    <step.icon className={`h-6 w-6 ${isComplete ? "text-green-600" : ""}`} />
                    <div>
                      <div className="text-lg md:text-xl font-semibold">{step.label}</div>
                      <div className="text-sm text-gray-600 italic">
                        {isComplete ? (
                          <span className="text-green-600 font-medium">Complete</span>
                        ) : (
                          <>
                            Not configured • <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> ~{step.minutes} mins</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  className={`h-11 rounded-full border px-6 ${
                    isComplete 
                      ? "border-green-300 bg-green-100 text-green-700 hover:bg-green-200" 
                      : "border-black bg-white text-black hover:bg-black hover:text-white"
                  }`}
                  onClick={() => {
                    if (step.key === "workflow") {
                      window.location.href = "/app/workflows"
                    }
                  }}
                >
                  {isComplete ? "View" : "Configure"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button className="h-10 rounded-full border border-black bg-white text-black hover:bg-black hover:text-white">
            <Wrench className="mr-2 h-4 w-4" /> Open Builder
          </Button>
        </div>
      </div>
      )}

      {/* Dashboard Widgets */}
      {widgets.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <div className="max-w-md mx-auto">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No widgets added yet</h3>
            <p className="text-gray-600 mb-4">Add widgets to start building your dashboard</p>
            {isEditMode ? (
              <Button
                onClick={() => setShowWidgetSidebar(true)}
                className="rounded-full border border-black bg-black px-6 text-white hover:bg-white hover:text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Widget
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditMode(true)}
                className="rounded-full border border-black bg-black px-6 text-white hover:bg-white hover:text-black"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize Dashboard
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Instruction banner for first time users */}
          {isEditMode && widgets.length === 1 && (
            <div className="col-span-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Drag widgets to reorder them, or click "Add Widget" to add more. 
                    Each widget shows real data from your system.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <SortableWidgetGrid
            widgets={widgets}
            isEditMode={isEditMode}
            onReorder={async (updatedWidgets) => {
              // Update the widgets in the layout
              const reorderedWidgets = updatedWidgets.map((widget, index) => ({
                ...widget,
                position: index
              }))
              
              // Update local state immediately for responsive UI
              reorderedWidgets.forEach((widget, index) => {
                updateWidget(widget.id, { ...widget, position: index })
              })
              
              // Save to database
              await saveLayout(reorderedWidgets)
            }}
            onRemove={handleRemoveWidget}
            onEdit={handleEditWidget}
          />
        </>
      )}

      {/* Test Data Component - Only show if no data */}
      {(!items || items.length === 0) && (
        <DashboardTestData />
      )}

      {/* Widget Sidebar */}
      <WidgetSidebar
        isOpen={showWidgetSidebar}
        onClose={() => setShowWidgetSidebar(false)}
        onAddWidget={handleAddWidget}
      />

      {/* Widget Configuration Modal - Only for custom widgets */}
      {showConfigModal && configuringWidget && (
        <WidgetConfigModal
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false)
            setConfiguringWidget(null)
          }}
          onSave={saveWidgetConfig}
          widget={configuringWidget}
        />
      )}
    </div>
  )
}



