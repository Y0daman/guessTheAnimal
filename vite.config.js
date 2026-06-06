import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));
const animalAssetsSource = resolve(rootDir, "packages/shared/assets/image-cards/animals");
const animalAssetsTarget = resolve(rootDir, "dist/packages/shared/assets/image-cards/animals");

function copyAnimalAssets() {
  return {
    name: "copy-animal-assets",
    closeBundle() {
      if (!existsSync(animalAssetsSource)) return;
      rmSync(animalAssetsTarget, { force: true, recursive: true });
      mkdirSync(dirname(animalAssetsTarget), { recursive: true });
      cpSync(animalAssetsSource, animalAssetsTarget, { recursive: true });
    }
  };
}

export default defineConfig({
  plugins: [copyAnimalAssets()]
});
