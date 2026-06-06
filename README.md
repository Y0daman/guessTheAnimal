# Guess The Animal

`Guess The Animal` är ett barnvänligt deduktionsspel för iPhone och Android, inspirerat av `Guess Who`. En spelare får ett hemligt djur och övriga spelare försöker lista ut vilket djur det är genom att ställa förvalda frågor med tydliga ikoner.

Spelet ska vara tryggt för barn: ingen fri chatt, inga hårda felmeddelanden och enkla visuella beslut. Fokus är färgglada djurkort, tydliga frågor och en spelrunda som går att förstå utan texttunga instruktioner.

## Spelidé

En runda börjar med att spelare går med i ett rum eller startar lokalt spel. Spelet väljer ett hemligt djur och utser en svarshållare. De andra spelarna ställer frågor, till exempel `Har den vingar?`, `Kan den simma?` eller `Bor den i vatten?`.

Svarshållaren svarar med stora knappar:

- `Ja`
- `Nej`
- `Ibland`, om frågan kräver det

Efter varje svar gråas djur som inte längre passar in. Spelarna kan gissa genom att trycka på ett djurkort. Rätt gissning avslutar rundan och ger stjärnor baserat på hur få ledtrådar och felgissningar som användes.

## Plattformar

Spelet ska utvecklas för:

- iPhone
- iPad
- Android

Under utveckling ska det också finnas ett demoläge som kan köras i webbläsare. Webbdemon ska göra det snabbt att testa djurkort, frågor, filtrering och runda-flöde utan att installera en mobilapp.

## Kärnupplevelse

- Barnvänlig deduktion med djur.
- Stora visuella djurkort.
- Frågor med ikoner istället för fri text.
- Automatisk filtrering efter svar.
- Snälla reaktioner på felgissningar.
- Kort runda med tydligt resultat.
- Lokalt spel först, online multiplayer senare.

## MVP

Första versionen ska prioritera offline/local play före molnbackend.

- 50 startdjur.
- Frågeknappar för grundläggande attribut.
- Automatisk filtrering av möjliga djur.
- Gissa genom att trycka på kort.
- Poäng och stjärnor.
- Pass-and-play eller enkel lokal demo.

Online multiplayer med rumskod, invite-länk och realtidsuppdateringar kommer efter att kärnloopen känns bra.

## Innehåll Och Intäkter

Grundversionen ska innehålla ett gratis djurpaket. Nya paket kan säljas eller låsas upp senare.

Exempel på paket:

- Bondgårdsdjur
- Havsdjur
- Fåglar
- Insekter
- Dinosaurier
- Djur från savannen

Reklam ska inte störa pågående spel. Om rewarded ads används ska de vara frivilliga och ge tillfällig packåtkomst, slumpdjur eller kosmetiska belöningar.

## Dokument

- `IDEA.md` beskriver den ursprungliga spelidén.
- `README.md` beskriver produktens riktning och mål.
- `REQUIREMENTS.md` beskriver krav för första versionerna.
- `CODE_STRUCTURE.md` beskriver föreslagen modulär kodstruktur.
- `ARCHITECTURE.md` beskriver teknisk riktning för lokal demo, mobilapp och framtida AWS-backend.

## Kör Demo

```bash
npm install
npm run demo
```

Demot är en lokal soloversion utan backend. Datorn väljer ett upplåst djur, spelaren ställer ja/nej-frågor och gissar genom att trycka på djurkort.
