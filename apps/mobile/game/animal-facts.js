import { getAnimalAttributes, materializeAttributes } from "./animal-attributes.js";

export const WATER_HABITATS = ["flod", "sjö", "kust", "hav", "havsis", "våtmark", "rev", "korallrev", "ocean"];
export const COLD_WORDS = ["arktis", "havsis", "is", "kallt", "kalla", "polar", "pingvin", "isbjörn", "ren"];

const FARM_IDS = new Set(["animal-cow", "animal-pig", "animal-sheep", "animal-goat", "animal-horse", "animal-donkey", "animal-chicken", "animal-rooster", "animal-duck", "animal-goose"]);
const PET_IDS = new Set(["animal-cat", "animal-dog", "animal-rabbit", "animal-hamster", "animal-guinea-pig", "animal-mouse", "animal-rat"]);
const BIRD_IDS = new Set(["animal-eagle", "animal-owl", "animal-parrot", "animal-peacock", "animal-penguin", "animal-emperor-penguin", "animal-ostrich", "animal-duck", "animal-goose", "animal-swan", "animal-flamingo", "animal-chicken", "animal-rooster"]);
const FLYING_IDS = new Set(["animal-eagle", "animal-owl", "animal-parrot", "animal-duck", "animal-goose", "animal-swan", "animal-flamingo", "animal-bat", "animal-butterfly", "animal-bee", "animal-wasp", "animal-dragonfly", "animal-ladybug", "animal-mantis", "animal-grasshopper"]);
const FLIGHTLESS_IDS = new Set(["animal-penguin", "animal-emperor-penguin", "animal-ostrich", "animal-chicken", "animal-rooster"]);
const SWIMMING_IDS = new Set(["animal-whale", "animal-dolphin", "animal-orca", "animal-shark", "animal-clownfish", "animal-octopus", "animal-squid", "animal-jellyfish", "animal-starfish", "animal-crab", "animal-lobster", "animal-seal", "animal-sea-lion", "animal-walrus", "animal-penguin", "animal-emperor-penguin", "animal-duck", "animal-goose", "animal-swan", "animal-otter", "animal-beaver", "animal-hippopotamus", "animal-crocodile", "animal-alligator", "animal-frog", "animal-toad", "animal-salamander", "animal-platypus", "animal-turtle"]);
const EGG_IDS = new Set(["animal-eagle", "animal-owl", "animal-parrot", "animal-peacock", "animal-penguin", "animal-emperor-penguin", "animal-ostrich", "animal-duck", "animal-goose", "animal-swan", "animal-flamingo", "animal-chicken", "animal-rooster", "animal-crocodile", "animal-alligator", "animal-lizard", "animal-snake", "animal-turtle", "animal-frog", "animal-toad", "animal-salamander", "animal-platypus", "animal-butterfly", "animal-bee", "animal-wasp", "animal-dragonfly", "animal-ladybug", "animal-mantis", "animal-grasshopper", "animal-ant", "animal-spider", "animal-scorpion", "animal-snail", "animal-octopus", "animal-squid", "animal-clownfish", "animal-shark"]);
const MANY_LEGS_IDS = new Set(["animal-ant", "animal-bee", "animal-wasp", "animal-butterfly", "animal-dragonfly", "animal-ladybug", "animal-mantis", "animal-grasshopper", "animal-spider", "animal-scorpion", "animal-crab", "animal-lobster", "animal-octopus", "animal-squid", "animal-starfish"]);
const NO_LEGS_IDS = new Set(["animal-snake", "animal-whale", "animal-dolphin", "animal-orca", "animal-shark", "animal-clownfish", "animal-jellyfish", "animal-earthworm"]);
const BIG_IDS = new Set(["animal-elephant", "animal-giraffe", "animal-rhinoceros", "animal-hippopotamus", "animal-gorilla", "animal-polar-bear", "animal-brown-bear", "animal-moose", "animal-horse", "animal-cow", "animal-camel", "animal-whale", "animal-orca", "animal-shark", "animal-walrus", "animal-sea-lion", "animal-lion", "animal-tiger", "animal-zebra"]);
const SMALL_IDS = new Set(["animal-mouse", "animal-rat", "animal-hamster", "animal-guinea-pig", "animal-squirrel", "animal-hedgehog", "animal-bat", "animal-frog", "animal-toad", "animal-salamander", "animal-snail", "animal-ant", "animal-bee", "animal-wasp", "animal-butterfly", "animal-dragonfly", "animal-ladybug", "animal-mantis", "animal-grasshopper", "animal-spider", "animal-scorpion", "animal-earthworm"]);
const AQUATIC_IDS = new Set(["animal-whale", "animal-dolphin", "animal-orca", "animal-shark", "animal-clownfish", "animal-octopus", "animal-squid", "animal-jellyfish", "animal-starfish"]);
const STRIPED_IDS = new Set(["animal-tiger", "animal-zebra"]);
const SPOTTED_IDS = new Set(["animal-giraffe", "animal-cheetah", "animal-leopard", "animal-jaguar", "animal-ladybug", "animal-deer"]);
const SHELL_IDS = new Set(["animal-turtle", "animal-snail", "animal-crab", "animal-lobster", "animal-armadillo"]);
const BROWN_GRAY_IDS = new Set(["animal-elephant", "animal-rhinoceros", "animal-hippopotamus", "animal-gorilla", "animal-brown-bear", "animal-wolf", "animal-lynx", "animal-kangaroo", "animal-koala", "animal-wombat", "animal-platypus", "animal-sloth", "animal-anteater", "animal-armadillo", "animal-otter", "animal-beaver", "animal-squirrel", "animal-rabbit", "animal-hedgehog", "animal-bat", "animal-deer", "animal-moose", "animal-reindeer", "animal-horse", "animal-donkey", "animal-goat", "animal-sheep", "animal-hamster", "animal-guinea-pig", "animal-mouse", "animal-rat", "animal-walrus", "animal-seal", "animal-sea-lion"]);
const BLACK_WHITE_IDS = new Set(["animal-zebra", "animal-panda", "animal-polar-bear", "animal-penguin", "animal-emperor-penguin", "animal-orca", "animal-cow", "animal-swan", "animal-goose", "animal-sheep"]);
const YELLOW_ORANGE_IDS = new Set(["animal-lion", "animal-tiger", "animal-giraffe", "animal-cheetah", "animal-leopard", "animal-jaguar", "animal-fox", "animal-cat", "animal-chicken", "animal-rooster", "animal-duck", "animal-bee", "animal-wasp", "animal-butterfly"]);
const GREEN_IDS = new Set(["animal-alligator", "animal-crocodile", "animal-lizard", "animal-frog", "animal-toad", "animal-turtle", "animal-salamander", "animal-snake", "animal-grasshopper", "animal-mantis", "animal-parrot"]);
const BLUE_WATER_IDS = new Set(["animal-whale", "animal-dolphin", "animal-shark", "animal-jellyfish", "animal-octopus", "animal-squid", "animal-clownfish", "animal-crab", "animal-lobster", "animal-starfish"]);
const RED_PINK_IDS = new Set(["animal-flamingo", "animal-pig", "animal-crab", "animal-lobster", "animal-ladybug", "animal-fox", "animal-orangutan", "animal-rooster"]);

