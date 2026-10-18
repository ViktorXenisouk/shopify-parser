import assert from "node:assert/strict";
import test from "node:test";
import { classifyOrder } from "../src/classifier";
import { ShopifyOrder } from "../src/types";

function order(
  shippingTitle: string,
  attributes: ShopifyOrder["note_attributes"] = [],
): ShopifyOrder {
  return {
    order_number: 1,
    shipping_lines: [{ code: shippingTitle, title: shippingTitle }],
    note_attributes: attributes,
  };
}

test("rozpozná výdejní místo podle identifikátoru bez ohledu na velikost písmen", () => {
  const result = classifyOrder(
    order("Přeprava", [{ name: "pickupPointId", value: "123" }]),
  );

  assert.equal(result.category, "pickup");
});

test("rozpozná maďarský název výdejního místa a dopravce Packeta", () => {
  const result = classifyOrder(order("Packeta - Csomagpontok"));

  assert.equal(result.category, "pickup");
  assert.equal(result.carrier, "Packeta");
});

test("rozpozná maďarské doručení kurýrem domů bez domýšlení dopravce", () => {
  const result = classifyOrder(order("Futár kézbesítés B2B"));

  assert.equal(result.category, "home");
  assert.equal(result.carrier, null);
});

test("při současných signálech výdejního místa a doručení domů vrátí unknown", () => {
  const result = classifyOrder(
    order("Doručení domů - PPL", [{ name: "PickupPointId", value: "123" }]),
  );

  assert.equal(result.category, "unknown");
  assert.notEqual(result.reviewReason, null);
});

test("prázdný identifikátor a neznámý název zůstanou neznámé", () => {
  const result = classifyOrder(
    order("custom", [{ name: "PickupPointId", value: " " }]),
  );

  assert.equal(result.category, "unknown");
  assert.notEqual(result.reviewReason, null);
});