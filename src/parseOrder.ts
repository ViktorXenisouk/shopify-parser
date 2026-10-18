import { NoteAttribute, ShopifyOrder, ShippingLine } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseOrder(value: unknown): ShopifyOrder | null {
  if (!isRecord(value)) return null;

  const orderNumber = value.order_number;
  const hasValidNumber =
    (typeof orderNumber === "string" && orderNumber.trim() !== "") ||
    (typeof orderNumber === "number" && Number.isFinite(orderNumber));
    
  if (!hasValidNumber) return null;

  const shippingLines: ShippingLine[] = Array.isArray(value.shipping_lines)
    ? value.shipping_lines.filter(isRecord).map((line) => ({
        code: readString(line.code),
        title: readString(line.title),
      }))
    : [];
  const noteAttributes: NoteAttribute[] = Array.isArray(value.note_attributes)
    ? value.note_attributes.filter(isRecord).map((attribute) => ({
        name: readString(attribute.name),
        value: readString(attribute.value),
      }))
    : [];

  return {
    order_number: orderNumber,
    shipping_lines: shippingLines,
    note_attributes: noteAttributes,
  };
}

export {parseOrder}