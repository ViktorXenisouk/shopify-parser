import { ClassificationResult, DeliveryCategory, OrderSummary } from "./types";

export function buildSummary(
  results: ClassificationResult[],
  sourceFiles: number,
  duplicateOrdersSkipped: number,
): OrderSummary {
  const byCategory: Record<DeliveryCategory, number> = {
    pickup: 0,
    home: 0,
    unknown: 0,
  };
  const pickupByCarrier: Record<string, number> = {};
  const homeByCarrier: Record<string, number> = {};

  for (const result of results) {
    byCategory[result.category] += 1;

    if (result.category === "pickup") {
      const carrier = result.carrier ?? "Neznámý dopravce";
      pickupByCarrier[carrier] = (pickupByCarrier[carrier] ?? 0) + 1;
    } else if (result.category === "home") {
      const carrier = result.carrier ?? "Neznámý dopravce";
      homeByCarrier[carrier] = (homeByCarrier[carrier] ?? 0) + 1;
    }
  }

  return {
    sourceFiles,
    duplicateOrdersSkipped,
    totalOrders: results.length,
    byCategory,
    pickupByCarrier,
    homeByCarrier,
    reviewOrders: results.filter((result) => result.reviewReason !== null),
  };
}