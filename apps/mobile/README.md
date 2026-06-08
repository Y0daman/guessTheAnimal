# Guess The Animal Mobile

Mobilappen är en fristående Expo-app för iPhone Simulator och Android Emulator.

Den använder:

- Lokal djurmetadata från `packages/shared/assets/image-cards/animals/metadata.json`.
- Lokala djurbilder i `apps/mobile/assets/animals` via `apps/mobile/animal-images.js`.
- En lokal kopia av spelmotorn i `apps/mobile/game`.

Den kräver ingen Vite-server och ingen backend.

## iPhone Simulator

```bash
npm run mobile:ios
```

## Android Emulator

```bash
npm run mobile:android
```

## HTML-Demo

HTML-demot finns kvar för snabb överblick:

```bash
npm run demo
```
