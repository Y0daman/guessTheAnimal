const METADATA_URL = "/packages/shared/assets/image-cards/animals/metadata.json";
const STORAGE_KEY = "guessTheAnimal.demo.v1";
const INITIAL_UNLOCKED_CARDS = 36;
const ADS_PER_UNLOCK = 5;

const WATER_HABITATS = ["flod", "sjö", "kust", "hav", "havsis", "våtmark", "rev", "korallrev", "ocean"];
const LAND_HABITATS = ["savann", "gräsmark", "skog", "djungel", "regnskog", "berg", "äng", "öken", "gård", "bondgård", "park", "stad", "tundra", "buskmark", "trädgård"];
const COLD_WORDS = ["arktis", "havsis", "is", "kallt", "kalla", "polar", "pingvin", "isbjörn", "ren"];
const FARM_IDS = new Set(["animal-cow", "animal-pig", "animal-sheep", "animal-goat", "animal-horse", "animal-donkey", "animal-chicken", "animal-rooster", "animal-duck", "animal-goose"]);
const PET_IDS = new Set(["animal-cat", "animal-dog", "animal-rabbit", "animal-hamster", "animal-guinea-pig", "animal-mouse", "animal-rat"]);
const BIRD_IDS = new Set(["animal-eagle", "animal-owl", "animal-parrot", "animal-peacock", "animal-penguin", "animal-emperor-penguin", "animal-ostrich", "animal-duck", "animal-goose", "animal-swan", "animal-flamingo", "animal-chicken", "animal-rooster"]);
const FLYING_IDS = new Set(["animal-eagle", "animal-owl", "animal-parrot", "animal-duck", "animal-goose", "animal-swan", "animal-flamingo", "animal-bat", "animal-butterfly", "animal-bee", "animal-wasp", "animal-dragonfly", "animal-ladybug", "animal-mantis", "animal-grasshopper"]);
const SWIMMING_IDS = new Set(["animal-whale", "animal-dolphin", "animal-orca", "animal-shark", "animal-clownfish", "animal-octopus", "animal-squid", "animal-jellyfish", "animal-starfish", "animal-crab", "animal-lobster", "animal-seal", "animal-sea-lion", "animal-walrus", "animal-penguin", "animal-emperor-penguin", "animal-duck", "animal-goose", "animal-swan", "animal-otter", "animal-beaver", "animal-hippopotamus", "animal-crocodile", "animal-alligator", "animal-frog", "animal-toad", "animal-salamander", "animal-platypus", "animal-turtle"]);
const EGG_IDS = new Set(["animal-eagle", "animal-owl", "animal-parrot", "animal-peacock", "animal-penguin", "animal-emperor-penguin", "animal-ostrich", "animal-duck", "animal-goose", "animal-swan", "animal-flamingo", "animal-chicken", "animal-rooster", "animal-crocodile", "animal-alligator", "animal-lizard", "animal-snake", "animal-turtle", "animal-frog", "animal-toad", "animal-salamander", "animal-platypus", "animal-butterfly", "animal-bee", "animal-wasp", "animal-dragonfly", "animal-ladybug", "animal-mantis", "animal-grasshopper", "animal-ant", "animal-spider", "animal-scorpion", "animal-snail", "animal-octopus", "animal-squid", "animal-fish", "animal-clownfish", "animal-shark"]);
const MANY_LEGS_IDS = new Set(["animal-ant", "animal-bee", "animal-wasp", "animal-butterfly", "animal-dragonfly", "animal-ladybug", "animal-mantis", "animal-grasshopper", "animal-spider", "animal-scorpion", "animal-crab", "animal-lobster", "animal-octopus", "animal-squid", "animal-starfish"]);
const NO_LEGS_IDS = new Set(["animal-snake", "animal-whale", "animal-dolphin", "animal-orca", "animal-shark", "animal-clownfish", "animal-jellyfish", "animal-earthworm"]);
const BIG_IDS = new Set(["animal-elephant", "animal-giraffe", "animal-rhinoceros", "animal-hippopotamus", "animal-gorilla", "animal-polar-bear", "animal-brown-bear", "animal-moose", "animal-horse", "animal-cow", "animal-camel", "animal-whale", "animal-orca", "animal-shark", "animal-walrus", "animal-sea-lion", "animal-lion", "animal-tiger", "animal-zebra"]);
const SMALL_IDS = new Set(["animal-mouse", "animal-rat", "animal-hamster", "animal-guinea-pig", "animal-squirrel", "animal-hedgehog", "animal-bat", "animal-frog", "animal-toad", "animal-salamander", "animal-snail", "animal-ant", "animal-bee", "animal-wasp", "animal-butterfly", "animal-dragonfly", "animal-ladybug", "animal-mantis", "animal-grasshopper", "animal-spider", "animal-scorpion", "animal-earthworm"]);
const STRIPED_IDS = new Set(["animal-tiger", "animal-zebra", "animal-raccoon"]);
const SPOTTED_IDS = new Set(["animal-giraffe", "animal-cheetah", "animal-leopard", "animal-jaguar", "animal-ladybug", "animal-deer"]);
const SHELL_IDS = new Set(["animal-turtle", "animal-snail", "animal-crab", "animal-lobster", "animal-armadillo"]);
const BROWN_GRAY_IDS = new Set(["animal-elephant", "animal-rhinoceros", "animal-hippopotamus", "animal-gorilla", "animal-brown-bear", "animal-wolf", "animal-lynx", "animal-kangaroo", "animal-koala", "animal-wombat", "animal-platypus", "animal-sloth", "animal-anteater", "animal-armadillo", "animal-otter", "animal-beaver", "animal-squirrel", "animal-rabbit", "animal-hedgehog", "animal-bat", "animal-deer", "animal-moose", "animal-reindeer", "animal-horse", "animal-donkey", "animal-goat", "animal-sheep", "animal-hamster", "animal-guinea-pig", "animal-mouse", "animal-rat", "animal-walrus", "animal-seal", "animal-sea-lion"]);
const BLACK_WHITE_IDS = new Set(["animal-zebra", "animal-panda", "animal-polar-bear", "animal-penguin", "animal-emperor-penguin", "animal-orca", "animal-cow", "animal-swan", "animal-goose", "animal-sheep", "animal-skunk"]);
const YELLOW_ORANGE_IDS = new Set(["animal-lion", "animal-tiger", "animal-giraffe", "animal-cheetah", "animal-leopard", "animal-jaguar", "animal-fox", "animal-cat", "animal-chicken", "animal-rooster", "animal-duck", "animal-bee", "animal-wasp", "animal-butterfly"]);
const GREEN_IDS = new Set(["animal-alligator", "animal-crocodile", "animal-lizard", "animal-frog", "animal-toad", "animal-turtle", "animal-salamander", "animal-snake", "animal-grasshopper", "animal-mantis", "animal-parrot"]);
const BLUE_WATER_IDS = new Set(["animal-whale", "animal-dolphin", "animal-shark", "animal-jellyfish", "animal-octopus", "animal-squid", "animal-clownfish", "animal-crab", "animal-lobster", "animal-starfish"]);
const RED_PINK_IDS = new Set(["animal-flamingo", "animal-pig", "animal-crab", "animal-lobster", "animal-ladybug", "animal-fox", "animal-orangutan", "animal-rooster"]);

