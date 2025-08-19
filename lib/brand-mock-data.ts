// Brand-specific mock data for development
import { addDays, subDays, format } from 'date-fns'

// Fixed base date to prevent hydration mismatches
const BASE_DATE = new Date('2024-01-20T10:00:00Z')

export interface BrandOrder {
  id: string
  poNumber: string
  factoryName: string
  factoryId: string
  status: 'draft' | 'pending' | 'confirmed' | 'in_production' | 'quality_check' | 'shipped' | 'delivered' | 'cancelled'
  itemsCompleted: number
  totalItems: number
  defectRate: number
  promisedDelivery: Date
  actualDelivery?: Date
  value: number
  currency: string
  createdAt: Date
  updatedAt: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
}

export interface BrandFactory {
  id: string
  name: string
  logo?: string
  location: string
  country: string
  capabilities: string[]
  leadTimeMin: number
  leadTimeMax: number
  activeOrders: number
  onTimePercentage: number
  defectRate: number
  contacts: {
    name: string
    role: string
    email: string
    phone?: string
  }[]
  performance: {
    onTime: number
    defects: number
    throughput: number
    rating: number
  }
}

export interface BrandMessage {
  id: string
  threadId: string
  orderId?: string
  factoryId?: string
  from: string
  to: string[]
  subject: string
  content: string
  attachments?: string[]
  isRead: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
}

export interface BrandThread {
  id: string
  subject: string
  orderId?: string
  factoryId?: string
  participants: string[]
  lastMessage: Date
  unreadCount: number
  hasAttachments: boolean
  tags: string[]
}

export interface BrandSample {
  id: string
  name: string
  orderId?: string
  factoryId: string
  status: 'requested' | 'in_progress' | 'approved' | 'rejected' | 'shipped'
  dueDate: Date
  attachments: string[]
  comments: number
  priority: 'low' | 'medium' | 'high'
}

export interface BrandDesign {
  id: string
  name: string
  version: string
  tags: string[]
  season?: string
  capsule?: string
  attachments: string[]
  linkedOrders: string[]
  createdAt: Date
  updatedAt: Date
}

export interface BrandFabric {
  id: string
  name: string
  composition: string
  supplier: string
  colorways: string[]
  factoriesWithStock: string[]
  linkedOrders: string[]
  pricePerYard: number
  currency: string
}

export interface BrandNotification {
  id: string
  type: 'order.status' | 'message.inbound' | 'shipment.update' | 'invoice.issued' | 'sample.status'
  title: string
  message: string
  orderId?: string
  factoryId?: string
  isRead: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
}

export interface BrandBillingSummary {
  currentPeriod: {
    usage: number
    cost: number
    currency: string
    startDate: Date
    endDate: Date
  }
  previousPeriod: {
    usage: number
    cost: number
  }
  breakdown: {
    category: string
    usage: number
    cost: number
  }[]
  invoices: {
    id: string
    number: string
    amount: number
    currency: string
    status: 'draft' | 'sent' | 'paid' | 'overdue'
    dueDate: Date
    paidDate?: Date
  }[]
}

