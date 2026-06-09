import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { QUESTIONS } from "./animal-facts.js";
import { getLockedAnimalsForRow, isDinosaur } from "./ad-categories.js";
import { getAnimalAttributes, REQUIRED_ATTRIBUTE_KEYS } from "./animal-attributes.js";
import { askQuestion, calculateScore, createReadyRound, getPossibleAnimals, guessAnimal, matchesKnownAnswers, ROUND_PHASE } from "./solo-game.js";
import { AD_SERIES_WINDOW_MS, ADS_PER_UNLOCK, createInitialProgress, getAdSeriesState, grantAdView, grantAdViewForRow, mergeSavedProgress, normalizeAdSeries } from "./progress.js";

const lion = animal("animal-lion", "Lejon", ["savann"], "lejon gul savann");
const shark = animal("animal-shark", "Haj", ["hav"], "haj hav blå");
const zebra = animal("animal-zebra", "Zebra", ["savann"], "zebra svartvita ränder");
const clownfish = animal("animal-clownfish", "Clownfisk", ["korallrev", "hav"], "clownfisk orange liten");
const triceratops = { ...animal("dinosaur-triceratops", "Triceratops", ["land"], "dinosaurie horn"), category: "dinosaurs", tags: ["dinosaurs"] };
const animals = [lion, shark, zebra];

test("question catalog contains playable questions", () => {
  assert.ok(QUESTIONS.length >= 20);
});

test("asking a question stores the computer answer", () => {
  const round = { ...createReadyRound(), phase: ROUND_PHASE.PLAYING, deckIds: animals.map((animal) => animal.id), secretId: shark.id };
  const updated = askQuestion(round, animals, "water");
  assert.deepEqual(updated.asked, [{ id: "water", answer: "yes" }]);
  assert.equal(updated.lastAnswer.text, "Lever det nära vatten?");
});

test("known answers filter possible animals", () => {
  const round = { ...createReadyRound(), phase: ROUND_PHASE.PLAYING, deckIds: animals.map((animal) => animal.id), secretId: shark.id };
  const updated = askQuestion(round, animals, "water");
  assert.equal(matchesKnownAnswers(updated, shark), true);
  assert.equal(matchesKnownAnswers(updated, lion), false);
  assert.deepEqual(getPossibleAnimals(updated, animals, animals.map((animal) => animal.id)).map((animal) => animal.id), [shark.id]);
});

test("wrong guesses reduce score and correct guess wins", () => {
  const round = { ...createReadyRound(), phase: ROUND_PHASE.PLAYING, deckIds: animals.map((animal) => animal.id), secretId: lion.id, asked: [{ id: "water", answer: "no" }] };
  const missed = guessAnimal(round, animals, shark.id);
  const won = guessAnimal(missed, animals, lion.id);
  assert.equal(calculateScore(missed), 70);
  assert.equal(won.phase, ROUND_PHASE.WON);
  assert.equal(won.result.score, 70);
});

test("five ad views unlock one card", () => {
  let progress = mergeSavedProgress(animals, { unlockedIds: [lion.id], adViews: 0, totalAdViews: 0 });
  let unlockedAnimal = null;
  for (let index = 0; index < ADS_PER_UNLOCK; index += 1) {
    const result = grantAdView(progress, animals, Date.now(), () => 0);
    progress = result.progress;
    unlockedAnimal = result.unlockedAnimal;
  }
  assert.equal(unlockedAnimal.id, shark.id);
  assert.equal(progress.unlockedIds.includes(shark.id), true);
  assert.equal(progress.adViews, 0);
});

test("completed ad series blocks a new series until the hour ends", () => {
  let progress = mergeSavedProgress(animals, { unlockedIds: [lion.id], adViews: 0, totalAdViews: 0 });
  const start = 1000;
  for (let index = 0; index < ADS_PER_UNLOCK; index += 1) {
    progress = grantAdView(progress, animals, start + index, () => 0).progress;
  }
  const blocked = grantAdView(progress, animals, start + 10_000);
  assert.equal(blocked.blockedReason, "cooldown");
  assert.equal(getAdSeriesState(progress, start + 10_000).status, "cooldown");
});

