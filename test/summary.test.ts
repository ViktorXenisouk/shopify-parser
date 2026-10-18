import assert from "node:assert/strict";
import test from "node:test";
import { buildSummary } from "../src/summary";
import { ClassificationResult } from "../src/types";

test("vypočítá kategorie, dopravce i objednávky ke kontrole", () => {
  const results: ClassificationResult[] = [
    { orderNumber: 1, category: "pickup", carrier: "PPL", reviewReason: null },
    {
      orderNumber: 2,
      category: "pickup",
      carrier: null,
      reviewReason: "Dopravce není známý.",
    },
    { orderNumber: 3, category: "home", carrier: "GLS", reviewReason: null },
    {
      orderNumber: 4,
      category: "unknown",
      carrier: null,
      reviewReason: "Doručení není jasné.",
    },
  ];

  const summary = buildSummary(results, 5, 1);

  assert.equal(summary.totalOrders, 4);
  assert.deepEqual(summary.byCategory, { pickup: 2, home: 1, unknown: 1 });
  assert.deepEqual(summary.pickupByCarrier, { PPL: 1, "Neznámý dopravce": 1 });
  assert.deepEqual(summary.homeByCarrier, { GLS: 1 });
  assert.equal(summary.reviewOrders.length, 2);
  assert.equal(summary.duplicateOrdersSkipped, 1);
});