export function normalizeAnimal(raw) {
  const slug = raw.imageId.replace("animals/", "");
  const searchText = [raw.nameSv, raw.descriptionSv, ...(raw.habitats || []), ...(raw.continents || []), ...(raw.cluesSv || []), ...(raw.gameIdeas || [])]
    .join(" ")
    .toLowerCase();

  return {
    id: raw.id,
    slug,
    name: raw.nameSv || raw.names?.sv || slug,
    imageUrl: `/packages/shared/assets/image-cards/animals/${slug}.png`,
    description: raw.descriptionSv || "",
    difficulty: raw.difficulty || "easy",
    category: raw.category || "animals",
    tags: raw.tags || [],
    clues: raw.cluesSv || [],
    habitats: raw.habitats || [],
    continents: raw.continents || [],
    searchText,
    attributes: raw.attributes ? materializeAttributes(raw.attributes) : getAnimalAttributes(raw.id)
  };
}

export const QUESTION_GROUPS = [
  {
    id: "body",
    title: "Kropp",
    questions: [
      { id: "wings", icon: "🪽", text: "Har djuret vingar?", answer: (animal) => animal.attributes.hasWings },
      { id: "manylegs", icon: "🐾", text: "Har det fler än fyra ben?", answer: (animal) => animal.attributes.legs > 4 },
      { id: "nolegs", icon: "➰", text: "Saknar det ben?", answer: (animal) => animal.attributes.legs === 0 },
      { id: "shell", icon: "🛡️", text: "Har det skal eller pansar?", answer: (animal) => animal.attributes.shellOrArmor }
    ]
  },
  {
    id: "ability",
    title: "Kan göra",
    questions: [
      { id: "fly", icon: "☁️", text: "Kan djuret flyga?", answer: (animal) => animal.attributes.canFly },
      { id: "swim", icon: "🌊", text: "Kan djuret simma?", answer: (animal) => animal.attributes.canSwim },
      { id: "eggs", icon: "🥚", text: "Lägger det ägg?", answer: (animal) => animal.attributes.laysEggs }
    ]
  },
  {
    id: "place",
    title: "Plats",
    questions: [
      { id: "water", icon: "💧", text: "Lever det nära vatten?", answer: (animal) => animal.attributes.livesNearWater },
      { id: "land", icon: "🌿", text: "Lever det mest på land?", answer: (animal) => animal.attributes.mostlyLand },
      { id: "farm", icon: "🚜", text: "Kan det finnas på bondgård?", answer: (animal) => animal.attributes.farmAnimal },
      { id: "pet", icon: "🏠", text: "Kan det vara husdjur?", answer: (animal) => animal.attributes.pet },
      { id: "cold", icon: "❄️", text: "Gillar det kalla platser?", answer: (animal) => animal.attributes.coldHabitat }
    ]
  },
  {
    id: "look",
    title: "Utseende",
    questions: [
      { id: "big", icon: "⬆️", text: "Är det stort?", answer: (animal) => ["large", "huge"].includes(animal.attributes.size) },
      { id: "small", icon: "⬇️", text: "Är det litet?", answer: (animal) => animal.attributes.size === "small" },
      { id: "stripes", icon: "〰️", text: "Har det ränder?", answer: (animal) => animal.attributes.pattern.includes("striped") },
      { id: "spots", icon: "🔵", text: "Har det prickar eller fläckar?", answer: (animal) => animal.attributes.pattern.includes("spotted") }
    ]
  },
  {
    id: "color",
    title: "Färg",
    questions: [
      { id: "color-brown-gray", icon: "🟤", text: "Är det mest brunt eller grått?", answer: (animal) => hasAnyColor(animal, ["brown", "gray"]) },
      { id: "color-black-white", icon: "⚪", text: "Är det svart eller vitt?", answer: (animal) => hasAnyColor(animal, ["black", "white"]) },
      { id: "color-yellow-orange", icon: "🟠", text: "Är det gult eller orange?", answer: (animal) => hasAnyColor(animal, ["yellow", "orange"]) },
      { id: "color-green", icon: "🟢", text: "Är det grönt?", answer: (animal) => hasAnyColor(animal, ["green"]) },
      { id: "color-blue-water", icon: "🔵", text: "Är det blått eller havsfärgat?", answer: (animal) => hasAnyColor(animal, ["blue"]) },
      { id: "color-red-pink", icon: "🔴", text: "Är det rött eller rosa?", answer: (animal) => hasAnyColor(animal, ["red", "pink"]) }
    ]
  }
];

export const QUESTIONS = QUESTION_GROUPS.flatMap((group) => group.questions.map((question) => ({ ...question, groupId: group.id })));

export function findQuestion(questionId) {
  return QUESTIONS.find((question) => question.id === questionId) || null;
}

function hasAnyHabitat(animal, needles) {
  return animal.habitats.some((habitat) => needles.some((needle) => habitat.toLowerCase().includes(needle)));
}

function containsAny(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

function hasColor(animal, ids, words) {
  return ids.has(animal.id) || containsAny(animal.searchText, words);
}

function hasAnyColor(animal, colors) {
  return colors.some((color) => animal.attributes.colors.includes(color));
}
