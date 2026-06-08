import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const sourceRoot = "/Users/sssyhs/Documents/git/imposter/packages/shared/assets/image-cards/animals";
const targetRoot = resolve(projectRoot, "packages/shared/assets/image-cards/animals");
const mobileRoot = resolve(projectRoot, "apps/mobile");
const mobileAssetsRoot = resolve(mobileRoot, "assets/animals-512");

const requiredAttributeKeys = [
  "size",
  "colors",
  "pattern",
  "legs",
  "hasWings",
  "canFly",
  "canSwim",
  "laysEggs",
  "livesNearWater",
  "mostlyLand",
  "farmAnimal",
  "pet",
  "coldHabitat",
  "shellOrArmor"
];

const waterWords = ["hav", "sjö", "flod", "damm", "kust", "lagun", "rev", "korallrev", "våtmark", "havsis", "havsbotten", "bäck", "strand"];
const flightlessBirds = new Set(["animal-penguin", "animal-penguin-emperor", "animal-emperor-penguin", "animal-ostrich", "animal-kiwi", "animal-cassowary", "animal-emu", "animal-flamingo-chick", "animal-chicken", "animal-rooster"]);
const birds = ["eagle", "owl", "penguin", "flamingo", "parrot", "peacock", "ostrich", "duck", "goose", "swan", "chicken", "rooster", "budgerigar", "budgie", "canary", "cockatiel", "macaw", "toucan", "hummingbird", "woodpecker", "kingfisher", "puffin", "seagull", "pelican", "stork", "crane", "heron", "ibis", "kiwi", "cassowary", "emu", "turkey", "quail", "pheasant", "vulture"];
const insects = ["mosquito", "fly", "flea", "butterfly", "bee", "wasp", "ant", "ladybug", "dragonfly", "grasshopper", "mantis", "firefly", "moth", "caterpillar", "beetle", "cricket", "termite", "bumblebee"];
const arachnids = ["spider", "scorpion", "tick", "black-widow", "tarantula"];
const crustaceans = ["crab", "lobster", "shrimp", "prawn", "hermit-crab"];
const fishLike = ["clownfish", "shark", "dolphin", "whale", "orca", "fish", "eel", "ray", "seahorse", "tuna", "salmon", "trout", "goldfish", "guppy", "cod", "mackerel", "marlin", "swordfish", "dugong", "manatee", "narwhal", "beluga"];
const reptiles = ["crocodile", "alligator", "turtle", "tortoise", "snake", "lizard", "cobra", "viper", "python", "anaconda", "boa", "iguana", "chameleon", "gecko", "tuatara", "dragon"];
const amphibians = ["frog", "toad", "salamander", "newt", "axolotl"];
const molluscs = ["snail", "clam", "oyster", "octopus", "squid"];
const aquaticNoLegs = ["jellyfish", "starfish", "urchin", "coral", "plankton", "sea-cucumber"];
const farmIds = new Set(["animal-cow", "animal-pig", "animal-sheep", "animal-goat", "animal-horse", "animal-donkey", "animal-chicken", "animal-rooster", "animal-duck", "animal-goose", "animal-turkey", "animal-llama", "animal-alpaca", "animal-camel", "animal-bactrian-camel"]);
const petIds = new Set(["animal-cat", "animal-dog", "animal-rabbit", "animal-hamster", "animal-guinea-pig", "animal-mouse", "animal-rat", "animal-gerbil", "animal-chinchilla", "animal-degu", "animal-goldfish", "animal-guppy", "animal-budgerigar", "animal-budgie-blue", "animal-canary", "animal-cockatiel", "animal-parrot", "animal-ferret", "animal-bearded-dragon", "animal-gecko"]);
const hugeIds = new Set(["animal-elephant", "animal-giraffe", "animal-rhinoceros", "animal-hippopotamus", "animal-moose", "animal-whale", "animal-blue-whale", "animal-sperm-whale", "animal-orca", "animal-bison", "animal-buffalo"]);
const largeIds = new Set(["animal-lion", "animal-tiger", "animal-zebra", "animal-gorilla", "animal-panda", "animal-polar-bear", "animal-brown-bear", "animal-cheetah", "animal-leopard", "animal-jaguar", "animal-kangaroo", "animal-horse", "animal-cow", "animal-camel", "animal-bactrian-camel", "animal-ostrich", "animal-crocodile", "animal-alligator", "animal-shark", "animal-hammerhead-shark", "animal-basking-shark", "animal-sea-lion", "animal-walrus", "animal-python", "animal-boa-constrictor", "animal-anaconda", "animal-emu", "animal-cassowary", "animal-manatee", "animal-dugong", "animal-narwhal", "animal-beluga", "animal-tuna", "animal-marlin", "animal-swordfish", "animal-komodo-dragon", "animal-tapir", "animal-okapi", "animal-okapi-calf", "animal-baboon", "animal-mandrill", "animal-hyena"]);
const hardIds = new Set(["animal-cobra", "animal-rattlesnake", "animal-viper", "animal-python", "animal-boa-constrictor", "animal-anaconda", "animal-budgie-blue", "animal-cockatiel", "animal-macaw", "animal-hummingbird", "animal-kingfisher", "animal-puffin", "animal-ibis", "animal-cassowary", "animal-quail", "animal-pheasant", "animal-flamingo-chick", "animal-shrew", "animal-vole", "animal-degu", "animal-groundhog", "animal-opossum", "animal-tasmanian-devil", "animal-quokka", "animal-tree-kangaroo", "animal-echidna", "animal-fennec-fox", "animal-arctic-fox", "animal-red-deer", "animal-roe-deer", "animal-warthog", "animal-impala", "animal-springbok", "animal-oryx", "animal-okapi-calf", "animal-dugong", "animal-narwhal", "animal-beluga", "animal-hammerhead-shark", "animal-stingray", "animal-manta-ray", "animal-pufferfish", "animal-moray-eel", "animal-swordfish", "animal-marlin", "animal-guppy", "animal-axolotl", "animal-newt", "animal-tree-frog", "animal-poison-dart-frog", "animal-firefly", "animal-stag-beetle", "animal-termite", "animal-centipede", "animal-millipede", "animal-hermit-crab", "animal-prawn", "animal-sea-urchin", "animal-sea-cucumber", "animal-flying-fish", "animal-flying-squirrel", "animal-flying-fox", "animal-vampire-bat", "animal-sperm-whale", "animal-plankton", "animal-woodlouse", "animal-fire-ant", "animal-black-widow", "animal-deep-sea-anglerfish", "animal-basking-shark", "animal-monkfish", "animal-lionfish", "animal-bactrian-camel", "animal-giant-tortoise", "animal-monitor-lizard", "animal-komodo-dragon", "animal-pangolin", "animal-aardvark", "animal-mandrill", "animal-gibbon", "animal-macaque", "animal-capuchin", "animal-proboscis-monkey", "animal-bearded-dragon", "animal-tuatara"]);

