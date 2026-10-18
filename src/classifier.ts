import { ClassificationResult, DeliveryCategory, ShopifyOrder, } from "./types";

function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

function hasValue(order: ShopifyOrder, attributeNames: string[]): boolean {
    const wantedNames = attributeNames.map((name) => name.toLowerCase());

    return order.note_attributes.some((attribute) => {
        const name = attribute.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const value = attribute.value.trim();
        return wantedNames.includes(name) && value !== "" && value.toLowerCase() !== "null";
    });
}

function hasPickupShippingName(shippingText: string): boolean {
    const text = normalizeText(shippingText);
    const pickupWords = [
        "parcelshop",
        "csomagpont",
        "pickup",
        "vydejni misto",
        "z-box",
        "zbox",
    ];

    return pickupWords.some((word) => text.includes(word));
}

function hasHomeShippingName(shippingText: string): boolean {
    const text = normalizeText(shippingText);
    const homeWords = [
        "doruceni domu",
        "home delivery",
        "delivery home",
        "door delivery",
        "courier",
        "kuryr",
        "futar",
        "hazhoz",
    ];

    return homeWords.some((word) => text.includes(word));
}

function carrierFromText(value: string): string[] {
    const text = normalizeText(value);
    const carriers: string[] = [];

    if (text.includes("zasilkovna")) carriers.push("Zásilkovna");
    if (text.includes("packeta")) carriers.push("Packeta");
    if (text.includes("ppl")) carriers.push("PPL");
    if (text.includes("gls")) carriers.push("GLS");

    return carriers;
}

function findCarrier(order: ShopifyOrder): string | null {
    const shippingCarriers = new Set(
        order.shipping_lines.flatMap((line) =>
            carrierFromText(`${line.code} ${line.title}`),
        ),
    );

    if (shippingCarriers.size === 1) return [...shippingCarriers][0];
    if (shippingCarriers.size > 1) return null;

    // Název dopravy má přednost; poskytovatel výdejního místa je jen záložní údaj.
    const providerCarriers = new Set(
        order.note_attributes
            .filter((attribute) => {
                const name = attribute.name.toLowerCase().replace(/[^a-z0-9]/g, "");
                return ["pickuppointprovider", "carriername", "carrierprovider"].includes(name);
            })
            .flatMap((attribute) => carrierFromText(attribute.value)),
    );

    return providerCarriers.size === 1 ? [...providerCarriers][0] : null;
}

export function classifyOrder(order: ShopifyOrder): ClassificationResult {
    const shippingText = order.shipping_lines
        .map((line) => `${line.code} ${line.title}`)
        .join(" ");
    const hasPickupId = hasValue(order, [
        "PickupPointId",
        "PickupPointName",
        "CarrierPickupPointId",
        "globe_point_id",
    ]);
    const pickupEvidence = hasPickupId || hasPickupShippingName(shippingText);
    const homeEvidence = hasHomeShippingName(shippingText);

    let category: DeliveryCategory;
    let reviewReason: string | null = null;

    if (pickupEvidence && homeEvidence) {
        category = "unknown";
        reviewReason = "Údaje současně ukazují na výdejní místo i doručení domů.";
    } else if (pickupEvidence) {
        category = "pickup";
    } else if (homeEvidence) {
        category = "home";
    } else {
        category = "unknown";
        reviewReason = "Z dostupných údajů nelze způsob doručení spolehlivě určit.";
    }

    const carrier = findCarrier(order);
    if (category === "pickup" && carrier === null) {
        reviewReason = "Výdejní místo je rozpoznáno, dopravce ale určit nelze.";
    }

    return {
        orderNumber: order.order_number,
        category,
        carrier,
        reviewReason,
    };
}