const QUESTIONS = [
  { id: "wings", icon: "🪽", text: "Har djuret vingar?", answer: (animal) => BIRD_IDS.has(animal.id) || FLYING_IDS.has(animal.id) },
  { id: "fly", icon: "☁️", text: "Kan djuret flyga?", answer: (animal) => FLYING_IDS.has(animal.id) && !["animal-penguin", "animal-emperor-penguin", "animal-ostrich", "animal-chicken", "animal-rooster"].includes(animal.id) },
  { id: "swim", icon: "🌊", text: "Kan djuret simma?", answer: (animal) => SWIMMING_IDS.has(animal.id) || hasAnyHabitat(animal, WATER_HABITATS) },
  { id: "water", icon: "💧", text: "Lever det nära vatten?", answer: (animal) => hasAnyHabitat(animal, WATER_HABITATS) || SWIMMING_IDS.has(animal.id) },
  { id: "land", icon: "🌿", text: "Lever det mest på land?", answer: (animal) => !isMostlyAquatic(animal) },
  { id: "eggs", icon: "🥚", text: "Lägger det ägg?", answer: (animal) => EGG_IDS.has(animal.id) },
  { id: "manylegs", icon: "🐾", text: "Har det fler än fyra ben?", answer: (animal) => MANY_LEGS_IDS.has(animal.id) },
  { id: "nolegs", icon: "➰", text: "Saknar det ben?", answer: (animal) => NO_LEGS_IDS.has(animal.id) },
  { id: "big", icon: "⬆️", text: "Är det stort?", answer: (animal) => BIG_IDS.has(animal.id) },
  { id: "small", icon: "⬇️", text: "Är det litet?", answer: (animal) => SMALL_IDS.has(animal.id) },
  { id: "farm", icon: "🚜", text: "Kan det finnas på bondgård?", answer: (animal) => FARM_IDS.has(animal.id) },
  { id: "pet", icon: "🏠", text: "Kan det vara husdjur?", answer: (animal) => PET_IDS.has(animal.id) },
  { id: "cold", icon: "❄️", text: "Gillar det kalla platser?", answer: (animal) => containsAny(animal.searchText, COLD_WORDS) },
  { id: "stripes", icon: "〰️", text: "Har det ränder?", answer: (animal) => STRIPED_IDS.has(animal.id) || containsAny(animal.searchText, ["rand", "ränder", "randig"]) },
  { id: "spots", icon: "🔵", text: "Har det prickar eller fläckar?", answer: (animal) => SPOTTED_IDS.has(animal.id) || containsAny(animal.searchText, ["prick", "fläck", "fläckig"]) },
  { id: "shell", icon: "🛡️", text: "Har det skal eller pansar?", answer: (animal) => SHELL_IDS.has(animal.id) || containsAny(animal.searchText, ["skal", "pansar"]) },
  { id: "color-brown-gray", icon: "🟤", text: "Är det mest brunt eller grått?", answer: (animal) => hasColor(animal, BROWN_GRAY_IDS, ["brun", "grå"]) },
  { id: "color-black-white", icon: "⚪", text: "Är det svart eller vitt?", answer: (animal) => hasColor(animal, BLACK_WHITE_IDS, ["svart", "vit", "svartvit", "svartvita"]) },
  { id: "color-yellow-orange", icon: "🟠", text: "Är det gult eller orange?", answer: (animal) => hasColor(animal, YELLOW_ORANGE_IDS, ["gul", "gyllen", "orange", "rödorange"]) },
  { id: "color-green", icon: "🟢", text: "Är det grönt?", answer: (animal) => hasColor(animal, GREEN_IDS, ["grön"]) },
  { id: "color-blue-water", icon: "🔵", text: "Är det blått eller havsfärgat?", answer: (animal) => hasColor(animal, BLUE_WATER_IDS, ["blå", "hav", "vatten"]) },
  { id: "color-red-pink", icon: "🔴", text: "Är det rött eller rosa?", answer: (animal) => hasColor(animal, RED_PINK_IDS, ["röd", "rosa", "rödorange"]) }
];