const source = JSON.parse(readFileSync(resolve(sourceRoot, "metadata.json"), "utf8"));
const previousTarget = existsSync(resolve(targetRoot, "metadata.json")) ? JSON.parse(readFileSync(resolve(targetRoot, "metadata.json"), "utf8")) : { animals: [] };
const previousById = new Map(previousTarget.animals.map((animal) => [animal.id, animal]));

mkdirSync(targetRoot, { recursive: true });
for (const animal of source.animals) {
  const slug = animal.imageId.replace("animals/", "");
  for (const suffix of [".png", ".meta.json"]) {
    const sourcePath = resolve(sourceRoot, `${slug}${suffix}`);
    if (existsSync(sourcePath)) cpSync(sourcePath, resolve(targetRoot, basename(sourcePath)));
  }
}

const playableSourceAnimals = source.animals.filter((animal) => existsSync(resolve(sourceRoot, `${animal.imageId.replace("animals/", "")}.png`)));
const skippedAnimals = source.animals.filter((animal) => !existsSync(resolve(sourceRoot, `${animal.imageId.replace("animals/", "")}.png`)));

const mergedAnimals = playableSourceAnimals.map((sourceAnimal) => {
  const previous = previousById.get(sourceAnimal.id);
  const base = { ...sourceAnimal };
  const attributes = previous?.attributes || inferAttributes(sourceAnimal);
  base.attributes = materializeAttributes(attributes);
  base.difficulty = inferDifficulty(sourceAnimal);
  base.cluesSv = buildClues(sourceAnimal, base.attributes);
  base.assetPath = `asset:image-cards/animals/${sourceAnimal.imageId.replace("animals/", "")}.png`;
  base.generatedMetadataPath = `packages/shared/assets/image-cards/animals/${sourceAnimal.imageId.replace("animals/", "")}.meta.json`;
  return base;
});