test("unfinished ad series resets after one hour", () => {
  let progress = mergeSavedProgress(animals, { unlockedIds: [lion.id], adViews: 0, totalAdViews: 0 });
  progress = grantAdView(progress, animals, 1000, () => 0).progress;
  progress = grantAdView(progress, animals, 2000, () => 0).progress;
  const normalized = normalizeAdSeries(progress, 1000 + AD_SERIES_WINDOW_MS + 1);
  assert.equal(normalized.adViews, 0);
  assert.equal(normalized.adSeriesStartedAt, null);
});

test("ad reward rows unlock animals from their category", () => {
  let progress = mergeSavedProgress(animals, { unlockedIds: [lion.id], adRows: {} });
  let unlockedAnimal = null;
  for (let index = 0; index < ADS_PER_UNLOCK; index += 1) {
    const result = grantAdViewForRow(progress, animals, "water", 1000 + index, () => 0);
    progress = result.progress;
    unlockedAnimal = result.unlockedAnimal || unlockedAnimal;
  }
  assert.equal(unlockedAnimal.id, shark.id);
  assert.equal(progress.unlockedIds.includes(shark.id), true);
});

test("dinosaurs are not included in starter unlocks or regular rows", () => {
  const mixedAnimals = [lion, triceratops, shark, zebra];
  const progress = createInitialProgress(mixedAnimals);
  assert.equal(progress.unlockedIds.includes(triceratops.id), false);
  assert.equal(isDinosaur(triceratops), true);
  assert.equal(getLockedAnimalsForRow({ id: "land", matches: () => true }, mixedAnimals, progress.unlockedIds).some((item) => item.id === triceratops.id), false);
  assert.equal(getLockedAnimalsForRow({ id: "dinosaurs", matches: () => true }, mixedAnimals, progress.unlockedIds).some((item) => item.id === triceratops.id), true);
});

test("animal size metadata answers big and small correctly", () => {
  const bigQuestion = QUESTIONS.find((question) => question.id === "big");
  const smallQuestion = QUESTIONS.find((question) => question.id === "small");
  assert.equal(bigQuestion.answer(clownfish), false);
  assert.equal(smallQuestion.answer(clownfish), true);
  assert.equal(bigQuestion.answer(lion), true);
});

test("every animal in metadata has explicit gameplay attributes", () => {
  const metadata = JSON.parse(readFileSync(new URL("../../assets/image-cards/animals/metadata.json", import.meta.url), "utf8"));
  assert.ok(metadata.animals.length >= 225);

  for (const item of metadata.animals) {
    assert.equal(["easy", "hard"].includes(item.difficulty), true, `${item.id} missing valid difficulty`);
    assert.equal(Array.isArray(item.cluesSv), true, `${item.id} cluesSv must be array`);
    assert.equal(item.cluesSv.length, 10, `${item.id} must have exactly 10 clues`);
    assert.ok(item.attributes, `${item.id} missing attributes`);
    assert.deepEqual(Object.keys(item.attributes), REQUIRED_ATTRIBUTE_KEYS, `${item.id} must have every attribute key in canonical order`);
    assert.equal(["small", "medium", "large", "huge"].includes(item.attributes.size), true, `${item.id} has invalid size`);
    assert.equal(Array.isArray(item.attributes.colors), true, `${item.id} colors must be an array`);
    assert.equal(Array.isArray(item.attributes.pattern), true, `${item.id} pattern must be an array`);
    assert.equal(Number.isInteger(item.attributes.legs), true, `${item.id} legs must be an integer`);

    for (const key of REQUIRED_ATTRIBUTE_KEYS.filter((attributeKey) => !["size", "colors", "pattern", "legs"].includes(attributeKey))) {
      assert.equal(typeof item.attributes[key], "boolean", `${item.id}.${key} must be boolean`);
    }
  }
});

function animal(id, name, habitats, searchText) {
  return { id, name, habitats, continents: [], searchText, attributes: getAnimalAttributes(id) };
}