let animals = [];
let state = {
  secretId: null,
  asked: [],
  wrongGuesses: [],
  result: null,
  showLocked: false,
  unlockedIds: [],
  adViews: 0,
  totalAdViews: 0,
  highlightedUnlockId: null,
  modal: null,
  message: "Datorn har valt ett hemligt djur. Ställ frågor och tryck sedan på ett djur för att gissa."
};

const app = document.querySelector("#app");

init().catch((error) => {
  app.innerHTML = `<main class="app-shell"><p class="message miss">Kunde inte starta demot: ${escapeHtml(error.message)}</p></main>`;
});

async function init() {
  const metadata = await fetch(METADATA_URL).then((response) => {
    if (!response.ok) {
      throw new Error(`metadata kunde inte laddas (${response.status})`);
    }
    return response.json();
  });

  animals = metadata.animals.map(normalizeAnimal).sort((left, right) => left.name.localeCompare(right.name, "sv"));
  state = { ...state, ...loadProgress() };

  if (!state.unlockedIds?.length) {
    state.unlockedIds = animals.slice(0, INITIAL_UNLOCKED_CARDS).map((animal) => animal.id);
  }

  startRound();
  render();
}

function normalizeAnimal(raw) {
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
    clues: raw.cluesSv || [],
    habitats: raw.habitats || [],
    continents: raw.continents || [],
    searchText
  };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      unlockedIds: Array.isArray(saved.unlockedIds) ? saved.unlockedIds : [],
      adViews: Number.isInteger(saved.adViews) ? saved.adViews : 0,
      totalAdViews: Number.isInteger(saved.totalAdViews) ? saved.totalAdViews : 0
    };
  } catch {
    return { unlockedIds: [], adViews: 0, totalAdViews: 0 };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    unlockedIds: state.unlockedIds,
    adViews: state.adViews,
    totalAdViews: state.totalAdViews
  }));
}