const nextMetadata = { ...source, animals: mergedAnimals };
writeFileSync(resolve(targetRoot, "metadata.json"), `${JSON.stringify(nextMetadata, null, 2)}\n`);

mkdirSync(resolve(mobileRoot, "game"), { recursive: true });
for (const file of ["animal-attributes.js", "animal-facts.js", "progress.js", "solo-game.js"]) {
  cpSync(resolve(projectRoot, "packages/shared/src/game", file), resolve(mobileRoot, "game", file));
}
cpSync(resolve(targetRoot, "metadata.json"), resolve(mobileRoot, "metadata.json"));

rmSync(mobileAssetsRoot, { force: true, recursive: true });
mkdirSync(mobileAssetsRoot, { recursive: true });
execFileSync("magick", ["mogrify", "-path", mobileAssetsRoot, "-resize", "512x512", "-strip", "-define", "png:compression-level=9", `${targetRoot}/*.png`], { stdio: "inherit" });

const imageMap = ["export const animalImages = {"];
for (const animal of mergedAnimals) {
  const slug = animal.imageId.replace("animals/", "");
  imageMap.push(`  ${JSON.stringify(animal.id)}: require("./assets/animals-512/${slug}.png"),`);
}
imageMap.push("};\n");
writeFileSync(resolve(mobileRoot, "animal-images.js"), imageMap.join("\n"));

console.log(`Updated ${mergedAnimals.length} animals.`);
if (skippedAnimals.length) {
  console.log(`Skipped ${skippedAnimals.length} animals without images: ${skippedAnimals.map((animal) => animal.id).join(", ")}`);
}

