import QRCode from "qrcode";

// Generate a unique item ID
export function generateUniqueItemId(sku: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  return `${sku}-${timestamp}-${randomSuffix}`;
}

// Generate QR code data URL
export async function generateQRCodeDataUrl(itemId: string): Promise<string> {
  try {
    return await QRCode.toDataURL(itemId, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
}

// Format item metadata for display
export function formatItemMetadata(metadata: any): string {
  const parts = [];
  
  if (metadata.brand) parts.push(metadata.brand);
  if (metadata.style) parts.push(metadata.style);
  if (metadata.color) parts.push(metadata.color);
  if (metadata.size) parts.push(metadata.size);
  
  return parts.join(" • ");
}

// Validate item configuration
export function validateItemConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.sku || config.sku.trim() === "") {
    errors.push("SKU is required");
  }
  
  if (!config.quantity || config.quantity < 1) {
    errors.push("Quantity must be at least 1");
  }
  
  if (config.quantity > 1000) {
    errors.push("Quantity cannot exceed 1000");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
} 