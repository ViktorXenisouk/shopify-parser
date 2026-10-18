export type DeliveryCategory = "pickup" | "home" | "unknown";

export interface NoteAttribute {
  name: string;
  value: string;
}

export interface ShippingLine {
  code: string;
  title: string;
}

export interface ShopifyOrder {
  order_number: string | number;
  shipping_lines: ShippingLine[];
  note_attributes: NoteAttribute[];
}

export interface ClassificationResult {
  orderNumber: string | number;
  category: DeliveryCategory;
  carrier: string | null;
  reviewReason: string | null;
}

export interface OrderSummary {
  sourceFiles: number;
  duplicateOrdersSkipped: number;
  totalOrders: number;
  byCategory: Record<DeliveryCategory, number>;
  pickupByCarrier: Record<string, number>;
  homeByCarrier: Record<string, number>;
  reviewOrders: ClassificationResult[];
}