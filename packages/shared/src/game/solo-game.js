import { findQuestion } from "./animal-facts.js";

export const ROUND_PHASE = {
  READY: "ready",
  PLAYING: "playing",
  WON: "won",
  GAVE_UP: "gave-up"
};

export function createReadyRound() {
  return {
    phase: ROUND_PHASE.READY,
    secretId: null,
    asked: [],
    wrongGuesses: [],
    result: null,
    lastAnswer: null,
    startedAt: null,
    finishedAt: null
  };
}

export function startSoloRound(animals, options = {}) {
  const playable = animals.filter((animal) => options.unlockedIds?.includes(animal.id));
  const deck = shuffle(playable).slice(0, Math.max(8, Math.min(options.deckSize || playable.length, playable.length)));
  const secret = deck[Math.floor(Math.random() * deck.length)] || null;

  return {
    phase: ROUND_PHASE.PLAYING,
    deckIds: deck.map((animal) => animal.id),
    secretId: secret?.id || null,
    asked: [],
    wrongGuesses: [],
    result: null,
    lastAnswer: null,
    startedAt: Date.now(),
    finishedAt: null
  };
}

export function askQuestion(round, animals, questionId) {
  if (round.phase !== ROUND_PHASE.PLAYING || round.asked.some((asked) => asked.id === questionId)) return round;
  const question = findQuestion(questionId);
  const secret = animals.find((animal) => animal.id === round.secretId);
  if (!question || !secret) return round;

  const answer = question.answer(secret) ? "yes" : "no";
  return {
    ...round,
    asked: [...round.asked, { id: questionId, answer }],
    lastAnswer: { questionId, answer, text: question.text }
  };
}

export function guessAnimal(round, animals, animalId) {
  if (round.phase !== ROUND_PHASE.PLAYING || !round.deckIds.includes(animalId)) return round;
  if (animalId === round.secretId) {
    const result = buildResult({ ...round, finishedAt: Date.now() }, animals, ROUND_PHASE.WON);
    return { ...round, phase: ROUND_PHASE.WON, result, finishedAt: Date.now() };
  }
  if (round.wrongGuesses.includes(animalId)) return round;
  return { ...round, wrongGuesses: [...round.wrongGuesses, animalId] };
}

export function giveUp(round, animals) {
  if (round.phase !== ROUND_PHASE.PLAYING) return round;
  const finishedRound = { ...round, phase: ROUND_PHASE.GAVE_UP, finishedAt: Date.now() };
  return { ...finishedRound, result: buildResult(finishedRound, animals, ROUND_PHASE.GAVE_UP) };
}

export function calculateScore(round) {
  if (round.phase === ROUND_PHASE.GAVE_UP) return 0;
  return Math.max(10, 100 - 10 * round.asked.length - 20 * round.wrongGuesses.length);
}

export function scoreToStars(score) {
  if (score >= 80) return 3;
  if (score >= 40) return 2;
  if (score > 0) return 1;
  return 0;
}

export function matchesKnownAnswers(round, animal) {
  return round.asked.every((asked) => {
    const question = findQuestion(asked.id);
    if (!question) return true;
    return (question.answer(animal) ? "yes" : "no") === asked.answer;
  });
}

export function getAnimalStatus(round, animal, unlockedIds, highlightedUnlockId) {
  if (!unlockedIds.includes(animal.id)) return "locked";
  if (animal.id === highlightedUnlockId && round.phase !== ROUND_PHASE.PLAYING) return "unlockedNew";
  if (round.phase === ROUND_PHASE.WON && animal.id === round.secretId) return "correct";
  if (round.wrongGuesses.includes(animal.id)) return "wrong";
  if (round.phase !== ROUND_PHASE.READY && !round.deckIds?.includes(animal.id)) return "outOfRound";
  if (!matchesKnownAnswers(round, animal)) return "eliminated";
  return "possible";
}

export function getPossibleAnimals(round, animals, unlockedIds) {
  return animals.filter((animal) => unlockedIds.includes(animal.id) && round.deckIds?.includes(animal.id) && matchesKnownAnswers(round, animal) && !round.wrongGuesses.includes(animal.id));
}

export function getSortedAnimals(round, animals, unlockedIds, options = {}) {
  const statusPriority = {
    possible: 0,
    correct: 0,
    unlockedNew: 1,
    wrong: 2,
    eliminated: 3,
    outOfRound: 4,
    locked: 5
  };

  return animals
    .filter((animal) => options.showLocked || unlockedIds.includes(animal.id))
    .filter((animal) => options.showWholeCatalog || round.phase === ROUND_PHASE.READY || !unlockedIds.includes(animal.id) || round.deckIds?.includes(animal.id))
    .sort((left, right) => {
      const leftStatus = getAnimalStatus(round, left, unlockedIds, options.highlightedUnlockId);
      const rightStatus = getAnimalStatus(round, right, unlockedIds, options.highlightedUnlockId);
      const priorityDiff = statusPriority[leftStatus] - statusPriority[rightStatus];
      if (priorityDiff !== 0) return priorityDiff;
      return left.name.localeCompare(right.name, "sv");
    });
}

function buildResult(round, animals, phase) {
  const secret = animals.find((animal) => animal.id === round.secretId);
  const score = phase === ROUND_PHASE.WON ? calculateScore(round) : 0;
  return {
    outcome: phase,
    secretId: round.secretId,
    secretName: secret?.name || "Okänt djur",
    score,
    stars: scoreToStars(score),
    questionsUsed: round.asked.length,
    wrongGuesses: round.wrongGuesses.length,
    durationMs: round.startedAt && round.finishedAt ? round.finishedAt - round.startedAt : 0
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}
