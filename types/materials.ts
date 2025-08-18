export type Unit = 'm' | 'yd' | 'pc' | 'kg' | 'g' | 'roll' | 'cone' | 'box';
export type MaterialCategory = 'fabric' | 'trim' | 'accessory' | 'packaging' | 'other';

export interface UnitConversion {
  from: Unit;
  to: Unit;
  factor: number; // value_in_to = value_in_from * factor
  note?: string;
}

export interface MaterialAttributeTemplate {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'bool';
  options?: string[];
  required?: boolean;
}

export interface Material {
  id: string;
  code: string;              // internal code
  name: string;
  category: MaterialCategory;
  defaultUnit: Unit;
  attributes: Record<string, string | number | boolean | null>; // flexible (e.g., GSM, composition)
  supplierId?: string;
  supplierSku?: string;
  reorderPoint?: number;     // in defaultUnit
  createdAt: number;
  updatedAt: number;
  archived?: boolean;
}

export interface MaterialLot {
  id: string;
  materialId: string;
  lotCode?: string;          // e.g., dye lot/batch
  color?: string;
  widthMm?: number;          // for fabrics
  receivedAt: number;
  expiryAt?: number;
  unitCost: number;          // cost per defaultUnit at receipt
  quantity: number;          // on-hand in defaultUnit
  locationId?: string;
  supplierId?: string;
  poId?: string;             // linked PO
  notes?: string;
}

export interface Location {
  id: string;
  name: string;              // e.g., "WH-A1-BIN03"
  parentId?: string;
  kind?: 'warehouse' | 'room' | 'rack' | 'bin';
}

export type MovementType = 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUST';

export interface MaterialMovement {
  id: string;
  at: number;
  type: MovementType;
  materialId: string;
  lotId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  quantity: number;          // in defaultUnit
  unitCost?: number;         // snapshot; for valuation
  orderId?: string;          // when issuing to production order
  itemId?: string;           // optional: specific item
  reason?: string;           // for ADJUST
  actor?: string;
}

export interface PriceHistory {
  id: string;
  materialId: string;
  at: number;
  unitCost: number;
  currency: string;
  source: 'PO' | 'Manual' | 'Import';
  note?: string;
}

export interface InventorySnapshot {
  materialId: string;
  onHand: number;
  onOrder: number;
  allocated: number;
  available: number;         // onHand - allocated
  value: number;             // sum(lot.quantity * lot.unitCost)
  currency: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  scope: 'material' | 'lot' | 'location';
  widthMm: number;
  heightMm: number;
  fields: Array<{ key: string; x: number; y: number; font: number }>;
}

// Filter and view types for UI
export interface MaterialFilters {
  search?: string;
  category?: MaterialCategory[];
  location?: string[];
  lowStock?: boolean;
  archived?: boolean;
}

export interface MaterialListView {
  type: 'table' | 'cards';
  sortBy: 'name' | 'code' | 'category' | 'onHand' | 'value' | 'lastMovement';
  sortOrder: 'asc' | 'desc';
}

// Form types for dialogs
export interface ReceiveMaterialForm {
  materialId: string;
  quantity: number;
  unitCost: number;
  unit: Unit;
  lotCode?: string;
  color?: string;
  widthMm?: number;
  locationId?: string;
  supplierId?: string;
  poId?: string;
  notes?: string;
}

export interface IssueMaterialForm {
  materialId: string;
  quantity: number;
  unit: Unit;
  lotId?: string; // if not provided, use FIFO
  orderId?: string;
  itemId?: string;
  reason?: string;
}

export interface TransferMaterialForm {
  materialId: string;
  lotId: string;
  quantity: number;
  fromLocationId: string;
  toLocationId: string;
  reason?: string;
}

export interface AdjustMaterialForm {
  materialId: string;
  lotId: string;
  quantity: number; // can be negative
  reason: string;
}

// Settings types
export interface MaterialSettings {
  defaultCurrency: string;
  valuationMethod: 'FIFO' | 'AVERAGE';
  lowStockThreshold: number;
  enableLotTracking: boolean;
  requireReceiptPO: boolean;
}

// Category templates for attributes
export interface CategoryTemplate {
  category: MaterialCategory;
  attributes: MaterialAttributeTemplate[];
}

// Default category templates
export const DEFAULT_CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    category: 'fabric',
    attributes: [
      { key: 'composition', label: 'Composition', type: 'text', required: true },
      { key: 'gsm', label: 'GSM', type: 'number', required: false },
      { key: 'weave', label: 'Weave', type: 'select', options: ['Plain', 'Twill', 'Satin', 'Knit'], required: false },
      { key: 'stretch', label: 'Stretch', type: 'bool', required: false },
      { key: 'washable', label: 'Washable', type: 'bool', required: false }
    ]
  },
  {
    category: 'trim',
    attributes: [
      { key: 'size', label: 'Size', type: 'text', required: true },
      { key: 'material', label: 'Material', type: 'text', required: false },
      { key: 'finish', label: 'Finish', type: 'select', options: ['Matte', 'Glossy', 'Brushed', 'Polished'], required: false },
      { key: 'colorfast', label: 'Colorfast', type: 'bool', required: false }
    ]
  },
  {
    category: 'accessory',
    attributes: [
      { key: 'type', label: 'Type', type: 'select', options: ['Button', 'Zipper', 'Hook', 'Snap', 'Buckle'], required: true },
      { key: 'size', label: 'Size', type: 'text', required: true },
      { key: 'material', label: 'Material', type: 'text', required: false },
      { key: 'color', label: 'Color', type: 'text', required: false }
    ]
  },
  {
    category: 'packaging',
    attributes: [
      { key: 'type', label: 'Type', type: 'select', options: ['Box', 'Bag', 'Envelope', 'Tube', 'Wrap'], required: true },
      { key: 'dimensions', label: 'Dimensions', type: 'text', required: false },
      { key: 'material', label: 'Material', type: 'text', required: false },
      { key: 'recyclable', label: 'Recyclable', type: 'bool', required: false }
    ]
  },
  {
    category: 'other',
    attributes: [
      { key: 'description', label: 'Description', type: 'text', required: true },
      { key: 'notes', label: 'Notes', type: 'text', required: false }
    ]
  }
];

// Unit conversion defaults
export const DEFAULT_UNIT_CONVERSIONS: UnitConversion[] = [
  { from: 'm', to: 'yd', factor: 1.09361, note: 'Meters to yards' },
  { from: 'yd', to: 'm', factor: 0.9144, note: 'Yards to meters' },
  { from: 'kg', to: 'g', factor: 1000, note: 'Kilograms to grams' },
  { from: 'g', to: 'kg', factor: 0.001, note: 'Grams to kilograms' }
];

// Helper functions
export function formatUnit(unit: Unit): string {
  const unitLabels: Record<Unit, string> = {
    'm': 'meters',
    'yd': 'yards',
    'pc': 'pieces',
    'kg': 'kilograms',
    'g': 'grams',
    'roll': 'rolls',
    'cone': 'cones',
    'box': 'boxes'
  };
  return unitLabels[unit] || unit;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function calculateInventoryValue(lots: MaterialLot[]): number {
  return lots.reduce((total, lot) => total + (lot.quantity * lot.unitCost), 0);
}

export function isLowStock(material: Material, onHand: number): boolean {
  return material.reorderPoint ? onHand <= material.reorderPoint : false;
}