function startRound() {
  const playable = getUnlockedAnimals();
  const secret = playable[Math.floor(Math.random() * playable.length)];
  state.secretId = secret?.id || null;
  state.asked = [];
  state.wrongGuesses = [];
  state.result = null;
  state.message = "Datorn har valt ett hemligt djur. Ställ frågor och tryck sedan på ett djur för att gissa.";
}

function askQuestion(questionId) {
  if (state.result) return;
  const question = QUESTIONS.find((item) => item.id === questionId);
  const secret = getSecretAnimal();
  if (!question || !secret || state.asked.some((item) => item.id === questionId)) return;

  const answer = question.answer(secret) ? "yes" : "no";
  state.asked = [...state.asked, { id: questionId, answer }];
  state.message = `Datorn svarade ${answer === "yes" ? "JA" : "NEJ"} på: ${question.text}`;
  render();
}

function guessAnimal(animalId) {
  if (state.result) return;
  const animal = animals.find((item) => item.id === animalId);
  if (!animal || !isUnlocked(animal.id)) return;

  if (animal.id === state.secretId) {
    const score = calculateScore();
    state.result = { outcome: "win", score, stars: scoreToStars(score) };
    state.message = `Rätt! Datorns djur var ${animal.name}. Du fick ${score} poäng och ${"★".repeat(state.result.stars)}.`;
  } else if (!state.wrongGuesses.includes(animal.id)) {
    state.wrongGuesses = [...state.wrongGuesses, animal.id];
    state.message = `${animal.name} var inte rätt, men bra gissning. Fortsätt leta!`;
  }

  render();
}

function calculateScore() {
  return Math.max(10, 100 - 10 * state.asked.length - 20 * state.wrongGuesses.length);
}

function scoreToStars(score) {
  if (score >= 80) return 3;
  if (score >= 40) return 2;
  return 1;
}

function getSecretAnimal() {
  return animals.find((animal) => animal.id === state.secretId);
}

function getUnlockedAnimals() {
  return animals.filter((animal) => isUnlocked(animal.id));
}

function isUnlocked(animalId) {
  return state.unlockedIds.includes(animalId);
}

function unlockNextAnimal() {
  const locked = animals.filter((animal) => !isUnlocked(animal.id));
  if (!locked.length) return null;
  const animal = locked[0];
  state.unlockedIds = [...state.unlockedIds, animal.id];
  state.highlightedUnlockId = animal.id;
  return animal;
}

function watchAd() {
  const lockedCount = animals.length - state.unlockedIds.length;
  if (lockedCount <= 0 || state.modal) return;
  state.modal = { type: "ad", done: false };
  render();

  window.setTimeout(() => {
    state.adViews += 1;
    state.totalAdViews += 1;
    let unlockedAnimal = null;
    if (state.adViews >= ADS_PER_UNLOCK) {
      state.adViews = 0;
      unlockedAnimal = unlockNextAnimal();
    }
    saveProgress();
    state.modal = { type: "ad", done: true, unlockedAnimal };
    state.message = unlockedAnimal
      ? `Reklambonus klar! ${unlockedAnimal.name} är nu upplåst.`
      : `Reklam sedd. ${ADS_PER_UNLOCK - state.adViews} kvar till nästa kort.`;
    render();
  }, 1300);
}

function closeModal() {
  state.modal = null;
  render();
}

function resetProgress() {
  state.unlockedIds = animals.slice(0, INITIAL_UNLOCKED_CARDS).map((animal) => animal.id);
  state.adViews = 0;
  state.totalAdViews = 0;
  state.highlightedUnlockId = null;
  saveProgress();
  startRound();
  render();
}