// Mock data generators
export const mockBrandOrders: BrandOrder[] = [
  {
    id: 'ord-001',
    poNumber: 'PO-2024-001',
    factoryName: 'Apex Manufacturing',
    factoryId: 'fact-001',
    status: 'in_production',
    itemsCompleted: 750,
    totalItems: 1000,
    defectRate: 2.3,
    promisedDelivery: addDays(BASE_DATE, 14),
    value: 45000,
    currency: 'USD',
    createdAt: subDays(BASE_DATE, 21),
    updatedAt: BASE_DATE,
    priority: 'high',
    tags: ['Q1 2024', 'Summer Collection']
  },
  {
    id: 'ord-002',
    poNumber: 'PO-2024-002',
    factoryName: 'Global Textiles Co.',
    factoryId: 'fact-002',
    status: 'quality_check',
    itemsCompleted: 500,
    totalItems: 500,
    defectRate: 1.8,
    promisedDelivery: addDays(BASE_DATE, 7),
    value: 28000,
    currency: 'USD',
    createdAt: subDays(BASE_DATE, 35),
    updatedAt: subDays(BASE_DATE, 1),
    priority: 'medium',
    tags: ['Spring Collection', 'Premium']
  },
  {
    id: 'ord-003',
    poNumber: 'PO-2024-003',
    factoryName: 'Premium Garments Ltd.',
    factoryId: 'fact-003',
    status: 'shipped',
    itemsCompleted: 1200,
    totalItems: 1200,
    defectRate: 0.5,
    promisedDelivery: subDays(BASE_DATE, 3),
    actualDelivery: subDays(BASE_DATE, 2),
    value: 67000,
    currency: 'USD',
    createdAt: subDays(BASE_DATE, 42),
    updatedAt: subDays(BASE_DATE, 2),
    priority: 'high',
    tags: ['Winter Collection', 'Luxury']
  },
  {
    id: 'ord-004',
    poNumber: 'PO-2024-004',
    factoryName: 'Swift Production',
    factoryId: 'fact-004',
    status: 'pending',
    itemsCompleted: 0,
    totalItems: 800,
    defectRate: 0,
    promisedDelivery: addDays(BASE_DATE, 28),
    value: 32000,
    currency: 'USD',
    createdAt: subDays(BASE_DATE, 5),
    updatedAt: subDays(BASE_DATE, 1),
    priority: 'medium',
    tags: ['Q2 2024']
  },
  {
    id: 'ord-005',
    poNumber: 'PO-2024-005',
    factoryName: 'Eco Manufacture',
    factoryId: 'fact-005',
    status: 'delivered',
    itemsCompleted: 600,
    totalItems: 600,
    defectRate: 1.2,
    promisedDelivery: subDays(BASE_DATE, 10),
    actualDelivery: subDays(BASE_DATE, 8),
    value: 41000,
    currency: 'USD',
    createdAt: subDays(BASE_DATE, 56),
    updatedAt: subDays(BASE_DATE, 8),
    priority: 'low',
    tags: ['Sustainable', 'Organic']
  }
]

export const mockBrandFactories: BrandFactory[] = [
  {
    id: 'fact-001',
    name: 'Apex Manufacturing',
    location: 'Ho Chi Minh City, Vietnam',
    country: 'Vietnam',
    capabilities: ['Cut & Sew', 'Embroidery', 'Screen Printing', 'Quality Control'],
    leadTimeMin: 14,
    leadTimeMax: 21,
    activeOrders: 3,
    onTimePercentage: 92,
    defectRate: 2.1,
    contacts: [
      { name: 'Nguyen Van A', role: 'Production Manager', email: 'nguyen@apexmfg.com', phone: '+84-123-456-789' },
      { name: 'Tran Thi B', role: 'Quality Manager', email: 'tran@apexmfg.com' }
    ],
    performance: {
      onTime: 92,
      defects: 2.1,
      throughput: 85,
      rating: 4.6
    }
  },
  {
    id: 'fact-002',
    name: 'Global Textiles Co.',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    capabilities: ['Knitting', 'Dyeing', 'Cut & Sew', 'Packaging'],
    leadTimeMin: 21,
    leadTimeMax: 35,
    activeOrders: 2,
    onTimePercentage: 88,
    defectRate: 1.8,
    contacts: [
      { name: 'Rahman Ahmed', role: 'General Manager', email: 'rahman@globaltextiles.com' },
      { name: 'Fatima Khan', role: 'Export Manager', email: 'fatima@globaltextiles.com' }
    ],
    performance: {
      onTime: 88,
      defects: 1.8,
      throughput: 92,
      rating: 4.4
    }
  },
  {
    id: 'fact-003',
    name: 'Premium Garments Ltd.',
    location: 'Istanbul, Turkey',
    country: 'Turkey',
    capabilities: ['Luxury Finishing', 'Hand Embellishment', 'Quality Control', 'Custom Packaging'],
    leadTimeMin: 28,
    leadTimeMax: 42,
    activeOrders: 1,
    onTimePercentage: 96,
    defectRate: 0.5,
    contacts: [
      { name: 'Mehmet Ozkan', role: 'Operations Director', email: 'mehmet@premiumgarments.com' },
      { name: 'Ayse Demir', role: 'Quality Director', email: 'ayse@premiumgarments.com' }
    ],
    performance: {
      onTime: 96,
      defects: 0.5,
      throughput: 78,
      rating: 4.8
    }
  },
  {
    id: 'fact-004',
    name: 'Swift Production',
    location: 'Guangzhou, China',
    country: 'China',
    capabilities: ['Fast Fashion', 'Digital Printing', 'Automated Cutting', 'Rush Orders'],
    leadTimeMin: 7,
    leadTimeMax: 14,
    activeOrders: 4,
    onTimePercentage: 85,
    defectRate: 3.2,
    contacts: [
      { name: 'Li Wei', role: 'Plant Manager', email: 'li.wei@swiftproduction.com' },
      { name: 'Zhang Min', role: 'Sales Manager', email: 'zhang.min@swiftproduction.com' }
    ],
    performance: {
      onTime: 85,
      defects: 3.2,
      throughput: 95,
      rating: 4.2
    }
  },
  {
    id: 'fact-005',
    name: 'Eco Manufacture',
    location: 'Lima, Peru',
    country: 'Peru',
    capabilities: ['Organic Cotton', 'Sustainable Practices', 'GOTS Certified', 'Fair Trade'],
    leadTimeMin: 35,
    leadTimeMax: 49,
    activeOrders: 1,
    onTimePercentage: 90,
    defectRate: 1.2,
    contacts: [
      { name: 'Carlos Rodriguez', role: 'Sustainability Manager', email: 'carlos@ecomanufacture.com' },
      { name: 'Maria Santos', role: 'Production Coordinator', email: 'maria@ecomanufacture.com' }
    ],
    performance: {
      onTime: 90,
      defects: 1.2,
      throughput: 72,
      rating: 4.7
    }
  }
]

