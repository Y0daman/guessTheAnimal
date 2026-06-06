# Requirements

Krav-ID:n används för att kunna koppla implementation och tester till tydliga produktbeslut.

## MVP: Offline Och Lokal Spelloop

| ID | Krav |
| --- | --- |
| REQ-GTA-001 | Spelet ska kunna starta en lokal runda utan backend och utan internet. |
| REQ-GTA-002 | En runda ska välja exakt ett hemligt djur från tillgängliga djurkort. |
| REQ-GTA-003 | En spelare ska kunna vara svarshållare för rundan. |
| REQ-GTA-004 | Övriga spelare ska kunna ställa frågor via fördefinierade knappar. |
| REQ-GTA-005 | Svar ska minst stödja `Ja` och `Nej`. |
| REQ-GTA-006 | `Ibland` ska kunna användas för frågor där attributet inte är absolut. |
| REQ-GTA-007 | Djur som inte matchar svaren ska gråas ut, inte tas bort från brädet. |
| REQ-GTA-008 | Spelare ska kunna gissa genom att trycka på ett djurkort. |
| REQ-GTA-009 | Rätt gissning ska avsluta rundan med positiv feedback. |
| REQ-GTA-010 | Fel gissning ska ge mild feedback och gråa ut djuret. |
| REQ-GTA-011 | Fel feedback får inte vara skammande eller hård. |
| REQ-GTA-012 | Poäng ska baseras på antal frågor och felgissningar. |
| REQ-GTA-013 | Poäng ska visas som 1-3 stjärnor för barn. |

## Djurkort Och Attribut

| ID | Krav |
| --- | --- |
| REQ-GTA-020 | Varje djur ska ha stabilt `id`, visningsnamn och attribut. |
| REQ-GTA-021 | Varje djur ska kunna kopplas till ett eller flera paket. |
| REQ-GTA-022 | Attribut ska stödja ben, vingar, päls, fjäll, skal, äggläggning, simförmåga, flygförmåga, habitat, färger och storlek. |
| REQ-GTA-023 | Startinnehållet ska innehålla minst 50 djur innan första publika version. |
| REQ-GTA-024 | Djurdata ska vara separerad från UI så att mobilapp, webbdemo och backend kan återanvända den. |

## Barnsäkerhet

| ID | Krav |
| --- | --- |
| REQ-GTA-030 | MVP ska inte ha fri chatt. |
| REQ-GTA-031 | Spelarnamn ska kunna väljas från fördefinierade barnvänliga namn. |
| REQ-GTA-032 | Avatarer ska vara fördefinierade och barnvänliga. |
| REQ-GTA-033 | Innehåll ska vara visuellt tydligt och inte skrämmande för yngre barn. |
| REQ-GTA-034 | Online-läge ska inte exponera mer information än varje spelare behöver se. |

## Multiplayer

| ID | Krav |
| --- | --- |
| REQ-GTA-040 | Online-läge ska stödja spelrum med rumskod. |
| REQ-GTA-041 | Online-läge ska stödja invite-länk. |
| REQ-GTA-042 | Ett rum ska initialt stödja 2-6 spelare. |
| REQ-GTA-043 | Alla spelare i ett rum ska se samma runda-fas. |
| REQ-GTA-044 | Svarshållaren ska rotera mellan rundor. |
| REQ-GTA-045 | Djurpaket i ett rum ska vara unionen av spelarnas tillgängliga paket. |

## Köp Och Paket

| ID | Krav |
| --- | --- |
| REQ-GTA-050 | Gratisversionen ska fungera med ett startpaket utan köp. |
| REQ-GTA-051 | Betalda paket ska kunna läggas till utan att ändra spelreglerna. |
| REQ-GTA-052 | Rewarded ads får bara vara frivilliga och får inte visas mitt i en aktiv runda. |
