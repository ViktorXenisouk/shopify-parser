# FABINI: souhrn objednávek

Jednoduchý skript v Node.js a TypeScriptu načte objednávky z `input/orders-case-study/`, určí způsob doručení a dopravce a vytvoří souhrn v `output/summary.json`.

## Požadavky a spuštění

Je potřeba Node.js 20 nebo novější a npm. V kořenové složce projektu spusťte:

```sh
npm install
npm run build
npm start
```

První příkaz nainstaluje TypeScript a jeho typy pro Node.js. `npm run build` přeloží TypeScript a `npm start` spustí vytvořený JavaScript.

Testy zkompilují projekt a spustí vestavěný testovací nástroj Node.js:

```sh
npm test
```

## Jak program pracuje

- `src/index.ts` načte seřazené soubory `order-*.json`, zkontroluje základní tvar dat a přeskočí neplatné soubory. Objednávky se ukládají do mapy podle `order_number`, takže se stejné číslo započítá jen jednou. Při duplicitě se zachová první soubor podle názvu a do konzole se vypíše varování.
- `src/classifier.ts` odděleně určuje kategorii a dopravce. Neprázdný identifikátor nebo název výdejního místa a názvy služeb jako `ParcelShop`, `Csomagpont` či `Z-BOX` jsou signály pro výdejní místo. Výrazy pro doručení domů, kurýra a maďarské `Futár` znamenají doručení domů. Porovnání ignoruje velikost písmen a diakritiku.
- Dopravce se hledá zvlášť podle známé značky v názvu dopravy. Obecné maďarské slovo `Futár` znamená kurýra, samo o sobě ale neříká značku dopravce. Atribut poskytovatele je pouze záloha, protože název služby může být přesnější (například `Packeta` vedle `PickupPointProvider=Zasilkovna`). Pokud se signály kategorie střetnou, nebo ji nelze určit, objednávka dostane kategorii `unknown` a upozornění ke kontrole. U výdejního místa se ke kontrole přidá také neznámý dopravce.
- `src/summary.ts` spočítá jedinečné objednávky podle kategorie, rozpad výdejních i domácích objednávek podle dopravce a seznam ke kontrole. Každý běh vytvoří souhrn znovu a přepíše `output/summary.json`, nic nepřipojuje ke starému souboru.

Vstupní JSON může mít chybějící pole nebo chybný obsah; TypeScript jeho správnost sám neověří. Proto načítací část pracuje s hodnotou typu `unknown` a před použitím ověřuje číslo objednávky a tvar polí, která skript potřebuje.

## Struktura

```text
src/       zdrojový TypeScript
test/      testy přes node:test
dist/      JavaScript vytvořený kompilací
output/    vytvořený souhrn JSON
```

Vstupní objednávky zůstávají v původní složce `/input/orders-case-study/` a skript je neupravuje.