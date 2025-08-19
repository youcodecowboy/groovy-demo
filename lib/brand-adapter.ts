// Brand data adapter - mirrors shapes that will be used with Convex later
import {
  mockBrandOrders,
  mockBrandFactories,
  mockBrandThreads,
  mockBrandSamples,
  mockBrandDesigns,
  mockBrandFabrics,
  mockBrandNotifications,
  mockBrandBilling,
  type BrandOrder,
  type BrandFactory,
  type BrandThread,
  type BrandSample,
  type BrandDesign,
  type BrandFabric,
  type BrandNotification,
  type BrandBillingSummary
} from './brand-mock-data'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class BrandAdapter {
  // Orders
  async getOrders(filters?: {
    status?: string
    factoryId?: string
    search?: string
    dateRange?: { start: Date; end: Date }
  }): Promise<BrandOrder[]> {
    await delay(300)
    let orders = [...mockBrandOrders]

    if (filters?.status) {
      orders = orders.filter(order => order.status === filters.status)
    }

    if (filters?.factoryId) {
      orders = orders.filter(order => order.factoryId === filters.factoryId)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      orders = orders.filter(order => 
        order.poNumber.toLowerCase().includes(search) ||
        order.factoryName.toLowerCase().includes(search)
      )
    }

    if (filters?.dateRange) {
      orders = orders.filter(order => 
        order.createdAt >= filters.dateRange!.start &&
        order.createdAt <= filters.dateRange!.end
      )
    }

    return orders.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async getOrder(id: string): Promise<BrandOrder | null> {
    await delay(200)
    return mockBrandOrders.find(order => order.id === id) || null
  }

  // Factories
  async getFactories(): Promise<BrandFactory[]> {
    await delay(250)
    return [...mockBrandFactories].sort((a, b) => b.performance.rating - a.performance.rating)
  }

  async getFactory(id: string): Promise<BrandFactory | null> {
    await delay(200)
    return mockBrandFactories.find(factory => factory.id === id) || null
  }

  // Messaging
  async getThreads(filters?: {
    unreadOnly?: boolean
    hasAttachments?: boolean
    factoryId?: string
  }): Promise<BrandThread[]> {
    await delay(300)
    let threads = [...mockBrandThreads]

    if (filters?.unreadOnly) {
      threads = threads.filter(thread => thread.unreadCount > 0)
    }

    if (filters?.hasAttachments) {
      threads = threads.filter(thread => thread.hasAttachments)
    }

    if (filters?.factoryId) {
      threads = threads.filter(thread => thread.factoryId === filters.factoryId)
    }

    return threads.sort((a, b) => b.lastMessage.getTime() - a.lastMessage.getTime())
  }

  async getThread(id: string): Promise<BrandThread | null> {
    await delay(200)
    return mockBrandThreads.find(thread => thread.id === id) || null
  }

  // Samples
  async getSamples(status?: string): Promise<BrandSample[]> {
    await delay(250)
    let samples = [...mockBrandSamples]

    if (status) {
      samples = samples.filter(sample => sample.status === status)
    }

    return samples.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  }

  async getSample(id: string): Promise<BrandSample | null> {
    await delay(200)
    return mockBrandSamples.find(sample => sample.id === id) || null
  }

  // Designs
  async getDesigns(filters?: {
    season?: string
    capsule?: string
    tags?: string[]
  }): Promise<BrandDesign[]> {
    await delay(300)
    let designs = [...mockBrandDesigns]

    if (filters?.season) {
      designs = designs.filter(design => design.season === filters.season)
    }

    if (filters?.capsule) {
      designs = designs.filter(design => design.capsule === filters.capsule)
    }

    if (filters?.tags && filters.tags.length > 0) {
      designs = designs.filter(design => 
        filters.tags!.some(tag => design.tags.includes(tag))
      )
    }

    return designs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async getDesign(id: string): Promise<BrandDesign | null> {
    await delay(200)
    return mockBrandDesigns.find(design => design.id === id) || null
  }

  // Fabrics
  async getFabrics(filters?: {
    supplier?: string
    factoryId?: string
    composition?: string
  }): Promise<BrandFabric[]> {
    await delay(300)
    let fabrics = [...mockBrandFabrics]

    if (filters?.supplier) {
      fabrics = fabrics.filter(fabric => fabric.supplier === filters.supplier)
    }

    if (filters?.factoryId) {
      fabrics = fabrics.filter(fabric => 
        fabric.factoriesWithStock.includes(filters.factoryId!)
      )
    }

    if (filters?.composition) {
      fabrics = fabrics.filter(fabric => 
        fabric.composition.toLowerCase().includes(filters.composition!.toLowerCase())
      )
    }

    return fabrics.sort((a, b) => a.name.localeCompare(b.name))
  }

  async getFabric(id: string): Promise<BrandFabric | null> {
    await delay(200)
    return mockBrandFabrics.find(fabric => fabric.id === id) || null
  }

  // Notifications
  async getNotifications(unreadOnly?: boolean): Promise<BrandNotification[]> {
    await delay(200)
    let notifications = [...mockBrandNotifications]

    if (unreadOnly) {
      notifications = notifications.filter(notif => !notif.isRead)
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await delay(100)
    const notification = mockBrandNotifications.find(notif => notif.id === id)
    if (notification) {
      notification.isRead = true
    }
  }

  // Billing
  async getBillingSummary(): Promise<BrandBillingSummary> {
    await delay(300)
    return mockBrandBilling
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    activeOrders: number
    onTimePercentage: number
    avgDefectRate: number
    monthlySpend: number
    unreadMessages: number
    pendingSamples: number
  }> {
    await delay(400)
    
    const activeOrders = mockBrandOrders.filter(order => 
      ['confirmed', 'in_production', 'quality_check'].includes(order.status)
    ).length

    const completedOrders = mockBrandOrders.filter(order => 
      order.status === 'delivered' && order.actualDelivery
    )
    
    const onTimeOrders = completedOrders.filter(order => 
      order.actualDelivery! <= order.promisedDelivery
    )
    
    const onTimePercentage = completedOrders.length > 0 
      ? (onTimeOrders.length / completedOrders.length) * 100 
      : 0

    const avgDefectRate = mockBrandOrders.reduce((sum, order) => sum + order.defectRate, 0) / mockBrandOrders.length

    const unreadMessages = mockBrandThreads.reduce((sum, thread) => sum + thread.unreadCount, 0)

    const pendingSamples = mockBrandSamples.filter(sample => 
      ['requested', 'in_progress'].includes(sample.status)
    ).length

    return {
      activeOrders,
      onTimePercentage: Math.round(onTimePercentage * 10) / 10,
      avgDefectRate: Math.round(avgDefectRate * 10) / 10,
      monthlySpend: mockBrandBilling.currentPeriod.cost,
      unreadMessages,
      pendingSamples
    }
  }
}

// Singleton instance
export const brandAdapter = new BrandAdapter()