function getAnimalStatus(animal) {
  if (!isUnlocked(animal.id)) return "locked";
  if (state.result?.outcome === "win" && animal.id === state.secretId) return "correct";
  if (state.wrongGuesses.includes(animal.id)) return "wrong";
  if (!matchesKnownAnswers(animal)) return "eliminated";
  return "possible";
}

function matchesKnownAnswers(animal) {
  return state.asked.every((asked) => {
    const question = QUESTIONS.find((item) => item.id === asked.id);
    if (!question) return true;
    const value = question.answer(animal) ? "yes" : "no";
    return value === asked.answer;
  });
}

function getVisibleAnimals() {
  const statusPriority = {
    possible: 0,
    correct: 0,
    unlockedNew: 1,
    wrong: 2,
    eliminated: 3,
    locked: 4
  };

  return animals
    .filter((animal) => state.showLocked || isUnlocked(animal.id))
    .sort((left, right) => {
      const leftStatus = getAnimalStatus(left);
      const rightStatus = getAnimalStatus(right);
      const priorityDiff = statusPriority[leftStatus] - statusPriority[rightStatus];
      if (priorityDiff !== 0) return priorityDiff;
      return left.name.localeCompare(right.name, "sv");
    });
}

function render() {
  const possibleCount = getUnlockedAnimals().filter(matchesKnownAnswers).filter((animal) => !state.wrongGuesses.includes(animal.id)).length;
  const unlockedCount = state.unlockedIds.length;
  const lockedCount = animals.length - unlockedCount;
  const score = state.result?.score || calculateScore();

  app.innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <div class="hero-card">
          <p class="eyebrow">Solo demo utan backend</p>
          <h1>Gissa djuret</h1>
          <p class="intro">Datorn har valt ett av dina upplåsta djur. Ställ barnvänliga ja/nej-frågor, se vilka kort som gråas ut och gissa när du vågar.</p>
          <div class="controls">
            <button class="button" data-action="new-round">Ny runda</button>
            <button class="button secondary" data-action="watch-ad" ${lockedCount <= 0 ? "disabled" : ""}>Titta på reklam</button>
            <button class="button ghost" data-action="reset-progress">Återställ demo</button>
          </div>
        </div>
        <div class="status-board">
          <div class="stat"><strong>${possibleCount}</strong><span>Möjliga djur</span></div>
          <div class="stat"><strong>${score}</strong><span>Poäng just nu</span></div>
          <div class="stat"><strong>${unlockedCount}/${animals.length}</strong><span>Upplåsta kort</span></div>
          <div class="stat"><strong>${state.adViews}/${ADS_PER_UNLOCK}</strong><span>Reklam till kort</span></div>
        </div>
      </section>

      <section class="game-layout">
        <aside class="panel">
          <h2>Datorns svar</h2>
          <div class="answer-card">
            <div class="label">Hemligt djur</div>
            <div class="answer">${state.result ? escapeHtml(getSecretAnimal()?.name || "?") : "? ? ?"}</div>
            <div class="hint">${state.result ? escapeHtml(getSecretAnimal()?.clues?.[0] || "Bra spelat!") : "Datorn svarar bara på frågorna. Bilden visas när du gissar rätt."}</div>
          </div>

          <div class="ad-box">
            <strong>Lås upp fler kort</strong>
            <span>${lockedCount > 0 ? `Se ${ADS_PER_UNLOCK} reklamklipp för att låsa upp nästa kort. ${lockedCount} kort är låsta.` : "Alla kort är upplåsta i den här installationen."}</span>
            <div class="ad-meter"><span style="width: ${(state.adViews / ADS_PER_UNLOCK) * 100}%"></span></div>
            <button class="button secondary" data-action="watch-ad" ${lockedCount <= 0 ? "disabled" : ""}>Simulera reklam</button>
          </div>

          <h2 style="margin-top: 18px;">Frågor</h2>
          <div class="question-grid">
            ${QUESTIONS.map(renderQuestion).join("")}
          </div>
        </aside>

        <section class="panel">
          <p class="message ${state.result ? "win" : state.wrongGuesses.length ? "miss" : ""}">${escapeHtml(state.message)}</p>
          <div class="animal-toolbar">
            <h2>Djurkort</h2>
            <label><input type="checkbox" data-action="toggle-locked" ${state.showLocked ? "checked" : ""} /> Visa låsta kort</label>
          </div>
          <div class="animal-grid">
            ${getVisibleAnimals().map(renderAnimalCard).join("")}
          </div>
        </section>
      </section>

      <p class="footer-note">Backend behövs inte för den här soloversionen. Den blir aktuell för online multiplayer, serverstyrda köp/entitlements, synk mellan enheter och kortpaket som ska kunna släppas utan appuppdatering.</p>
    </main>
    ${state.modal ? renderModal() : ""}
  `;
}

function renderQuestion(question) {
  const asked = state.asked.find((item) => item.id === question.id);
  return `
    <button class="question-button ${asked ? "used" : ""}" data-action="ask" data-question-id="${question.id}" ${asked || state.result ? "disabled" : ""}>
      <span class="icon">${question.icon}</span>
      <strong>${escapeHtml(question.text)}</strong>
      ${asked ? `<span class="answer-badge">${asked.answer === "yes" ? "JA" : "NEJ"}</span>` : ""}
    </button>
  `;
}

function renderAnimalCard(animal) {
  const baseStatus = getAnimalStatus(animal);
  const isNewUnlock = animal.id === state.highlightedUnlockId && baseStatus !== "locked";
  const status = isNewUnlock ? "unlockedNew" : baseStatus;
  const label = status === "locked" ? "Låst" : status === "wrong" ? "Inte den" : status === "eliminated" ? "Bort" : status === "correct" ? "Rätt" : "";
  return `
    <button class="animal-card ${status}" data-action="guess" data-animal-id="${animal.id}" ${status === "locked" ? "disabled" : ""}>
      ${isNewUnlock ? `<span class="state-badge new-badge">Nytt</span>` : label ? `<span class="${status === "locked" ? "lock-badge" : "state-badge"}">${label}</span>` : ""}
      <img src="${animal.imageUrl}" alt="${escapeHtml(animal.name)}" loading="lazy" />
      <strong>${escapeHtml(animal.name)}</strong>
      <small>${escapeHtml(animal.habitats.slice(0, 2).join(", ") || animal.continents.slice(0, 2).join(", "))}</small>
    </button>
  `;
}

function renderModal() {
  const modal = state.modal;
  if (modal.type !== "ad") return "";
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal">
        <h2>${modal.done ? "Reklam klar" : "Reklam visas"}</h2>
        <p>${modal.done ? "Tack! Progressen är sparad lokalt på enheten." : "Det här simulerar ett rewarded ad-klipp. I en riktig app kopplas knappen till annons-SDK:t."}</p>
        <div class="ad-screen">${modal.done ? (modal.unlockedAnimal ? `Nytt kort: ${escapeHtml(modal.unlockedAnimal.name)}` : `${ADS_PER_UNLOCK - state.adViews} kvar till nästa kort`) : "🐾 Djursponsrad paus 🐾"}</div>
        <button class="button" data-action="close-modal" ${modal.done ? "" : "disabled"}>Fortsätt</button>
      </div>
    </div>
  `;
}

function hasAnyHabitat(animal, needles) {
  return animal.habitats.some((habitat) => needles.some((needle) => habitat.toLowerCase().includes(needle)));
}

function isMostlyAquatic(animal) {
  return ["animal-whale", "animal-dolphin", "animal-orca", "animal-shark", "animal-clownfish", "animal-octopus", "animal-squid", "animal-jellyfish", "animal-starfish"].includes(animal.id);
}

function containsAny(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

function hasColor(animal, ids, words) {
  return ids.has(animal.id) || containsAny(animal.searchText, words);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "new-round") {
    startRound();
    render();
  }
  if (action === "watch-ad") watchAd();
  if (action === "reset-progress") resetProgress();
  if (action === "ask") askQuestion(target.dataset.questionId);
  if (action === "guess") guessAnimal(target.dataset.animalId);
  if (action === "close-modal") closeModal();
});

app.addEventListener("change", (event) => {
  const target = event.target.closest("[data-action='toggle-locked']");
  if (!target) return;
  state.showLocked = target.checked;
  render();
});
