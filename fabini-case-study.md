# Case study – E-commerce Developer (Shopify & Integrace)

## O datech

Jde o **reálné objednávky** z produkčního Shopify storu (více trhů/měn), zredukované jen na pole potřebná pro tento úkol a zbavené osobních údajů - žádná jména, adresy, e-maily, telefony ani IP adresy. Ponechány jsou: `order_number`, `created_at`, `currency`, `financial_status`, `shipping_lines` a jen ty `note_attributes`, které souvisí s výdejními místy (`PickupPoint*`, `Carrier*`, `globe_point_id`).

V datech **nejsou uměle navrhnuté** testovací edge case, jak to bývá u vymyšlených case studies – jsou to skutečné anomálie, na které middleware v produkci narazí.

## Kontext úkolu

Objednávky se synchronizují do ERP (Odoo) přes middleware. Sklad potřebuje z dat poznat, jestli objednávka jede na **výdejní místo**, nebo **domů/kurýrem** - protože se jinak balí a štítkuje.

## Úkol – Programovací úkol (Python nebo Node.js, dle preference kandidáta)

Napiš skript, který:

1. Načte přiložené `order-******.json`.
2. Pro každou objednávku vyhodnotí, jestli jde o doručení na **výdejní místo** nebo **domů/kurýrem**. Detekce musí fungovat napříč trhy - všimni si, že různé store používají různé jazykové varianty i formáty stejné informace.
3. Vytvoří **souhrn**: kolik objednávek jede na výdejní místo vs. domů, a u výdejních míst rozpad podle dopravce.
4. Výstup zapíše jako CSV nebo JSON (na výběr) + do konzole vypíše varování pro objednávky, kde je detekce nejistá nebo se nepovedla (nice-to-have).
5. Skript musí být spustitelný opakovaně nad stejnými daty, aniž by zdvojil řádky ve výstupu (idempotence).

---
