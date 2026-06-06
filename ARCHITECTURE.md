# Architecture

Rekommendation för första versionen: bygg kärnspelet lokalt först och lägg till AWS serverless när online multiplayer behövs.

Anledning:

- Spelets viktigaste risk är spelkänsla, inte molninfrastruktur.
- Djurfiltrering, frågor och scoring kan testas helt lokalt.
- Barn-UX behöver snabb iteration i webbdemo och mobilapp.
- Online multiplayer kan återanvända samma domänlogik när kärnloopen är stabil.
- AWS serverless ger låg idle-kostnad när spelet senare får rum och realtid.

## Fas 1: Lokal Demo

Första fasen ska kunna köras utan konto, backend eller betalningar.

| Behov | Rekommendation |
| --- | --- |
| UI-prototyp | Webbdemo i `apps/demo` |
| Spelregler | `packages/shared` |
| Djurdata | Statisk TypeScript-data i `packages/shared` |
| Tester | Enhetstester för filtrering, scoring och runda |
| Mobil känsla | Responsiv layout i telefonstorlek |

## Fas 2: Mobilapp

Mobilappen kan byggas med Expo/React Native för att nå iOS och Android med samma kodbas.

Mobilappen ska återanvända:

- Djurtyper.
- Frågedefinitioner.
- Filtreringslogik.
- Scoring.
- Paketmetadata.

Pass-and-play kan vara första mobilvarianten eftersom den fungerar utan server och passar barn/familj i samma rum.

## Fas 3: Online Multiplayer

När lokal runda fungerar kan online-läget byggas med AWS serverless.

| Behov | AWS-tjänst | Kommentar |
| --- | --- | --- |
| HTTP API | API Gateway HTTP API | Skapa rum, anslut, starta runda, gissa. |
| Realtid | API Gateway WebSocket API | Synka fas, svar, filtrering och resultat. |
| Backendkod | Lambda | Serverless spelrumshantering. |
| Databas | DynamoDB | Rum, spelare, rundor, paket och connections. |
| Bilder | S3 + CloudFront | Djurillustrationer och paketassets. |
| Loggar | CloudWatch Logs | Fel och driftövervakning. |
| Infrastruktur | AWS CDK | Reproducerbar miljö i kod. |

## Kortlåsning Utan Backend

För solospel och pass-and-play kan alla kort följa med appen från början och låsas upp lokalt. Då behövs ingen backend för själva spelet.

Lokal modell:

- Alla bilder och metadata ligger installerade i appen.
- Ett antal kort är upplåsta från start.
- Appen sparar upplåsta kort lokalt på enheten.
- Rewarded ads kan ge progress, till exempel 5 sedda reklamklipp låser upp 1 kort.
- Om appen uppdateras kan nya kort följa med i appversionen och vara låsta från början.

Begränsning:

- Lokal unlock är inte starkt skydd mot manipulation.
- Unlock synkas inte automatiskt mellan enheter.
- Byter användaren telefon kan lokala unlocks försvinna om de inte kopplas till butiksköp, konto eller cloud save.

Backend behövs främst när:

- Online multiplayer ska synka rum, spelare, frågor, svar och resultat.
- Köp eller prenumerationer ska valideras server-side.
- Entitlements ska synkas mellan enheter.
- Nya kortpaket ska kunna släppas utan appuppdatering.
- Reklambelöningar ska verifieras server-side för att motverka fusk.

## Datamodell

Första onlineversionen behöver dessa begrepp:

| Modell | Syfte |
| --- | --- |
| `Room` | Rumskod, fas, inställningar och tillgängliga paket. |
| `Player` | Namn, avatar, värdstatus och anslutningsstatus. |
| `Round` | Hemligt djur, svarshållare, frågor, svar och gissningar. |
| `Animal` | Djurdata och attribut. |
| `Question` | Frågetext, ikon och attributmatchning. |
| `Pack` | Djurpaket, prisnivå och tillgänglighet. |
| `Connection` | WebSocket connection-id kopplat till rum och spelare. |

## Säkerhetsprinciper

- Ingen fri chatt i MVP.
- Klienten ska inte få hemligt djur om spelaren inte är svarshållare.
- Backend ska validera att spelaren tillhör rummet.
- Backend ska validera att endast rätt spelare kan svara på frågor.
- Backend ska validera att gissningar gäller djur som finns i rummets paket.
- Loggar ska inte innehålla personuppgifter utöver tekniskt nödvändiga id:n.
- Barninnehåll ska vara standardläget.

## Kostnadsprinciper

- Undvik fasta kostnader i början.
- Undvik NAT Gateway, EC2, RDS och Load Balancer i första onlineversionen.
- Använd DynamoDB on-demand initialt.
- Använd kort log retention i `dev`.
- Sätt AWS Budgets innan publik drift.

## Arkitekturbeslut För Version 1

- Börja med lokal webbdemo.
- Bygg domänlogik i delat TypeScript-paket.
- Använd Expo/React Native för mobilapp.
- Lägg till AWS serverless när online multiplayer behövs.
- Håll speldata, köp och UI separerade från spelreglerna.
- Optimera först för snabb iteration och trygg barnupplevelse.