export const mockBrandThreads: BrandThread[] = [
  {
    id: 'thread-001',
    subject: 'PO-2024-001 Production Update',
    orderId: 'ord-001',
    factoryId: 'fact-001',
    participants: ['brand@company.com', 'nguyen@apexmfg.com'],
    lastMessage: BASE_DATE,
    unreadCount: 2,
    hasAttachments: true,
    tags: ['production', 'urgent']
  },
  {
    id: 'thread-002',
    subject: 'Quality Check Results - PO-2024-002',
    orderId: 'ord-002',
    factoryId: 'fact-002',
    participants: ['brand@company.com', 'rahman@globaltextiles.com'],
    lastMessage: subDays(BASE_DATE, 1),
    unreadCount: 0,
    hasAttachments: true,
    tags: ['quality', 'resolved']
  },
  {
    id: 'thread-003',
    subject: 'New Partnership Inquiry',
    factoryId: 'fact-004',
    participants: ['brand@company.com', 'li.wei@swiftproduction.com'],
    lastMessage: subDays(BASE_DATE, 3),
    unreadCount: 1,
    hasAttachments: false,
    tags: ['partnership', 'new']
  }
]

export const mockBrandSamples: BrandSample[] = [
  {
    id: 'sample-001',
    name: 'Summer Dress Sample',
    orderId: 'ord-001',
    factoryId: 'fact-001',
    status: 'in_progress',
    dueDate: addDays(BASE_DATE, 5),
    attachments: ['tech-pack.pdf', 'reference-image.jpg'],
    comments: 3,
    priority: 'high'
  },
  {
    id: 'sample-002',
    name: 'Organic T-Shirt Sample',
    factoryId: 'fact-005',
    status: 'approved',
    dueDate: subDays(BASE_DATE, 2),
    attachments: ['approved-sample.jpg'],
    comments: 7,
    priority: 'medium'
  },
  {
    id: 'sample-003',
    name: 'Winter Coat Prototype',
    factoryId: 'fact-003',
    status: 'requested',
    dueDate: addDays(BASE_DATE, 14),
    attachments: ['design-spec.pdf', 'material-list.xlsx'],
    comments: 1,
    priority: 'low'
  }
]

