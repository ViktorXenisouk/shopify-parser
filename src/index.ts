import * as fs from "node:fs";
import * as path from "node:path";
import { classifyOrder } from "./classifier";
import { buildSummary } from "./summary";
import { NoteAttribute, ShopifyOrder, ShippingLine } from "./types";
import { parseOrder } from "./parseOrder";


function main(): void {
  const inputDirectory = path.resolve(process.cwd(), "input", "orders-case-study");
  const outputDirectory = path.resolve(process.cwd(), "output");
  const outputFile = path.join(outputDirectory, "summary.json");

  if (!fs.existsSync(inputDirectory)) {
    throw new Error(`Vstupní složka nebyla nalezena: ${inputDirectory}`);
  }

  const files = fs
    .readdirSync(inputDirectory)
    .filter((file) => /^order-.*\.json$/i.test(file))
    .sort();
  const orders = new Map<string, ShopifyOrder>();
  let duplicateOrdersSkipped = 0;

  for (const file of files) {
    const filePath = path.join(inputDirectory, file);

    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const order = parseOrder(parsed);

      if (order === null) {
        console.warn(`[VAROVÁNÍ] ${file}: soubor přeskočen.`);
        continue;
      }

      const orderKey = String(order.order_number);
      if (orders.has(orderKey)) {
        duplicateOrdersSkipped += 1;
        console.warn(`[VAROVÁNÍ] ${file}: objednávka ${orderKey} už byla načtena, duplicita přeskočena.`);
        continue;
      }

      orders.set(orderKey, order);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[VAROVÁNÍ] ${file}: JSON se nepodařilo načíst (${message}), soubor přeskočen.`);
    }
  }

  const results = [...orders.values()].map(classifyOrder);
  const summary = buildSummary(results, files.length, duplicateOrdersSkipped);

  for (const order of summary.reviewOrders) {
    console.warn(
      `[KONTROLA] Objednávka ${order.orderNumber}: ${order.reviewReason}`,
    );
  }

  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(
    `Hotovo: ${summary.totalOrders} jedinečných objednávek; výsledek je v ${outputFile}`,
  );
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[CHYBA] ${message}`);
  process.exitCode = 1;
}