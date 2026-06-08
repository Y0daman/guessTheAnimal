import { normalizeAnimal, QUESTION_GROUPS } from "../../packages/shared/src/game/animal-facts.js";
import { ADS_PER_UNLOCK, grantAdView, mergeSavedProgress, recordRoundResult } from "../../packages/shared/src/game/progress.js";
import { askQuestion, createReadyRound, getAnimalStatus, getPossibleAnimals, getSortedAnimals, giveUp, guessAnimal, ROUND_PHASE, startSoloRound } from "../../packages/shared/src/game/solo-game.js";

const METADATA_URL = "/packages/shared/assets/image-cards/animals/metadata.json";
const STORAGE_KEY = "guessTheAnimal.demo.v2";

let animals = [];
let progress = null;
let round = createReadyRound();
let settings = {
  deckSize: 24,
  showLocked: false,
  showWholeCatalog: false
};
let modal = null;
let message = "Starta en runda. Datorn väljer ett hemligt djur bland dina upplåsta kort.";

const app = document.querySelector("#app");

init().catch((error) => {
  app.innerHTML = `<main class="app-shell"><p class="message miss">Kunde inte starta spelet: ${escapeHtml(error.message)}</p></main>`;
});

async function init() {
  const metadata = await fetch(METADATA_URL).then((response) => {
    if (!response.ok) throw new Error(`metadata kunde inte laddas (${response.status})`);
    return response.json();
  });

  animals = metadata.animals.map(normalizeAnimal).sort((left, right) => left.name.localeCompare(right.name, "sv"));
  progress = mergeSavedProgress(animals, loadProgress());
  saveProgress();
  render();
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function startRound() {
  progress = { ...progress, highlightedUnlockId: null };
  round = startSoloRound(animals, { unlockedIds: progress.unlockedIds, deckSize: settings.deckSize });
  message = `Datorn har valt ett av ${round.deckIds.length} djur. Ställ frågor och gissa när du vågar.`;
  saveProgress();
  render();
}

function handleAsk(questionId) {
  const updated = askQuestion(round, animals, questionId);
  if (updated === round) return;
  round = updated;
  message = `Datorn svarade ${round.lastAnswer.answer === "yes" ? "JA" : "NEJ"} på: ${round.lastAnswer.text}`;
  render();
}

function handleGuess(animalId) {
  const beforePhase = round.phase;
  const updated = guessAnimal(round, animals, animalId);
  if (updated === round) return;

  round = updated;
  const animal = animals.find((item) => item.id === animalId);

  if (round.phase === ROUND_PHASE.WON && beforePhase === ROUND_PHASE.PLAYING) {
    progress = recordRoundResult(progress, round.result);
    saveProgress();
    message = `Rätt! Datorns djur var ${round.result.secretName}. Du fick ${round.result.score} poäng.`;
  } else {
    message = `${animal?.name || "Det djuret"} var inte rätt. Kortet gråas ut och du kan fortsätta.`;
  }

  render();
}

function handleGiveUp() {
  round = giveUp(round, animals);
  message = `Datorns djur var ${round.result.secretName}. Starta en ny runda när du vill försöka igen.`;
  render();
}

function watchAd() {
  if (round.phase === ROUND_PHASE.PLAYING || modal) return;
  if (progress.unlockedIds.length >= animals.length) return;

  modal = { type: "ad", done: false, unlockedAnimal: null };
  render();

  window.setTimeout(() => {
    const result = grantAdView(progress, animals);
    progress = result.progress;
    saveProgress();
    modal = { type: "ad", done: true, unlockedAnimal: result.unlockedAnimal };
    message = result.unlockedAnimal
      ? `${result.unlockedAnimal.name} är upplåst och markerat i katalogen.`
      : `Reklam sedd. ${ADS_PER_UNLOCK - progress.adViews} kvar till nästa kort.`;
    render();
  }, 1300);
}

function closeModal() {
  modal = null;
  render();
}

function resetProgress() {
  progress = mergeSavedProgress(animals, {});
  round = createReadyRound();
  settings = { ...settings, showLocked: false, showWholeCatalog: false };
  message = "Demoprogress återställd. Starta en ny runda.";
  saveProgress();
  render();
}

function render() {
  if (!progress) return;
  const unlockedCount = progress.unlockedIds.length;
  const lockedCount = animals.length - unlockedCount;
  const possibleAnimals = round.phase === ROUND_PHASE.PLAYING ? getPossibleAnimals(round, animals, progress.unlockedIds) : [];
  const currentScore = round.phase === ROUND_PHASE.PLAYING ? Math.max(10, 100 - 10 * round.asked.length - 20 * round.wrongGuesses.length) : round.result?.score || progress.bestScore;
  const adDisabled = round.phase === ROUND_PHASE.PLAYING || lockedCount <= 0;

  app.innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <div class="hero-card">
          <p class="eyebrow">Riktigt lokalt spelläge</p>
          <h1>Gissa djuret</h1>
          <p class="intro">Spela själv mot datorn. Alla kort finns installerade lokalt, men vissa är låsta tills de låses upp med belönad reklam.</p>
          <div class="controls">
            <button class="button" data-action="start-round">${round.phase === ROUND_PHASE.PLAYING ? "Starta om" : "Starta runda"}</button>
            <button class="button secondary" data-action="watch-ad" ${adDisabled ? "disabled" : ""}>Titta på reklam</button>
            ${round.phase === ROUND_PHASE.PLAYING ? `<button class="button ghost" data-action="give-up">Visa svaret</button>` : ""}
            <button class="button ghost" data-action="reset-progress">Återställ</button>
          </div>
        </div>
        <div class="status-board">
          <div class="stat"><strong>${round.phase === ROUND_PHASE.PLAYING ? possibleAnimals.length : "-"}</strong><span>Möjliga djur</span></div>
          <div class="stat"><strong>${currentScore}</strong><span>${round.phase === ROUND_PHASE.PLAYING ? "Poäng just nu" : "Bästa poäng"}</span></div>
          <div class="stat"><strong>${unlockedCount}/${animals.length}</strong><span>Upplåsta kort</span></div>
          <div class="stat"><strong>${progress.adViews}/${ADS_PER_UNLOCK}</strong><span>Reklam till kort</span></div>
        </div>
      </section>

      <section class="game-layout">
        <aside class="panel">
          ${renderRoundPanel(lockedCount)}
          ${renderQuestionPanel()}
        </aside>

        <section class="panel">
          <p class="message ${round.phase === ROUND_PHASE.WON ? "win" : round.wrongGuesses.length || round.phase === ROUND_PHASE.GAVE_UP ? "miss" : ""}">${escapeHtml(message)}</p>
          ${renderResultPanel()}
          <div class="animal-toolbar">
            <h2>${round.phase === ROUND_PHASE.PLAYING ? "Rundans djur" : "Djurkatalog"}</h2>
            <div class="toolbar-toggles">
              <label><input type="checkbox" data-action="toggle-whole-catalog" ${settings.showWholeCatalog ? "checked" : ""} /> Hela katalogen</label>
              <label><input type="checkbox" data-action="toggle-locked" ${settings.showLocked ? "checked" : ""} /> Visa låsta</label>
            </div>
          </div>
          <div class="animal-grid">
            ${getSortedAnimals(round, animals, progress.unlockedIds, settingsWithHighlight()).map(renderAnimalCard).join("")}
          </div>
        </section>
      </section>

      <p class="footer-note">Det här spelläget kör helt utan backend. Backend behövs senare för online multiplayer, servervaliderade köp och kortpaket som ska kunna levereras utan appuppdatering.</p>
    </main>
    ${modal ? renderModal() : ""}
  `;
}

function settingsWithHighlight() {
  return { ...settings, highlightedUnlockId: progress.highlightedUnlockId };
}

function renderRoundPanel(lockedCount) {
  const secret = animals.find((animal) => animal.id === round.secretId);
  return `
    <h2>Runda</h2>
    <div class="answer-card ${round.phase === ROUND_PHASE.PLAYING ? "covered" : ""}">
      <div class="label">Hemligt djur</div>
      <div class="answer">${round.phase === ROUND_PHASE.PLAYING ? "? ? ?" : escapeHtml(secret?.name || "Inte valt")}</div>
      <div class="hint">${round.phase === ROUND_PHASE.PLAYING ? "Datorn svarar på dina frågor, men bilden visas först efter rätt gissning eller om du ger upp." : "Välj rundstorlek och starta när du är redo."}</div>
    </div>

    <div class="setup-box">
      <strong>Rundstorlek</strong>
      <div class="deck-options">
        ${[12, 24, 36, 50].map((size) => `<button class="pill ${settings.deckSize === size ? "active" : ""}" data-action="set-deck-size" data-size="${size}">${size}</button>`).join("")}
      </div>
      <small>Rundan använder bara upplåsta kort. Mindre runda är enklare för barn.</small>
    </div>

    <div class="ad-box">
      <strong>Lås upp fler kort</strong>
      <span>${lockedCount > 0 ? `Se ${ADS_PER_UNLOCK} reklamklipp mellan rundor för att låsa upp nästa kort. ${lockedCount} kort är låsta.` : "Alla kort är upplåsta."}</span>
      <div class="ad-meter"><span style="width: ${(progress.adViews / ADS_PER_UNLOCK) * 100}%"></span></div>
      <button class="button secondary" data-action="watch-ad" ${round.phase === ROUND_PHASE.PLAYING || lockedCount <= 0 ? "disabled" : ""}>Simulera reklam</button>
    </div>
  `;
}

function renderQuestionPanel() {
  return `
    <h2 style="margin-top: 18px;">Frågor</h2>
    <div class="question-sections">
      ${QUESTION_GROUPS.map(renderQuestionGroup).join("")}
    </div>
  `;
}

function renderQuestionGroup(group) {
  return `
    <section class="question-section">
      <h3>${escapeHtml(group.title)}</h3>
      <div class="question-grid">
        ${group.questions.map(renderQuestion).join("")}
      </div>
    </section>
  `;
}

function renderQuestion(question) {
  const asked = round.asked.find((item) => item.id === question.id);
  const disabled = round.phase !== ROUND_PHASE.PLAYING || asked;
  return `
    <button class="question-button ${asked ? "used" : ""}" data-action="ask" data-question-id="${question.id}" ${disabled ? "disabled" : ""}>
      <span class="icon">${question.icon}</span>
      <strong>${escapeHtml(question.text)}</strong>
      ${asked ? `<span class="answer-badge">${asked.answer === "yes" ? "JA" : "NEJ"}</span>` : ""}
    </button>
  `;
}

function renderResultPanel() {
  if (![ROUND_PHASE.WON, ROUND_PHASE.GAVE_UP].includes(round.phase) || !round.result) return "";
  const secret = animals.find((animal) => animal.id === round.secretId);
  return `
    <section class="result-panel">
      <img src="${secret?.imageUrl}" alt="${escapeHtml(secret?.name || "Hemligt djur")}" />
      <div>
        <p class="eyebrow">${round.phase === ROUND_PHASE.WON ? "Rätt gissat" : "Svaret"}</p>
        <h2>${escapeHtml(round.result.secretName)}</h2>
        <p>${escapeHtml(secret?.description || "")}</p>
        <div class="score-line">${"★".repeat(round.result.stars)}${"☆".repeat(3 - round.result.stars)} · ${round.result.score} poäng · ${round.result.questionsUsed} frågor · ${round.result.wrongGuesses} felgissningar</div>
      </div>
    </section>
  `;
}

function renderAnimalCard(animal) {
  const status = getAnimalStatus(round, animal, progress.unlockedIds, progress.highlightedUnlockId);
  const disabled = round.phase !== ROUND_PHASE.PLAYING || status === "locked" || status === "outOfRound";
  const label = getStatusLabel(status);

  return `
    <button class="animal-card ${status}" data-action="guess" data-animal-id="${animal.id}" ${disabled ? "disabled" : ""}>
      ${label ? `<span class="${status === "locked" ? "lock-badge" : "state-badge"} ${status === "unlockedNew" ? "new-badge" : ""}">${label}</span>` : ""}
      <img src="${animal.imageUrl}" alt="${escapeHtml(animal.name)}" loading="lazy" />
      <strong>${escapeHtml(animal.name)}</strong>
      <small>${escapeHtml(animal.habitats.slice(0, 2).join(", ") || animal.continents.slice(0, 2).join(", "))}</small>
    </button>
  `;
}

function getStatusLabel(status) {
  if (status === "locked") return "Låst";
  if (status === "unlockedNew") return "Nytt";
  if (status === "wrong") return "Inte den";
  if (status === "eliminated") return "Bort";
  if (status === "correct") return "Rätt";
  if (status === "outOfRound") return "Ej med";
  return "";
}

function renderModal() {
  if (modal.type !== "ad") return "";
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal">
        <h2>${modal.done ? "Reklam klar" : "Reklam visas"}</h2>
        <p>${modal.done ? "Belöningen är sparad lokalt på enheten." : "I en riktig app kopplas detta till rewarded ads via annons-SDK:t."}</p>
        <div class="ad-screen">${modal.done ? (modal.unlockedAnimal ? `Nytt kort: ${escapeHtml(modal.unlockedAnimal.name)}` : `${ADS_PER_UNLOCK - progress.adViews} kvar till nästa kort`) : "🐾 Djursponsrad paus 🐾"}</div>
        <button class="button" data-action="close-modal" ${modal.done ? "" : "disabled"}>Fortsätt</button>
      </div>
    </div>
  `;
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

  if (target.dataset.action === "start-round") startRound();
  if (target.dataset.action === "watch-ad") watchAd();
  if (target.dataset.action === "give-up") handleGiveUp();
  if (target.dataset.action === "reset-progress") resetProgress();
  if (target.dataset.action === "ask") handleAsk(target.dataset.questionId);
  if (target.dataset.action === "guess") handleGuess(target.dataset.animalId);
  if (target.dataset.action === "close-modal") closeModal();
  if (target.dataset.action === "set-deck-size") {
    settings = { ...settings, deckSize: Number(target.dataset.size) };
    render();
  }
});

app.addEventListener("change", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  if (target.dataset.action === "toggle-locked") settings = { ...settings, showLocked: target.checked };
  if (target.dataset.action === "toggle-whole-catalog") settings = { ...settings, showWholeCatalog: target.checked };
  render();
});