export const mockBrandDesigns: BrandDesign[] = [
  {
    id: 'design-001',
    name: 'Summer Floral Dress',
    version: 'v2.1',
    tags: ['dress', 'floral', 'summer'],
    season: 'Summer 2024',
    capsule: 'Garden Party',
    attachments: ['tech-pack.pdf', 'pattern.dxf', 'colorways.ai'],
    linkedOrders: ['ord-001'],
    createdAt: subDays(BASE_DATE, 45),
    updatedAt: subDays(BASE_DATE, 12)
  },
  {
    id: 'design-002',
    name: 'Organic Cotton Tee',
    version: 'v1.3',
    tags: ['t-shirt', 'organic', 'basic'],
    season: 'Spring 2024',
    capsule: 'Essentials',
    attachments: ['tech-pack.pdf', 'fit-guide.pdf'],
    linkedOrders: ['ord-005'],
    createdAt: subDays(BASE_DATE, 60),
    updatedAt: subDays(BASE_DATE, 20)
  }
]

export const mockBrandFabrics: BrandFabric[] = [
  {
    id: 'fabric-001',
    name: 'Organic Cotton Jersey',
    composition: '100% Organic Cotton',
    supplier: 'EcoTextiles Inc.',
    colorways: ['Natural White', 'Charcoal', 'Navy', 'Sage Green'],
    factoriesWithStock: ['fact-005', 'fact-003'],
    linkedOrders: ['ord-005'],
    pricePerYard: 8.50,
    currency: 'USD'
  },
  {
    id: 'fabric-002',
    name: 'Premium Silk Crepe',
    composition: '100% Mulberry Silk',
    supplier: 'Luxury Fabrics Ltd.',
    colorways: ['Ivory', 'Blush', 'Midnight Blue', 'Emerald'],
    factoriesWithStock: ['fact-003'],
    linkedOrders: ['ord-003'],
    pricePerYard: 28.00,
    currency: 'USD'
  }
]

export const mockBrandNotifications: BrandNotification[] = [
  {
    id: 'notif-001',
    type: 'order.status',
    title: 'Order Status Update',
    message: 'PO-2024-001 has moved to Quality Check stage',
    orderId: 'ord-001',
    factoryId: 'fact-001',
    isRead: false,
    createdAt: BASE_DATE,
    priority: 'medium'
  },
  {
    id: 'notif-002',
    type: 'message.inbound',
    title: 'New Message',
    message: 'Apex Manufacturing sent you a message about PO-2024-001',
    orderId: 'ord-001',
    factoryId: 'fact-001',
    isRead: false,
    createdAt: subDays(BASE_DATE, 2),
    priority: 'high'
  },
  {
    id: 'notif-003',
    type: 'sample.status',
    title: 'Sample Approved',
    message: 'Summer Dress Sample has been approved',
    isRead: true,
    createdAt: subDays(BASE_DATE, 1),
    priority: 'low'
  }
]

export const mockBrandBilling: BrandBillingSummary = {
  currentPeriod: {
    usage: 1250,
    cost: 3750,
    currency: 'USD',
    startDate: new Date(2024, 0, 1), // January 1, 2024
    endDate: new Date(2024, 0, 31)   // January 31, 2024
  },
  previousPeriod: {
    usage: 1180,
    cost: 3540
  },
  breakdown: [
    { category: 'Order Management', usage: 450, cost: 1350 },
    { category: 'Factory Communication', usage: 320, cost: 960 },
    { category: 'Quality Tracking', usage: 280, cost: 840 },
    { category: 'Logistics Coordination', usage: 200, cost: 600 }
  ],
  invoices: [
    {
      id: 'inv-001',
      number: 'INV-2024-001',
      amount: 3540,
      currency: 'USD',
      status: 'paid',
      dueDate: subDays(BASE_DATE, 15),
      paidDate: subDays(BASE_DATE, 10)
    },
    {
      id: 'inv-002',
      number: 'INV-2024-002',
      amount: 3750,
      currency: 'USD',
      status: 'sent',
      dueDate: addDays(BASE_DATE, 15)
    }
  ]
}
