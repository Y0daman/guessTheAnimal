# Code Structure

Föreslagen riktning är en TypeScript-monorepo där spelregler och djurdata ligger i delade paket. Det gör att webbdemo, mobilapp och framtida backend kan återanvända samma logik.

| Sökväg | Ansvar |
| --- | --- |
| `apps/demo` | Webbdemo för snabb testning i browser. |
| `apps/mobile` | Fristående Expo-app för iPhone, iPad och Android med lokal metadata och lokala djurbilder. |
| `packages/shared` | Delade typer, djurkort, frågor, filtrering, scoring och rundlogik. |
| `packages/shared/src/game` | Ren spelmotor för solorundor, frågor, scoring och unlock-progress. |
| `packages/shared/src/game/animal-attributes.js` | Explicit gameplay-metadata per djur för frågesvar, storlek, färg, ben, vingar, simning, ägg, habitattyp och låslogik. |
| `packages/shared/assets/image-cards/animals` | Djurillustrationer och bildmetadata. |
| `packages/app-core` | API-kontrakt och klientkod för online multiplayer. |
| `packages/purchases` | Paket, entitlements, köpstatus och reklamfri status. |
| `services/backend` | Backendlogik för rum, spelare, rundor och realtidsuppdateringar. |
| `infra/aws` | AWS CDK-infrastruktur för serverless backend. |

## Principer

- Börja med `packages/shared` och `apps/demo` så kärnloopen blir testbar snabbt.
- Djurdata ska ligga i `packages/shared/src/content/animals.ts`.
- Frågor ska ligga i `packages/shared/src/content/questions.ts`.
- Filtreringslogik ska vara ren domänlogik utan UI-beroenden.
- Frågesvar ska komma från explicit djurmetadata, inte från fri textmatchning.
- Scoring ska vara deterministisk och testbar.
- Rewarded-ad-progress ska kunna testas utan annons-SDK.
- UI ska inte duplicera regler för vilka djur som matchar ett svar.
- Online-backend ska senare validera rum, spelare, svar och gissningar server-side.
- Funktioner och tester som implementerar krav bör märkas med `Implements: REQ-GTA-NNN`.

## Föreslagna Kommandon

När projektet scaffoldas bör rotens `package.json` stödja:

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run demo
npm run mobile
npm run infra:synth
```

## Första Implementation

1. Skapa `packages/shared` med typer för djur, frågor, svar och runda.
2. Lägg till 15-20 djur först för snabb iteration, växla sedan upp till 50.
3. Implementera filtrering och scoring med tester.
4. Bygg `apps/demo` med ett enkelt mobilformat UI.
5. Lägg till `apps/mobile` när spelkänslan är verifierad i webbdemon.
6. Lägg till backend först när lokal runda fungerar bra.