function inferAttributes(animal) {
  const slug = animal.imageId.replace("animals/", "");
  const text = [slug, animal.id, animal.nameSv, animal.descriptionSv, animal.prompt, ...(animal.habitats || []), ...(animal.continents || []), ...(animal.cluesSv || [])].join(" ").toLowerCase();
  const habitats = animal.habitats || [];
  const livesNearWater = habitats.some((habitat) => waterWords.some((word) => habitat.toLowerCase().includes(word))) || includesAny(slug, fishLike) || includesAny(slug, aquaticNoLegs) || includesAny(slug, crustaceans) || includesAny(slug, molluscs.filter((item) => item !== "snail"));
  const isBird = includesAny(slug, birds);
  const isInsect = includesAny(slug, insects);
  const isArachnid = includesAny(slug, arachnids);
  const isCrustacean = includesAny(slug, crustaceans);
  const isFishLike = includesAny(slug, fishLike);
  const isReptile = includesAny(slug, reptiles);
  const isAmphibian = includesAny(slug, amphibians);
  const isMollusc = includesAny(slug, molluscs);
  const isAquaticNoLegs = includesAny(slug, aquaticNoLegs);

  let legs = 4;
  if (isBird) legs = 2;
  if (isInsect) legs = 6;
  if (isArachnid) legs = slug.includes("tick") ? 8 : 8;
  if (isCrustacean) legs = 10;
  if (slug.includes("centipede") || slug.includes("millipede")) legs = 30;
  if (slug.includes("starfish")) legs = 5;
  if (slug.includes("octopus")) legs = 8;
  if (slug.includes("squid")) legs = 10;
  if (slug.includes("snake") || slug.includes("cobra") || slug.includes("viper") || slug.includes("python") || slug.includes("anaconda") || slug.includes("boa") || slug.includes("eel") || slug.includes("worm") || isFishLike || slug.includes("jellyfish") || slug.includes("clam") || slug.includes("oyster") || slug.includes("coral") || slug.includes("plankton") || slug.includes("sea-cucumber")) legs = 0;

  const hasWings = isBird || ["bat", "flying-fox", "vampire-bat"].some((item) => slug.includes(item)) || isInsect && !["flea", "ant", "termite", "caterpillar"].some((item) => slug.includes(item));
  const canFly = hasWings && !flightlessBirds.has(animal.id) && !["flea", "tick", "caterpillar"].some((item) => slug.includes(item));
  const canSwim = livesNearWater && !["coral", "clam", "oyster", "sea-urchin", "starfish"].some((item) => slug.includes(item));
  const laysEggs = isBird || isInsect || isArachnid && !slug.includes("scorpion") || isCrustacean || isFishLike || isReptile || isAmphibian || isMollusc || isAquaticNoLegs || ["platypus", "echidna"].some((item) => slug.includes(item));
  const mostlyLand = !(isFishLike || isAquaticNoLegs || ["seal", "sea-lion", "walrus", "dugong", "manatee", "otter"].some((item) => slug.includes(item)) || isCrustacean || ["clam", "oyster", "octopus", "squid"].some((item) => slug.includes(item)));

  return {
    size: inferSize(animal, slug),
    colors: inferColors(text, slug),
    pattern: inferPattern(text, slug),
    legs,
    hasWings,
    canFly,
    canSwim,
    laysEggs,
    livesNearWater,
    mostlyLand,
    farmAnimal: farmIds.has(animal.id),
    pet: petIds.has(animal.id),
    coldHabitat: ["arktis", "havsis", "is", "arctic", "polar", "beluga", "narwhal", "walrus", "reindeer", "penguin"].some((word) => text.includes(word)),
    shellOrArmor: isCrustacean || ["turtle", "tortoise", "armadillo", "pangolin", "beetle", "snail", "clam", "oyster", "urchin"].some((item) => slug.includes(item))
  };
}

function materializeAttributes(attributes) {
  const fallback = { size: "medium", colors: [], pattern: [], legs: 4, hasWings: false, canFly: false, canSwim: false, laysEggs: false, livesNearWater: false, mostlyLand: true, farmAnimal: false, pet: false, coldHabitat: false, shellOrArmor: false };
  const result = { ...fallback, ...attributes };
  return Object.fromEntries(requiredAttributeKeys.map((key) => [key, result[key]]));
}

function inferSize(animal, slug) {
  if (hugeIds.has(animal.id)) return "huge";
  if (largeIds.has(animal.id)) return "large";
  if (["mosquito", "fly", "tick", "flea", "plankton", "shrimp", "prawn", "guppy", "goldfish", "seahorse", "frog", "toad", "newt", "axolotl", "firefly", "moth", "caterpillar", "beetle", "cricket", "termite", "centipede", "millipede", "clam", "oyster", "urchin", "coral", "cucumber", "mole", "shrew", "vole", "gerbil", "degu", "chipmunk", "quokka", "kiwi", "quail", "canary", "hummingbird", "budgie", "budgerigar", "cockatiel", "gecko"].some((item) => slug.includes(item))) return "small";
  return "medium";
}

