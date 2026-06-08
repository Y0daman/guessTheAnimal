export const ADS_PER_UNLOCK = 5;
export const AD_SERIES_WINDOW_MS = 60 * 60 * 1000;
export const INITIAL_UNLOCKED_CARDS = 36;

export function createInitialProgress(animals) {
  return {
    unlockedIds: animals.slice(0, INITIAL_UNLOCKED_CARDS).map((animal) => animal.id),
    adViews: 0,
    totalAdViews: 0,
    adSeriesStartedAt: null,
    adSeriesCompletedAt: null,
    highlightedUnlockId: null,
    bestScore: 0,
    roundsWon: 0
  };
}

export function mergeSavedProgress(animals, saved) {
  const fallback = createInitialProgress(animals);
  const validIds = new Set(animals.map((animal) => animal.id));
  const savedIds = Array.isArray(saved?.unlockedIds) ? saved.unlockedIds.filter((id) => validIds.has(id)) : [];
  const unlockedIds = savedIds.length ? [...new Set(savedIds)] : fallback.unlockedIds;

  return {
    ...fallback,
    unlockedIds,
    adViews: Number.isInteger(saved?.adViews) ? Math.max(0, Math.min(saved.adViews, ADS_PER_UNLOCK - 1)) : fallback.adViews,
    totalAdViews: Number.isInteger(saved?.totalAdViews) ? Math.max(0, saved.totalAdViews) : fallback.totalAdViews,
    adSeriesStartedAt: Number.isInteger(saved?.adSeriesStartedAt) ? saved.adSeriesStartedAt : null,
    adSeriesCompletedAt: Number.isInteger(saved?.adSeriesCompletedAt) ? saved.adSeriesCompletedAt : null,
    highlightedUnlockId: validIds.has(saved?.highlightedUnlockId) ? saved.highlightedUnlockId : null,
    bestScore: Number.isInteger(saved?.bestScore) ? Math.max(0, saved.bestScore) : 0,
    roundsWon: Number.isInteger(saved?.roundsWon) ? Math.max(0, saved.roundsWon) : 0
  };
}

export function getAdSeriesState(progress, now = Date.now()) {
  if (!progress.adSeriesStartedAt) {
    return { status: "not-started", remainingMs: 0, adViews: 0 };
  }

  const elapsedMs = now - progress.adSeriesStartedAt;
  const remainingMs = Math.max(0, AD_SERIES_WINDOW_MS - elapsedMs);
  if (remainingMs <= 0) {
    return { status: "expired", remainingMs: 0, adViews: 0 };
  }
  if (progress.adSeriesCompletedAt) {
    return { status: "cooldown", remainingMs, adViews: 0 };
  }
  return { status: "active", remainingMs, adViews: progress.adViews };
}

export function normalizeAdSeries(progress, now = Date.now()) {
  const series = getAdSeriesState(progress, now);
  if (series.status !== "expired") return progress;
  return { ...progress, adViews: 0, adSeriesStartedAt: null, adSeriesCompletedAt: null };
}

export function grantAdView(progress, animals, now = Date.now(), random = Math.random) {
  const normalized = normalizeAdSeries(progress, now);
  const series = getAdSeriesState(normalized, now);

  if (series.status === "cooldown") {
    return { progress: normalized, unlockedAnimal: null, blockedReason: "cooldown", remainingMs: series.remainingMs };
  }

  if (normalized.unlockedIds.length >= animals.length) {
    return { progress: normalized, unlockedAnimal: null, blockedReason: "complete" };
  }

  const adSeriesStartedAt = normalized.adSeriesStartedAt || now;
  const nextAdViews = normalized.adViews + 1;
  if (nextAdViews < ADS_PER_UNLOCK) {
    return {
      progress: { ...normalized, adViews: nextAdViews, totalAdViews: normalized.totalAdViews + 1, adSeriesStartedAt, adSeriesCompletedAt: null },
      unlockedAnimal: null
    };
  }

  const lockedAnimals = animals.filter((animal) => !normalized.unlockedIds.includes(animal.id));
  const unlockedAnimal = lockedAnimals[Math.floor(random() * lockedAnimals.length)] || null;
  return {
    progress: {
      ...normalized,
      adViews: 0,
      totalAdViews: normalized.totalAdViews + 1,
      adSeriesStartedAt,
      adSeriesCompletedAt: now,
      highlightedUnlockId: unlockedAnimal?.id || null,
      unlockedIds: unlockedAnimal ? [...normalized.unlockedIds, unlockedAnimal.id] : normalized.unlockedIds
    },
    unlockedAnimal
  };
}

export function legacyGrantAdView(progress, animals) {
  if (progress.unlockedIds.length >= animals.length) {
    return { progress, unlockedAnimal: null };
  }

  const nextAdViews = progress.adViews + 1;
  if (nextAdViews < ADS_PER_UNLOCK) {
    return {
      progress: { ...progress, adViews: nextAdViews, totalAdViews: progress.totalAdViews + 1 },
      unlockedAnimal: null
    };
  }

  const lockedAnimals = animals.filter((animal) => !progress.unlockedIds.includes(animal.id));
  const unlockedAnimal = lockedAnimals[Math.floor(Math.random() * lockedAnimals.length)] || null;
  return {
    progress: {
      ...progress,
      adViews: 0,
      totalAdViews: progress.totalAdViews + 1,
      highlightedUnlockId: unlockedAnimal?.id || null,
      unlockedIds: unlockedAnimal ? [...progress.unlockedIds, unlockedAnimal.id] : progress.unlockedIds
    },
    unlockedAnimal
  };
}

export function recordRoundResult(progress, result) {
  if (!result || result.outcome !== "won") return progress;
  return {
    ...progress,
    bestScore: Math.max(progress.bestScore, result.score),
    roundsWon: progress.roundsWon + 1
  };
}