function inferColors(text, slug) {
  const colorMap = { black: ["black", "svart"], white: ["white", "vit"], brown: ["brown", "brun"], gray: ["gray", "grey", "grå"], yellow: ["yellow", "gold", "golden", "gul"], orange: ["orange"], red: ["red", "röd"], pink: ["pink", "rosa"], green: ["green", "grön"], blue: ["blue", "blå"], purple: ["purple", "lila"] };
  const colors = Object.entries(colorMap).filter(([, words]) => words.some((word) => text.includes(word))).map(([color]) => color);
  if (!colors.length && ["frog", "lizard", "iguana", "chameleon", "alligator", "crocodile", "mantis"].some((item) => slug.includes(item))) colors.push("green");
  if (!colors.length && ["fish", "whale", "dolphin", "shark", "ray", "seal", "walrus"].some((item) => slug.includes(item))) colors.push("gray", "blue");
  if (!colors.length) colors.push("brown", "gray");
  return [...new Set(colors)];
}

function inferPattern(text, slug) {
  const pattern = [];
  if (["stripe", "striped", "rand", "ränder", "zebra", "tiger", "rattlesnake", "chipmunk", "meerkat", "bee", "wasp", "bumblebee"].some((word) => text.includes(word) || slug.includes(word))) pattern.push("striped");
  if (["spot", "spotted", "prick", "fläck", "cheetah", "leopard", "jaguar", "giraffe", "ladybug", "fawn"].some((word) => text.includes(word) || slug.includes(word))) pattern.push("spotted");
  return [...new Set(pattern)];
}

function inferDifficulty(animal) {
  if (hardIds.has(animal.id)) return "hard";
  const slug = animal.imageId.replace("animals/", "");
  if (slug.includes("-") && !["polar-bear", "brown-bear", "sea-lion", "red-panda", "guinea-pig"].includes(slug)) return "hard";
  return "easy";
}

function buildClues(animal, attributes) {
  const clues = [...(animal.cluesSv || [])];
  const name = animal.nameSv;
  const habitats = animal.habitats || [];
  const continents = animal.continents || [];
  add(clues, `Lever ofta i miljöer som ${habitats.slice(0, 2).join(" och ") || "naturen"}.`);
  if (continents.length) add(clues, `Förknippas med ${continents.slice(0, 2).join(" och ")}.`);
  add(clues, `Är ${sizeText(attributes.size)} jämfört med många andra djur.`);
  add(clues, attributes.legs === 0 ? "Saknar ben." : `Har ${attributes.legs} ben.`);
  add(clues, attributes.hasWings ? "Har vingar." : "Har inga vingar.");
  add(clues, attributes.canFly ? "Kan flyga." : "Kan inte flyga.");
  add(clues, attributes.canSwim ? "Kan simma." : "Är inte främst känt för att simma.");
  add(clues, attributes.laysEggs ? "Lägger ägg." : "Lägger inte ägg.");
  add(clues, attributes.colors.length ? `Har ofta färger som ${attributes.colors.join(", ")}.` : "Har tydlig kroppsfärg.");
  if (attributes.pattern.includes("striped")) add(clues, "Har ränder.");
  if (attributes.pattern.includes("spotted")) add(clues, "Har prickar eller fläckar.");
  if (attributes.shellOrArmor) add(clues, "Har skal, pansar eller hårt yttre skydd.");
  if (attributes.pet) add(clues, "Kan ibland hållas som husdjur.");
  if (attributes.farmAnimal) add(clues, "Kan finnas på bondgård eller hos människor.");
  if (attributes.coldHabitat) add(clues, "Trivs i kalla områden eller förknippas med is och kyla.");
  add(clues, `Namnet är ${name}.`);

  while (clues.length < 10) add(clues, `Kan kännas igen på sitt utseende och hur den lever.`);
  return clues.slice(0, 10);
}

function add(clues, clue) {
  if (clue && !clues.includes(clue)) clues.push(clue);
}

function sizeText(size) {
  return { small: "litet", medium: "mellanstort", large: "stort", huge: "mycket stort" }[size] || "mellanstort";
}

function includesAny(value, words) {
  return words.some((word) => value.includes(word));
}
