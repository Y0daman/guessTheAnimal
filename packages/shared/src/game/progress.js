import { getAdRewardRow, getLockedAnimalsForRow, isDinosaur } from "./ad-categories.js";

export const ADS_PER_UNLOCK = 5;
export const AD_SERIES_WINDOW_MS = 60 * 60 * 1000;
export const INITIAL_UNLOCKED_CARDS = 36;

export function createInitialProgress(animals) {
  const starterAnimals = animals.filter((animal) => !isDinosaur(animal));
  return {
    unlockedIds: starterAnimals.slice(0, INITIAL_UNLOCKED_CARDS).map((animal) => animal.id),
    adViews: 0,
    totalAdViews: 0,
    adSeriesStartedAt: null,
    adSeriesCompletedAt: null,
    adRows: {},
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
    adRows: saved?.adRows && typeof saved.adRows === "object" ? saved.adRows : {},
    highlightedUnlockId: validIds.has(saved?.highlightedUnlockId) ? saved.highlightedUnlockId : null,
    bestScore: Number.isInteger(saved?.bestScore) ? Math.max(0, saved.bestScore) : 0,
    roundsWon: Number.isInteger(saved?.roundsWon) ? Math.max(0, saved.roundsWon) : 0
  };
}

export function getAdRowProgress(progress, rowId) {
  return progress.adRows?.[rowId] || { adViews: 0, totalAdViews: 0, seriesStartedAt: null, seriesCompletedAt: null, categoryUnlocked: false };
}

export function getAdRowState(progress, rowId, now = Date.now()) {
  const row = getAdRewardRow(rowId);
  const rowProgress = getAdRowProgress(progress, rowId);
  if (!row) return { status: "missing", remainingMs: 0, adViews: 0, requiredViews: 0 };

  if (rowProgress.seriesCompletedAt) {
    const remainingMs = Math.max(0, AD_SERIES_WINDOW_MS - (now - rowProgress.seriesCompletedAt));
    if (remainingMs > 0) return { status: "cooldown", remainingMs, adViews: rowProgress.adViews, requiredViews: row.requiredViews };
  }

  if (!rowProgress.seriesStartedAt) return { status: "not-started", remainingMs: 0, adViews: rowProgress.adViews, requiredViews: row.requiredViews };

  const remainingMs = Math.max(0, AD_SERIES_WINDOW_MS - (now - rowProgress.seriesStartedAt));
  if (remainingMs <= 0 && row.resetOnExpire) return { status: "expired", remainingMs: 0, adViews: 0, requiredViews: row.requiredViews };
  return { status: "active", remainingMs, adViews: rowProgress.adViews, requiredViews: row.requiredViews };
}

export function normalizeAdRows(progress, now = Date.now()) {
  const nextRows = { ...(progress.adRows || {}) };
  let changed = false;
  for (const [rowId, rowProgress] of Object.entries(nextRows)) {
    const row = getAdRewardRow(rowId);
    if (!row) continue;
    const state = getAdRowState(progress, rowId, now);
    if (state.status === "expired" && row.resetOnExpire) {
      nextRows[rowId] = { ...rowProgress, adViews: 0, seriesStartedAt: null, seriesCompletedAt: null };
      changed = true;
    } else if (rowProgress.seriesCompletedAt && now - rowProgress.seriesCompletedAt >= AD_SERIES_WINDOW_MS) {
      nextRows[rowId] = { ...rowProgress, seriesStartedAt: null, seriesCompletedAt: null };
      changed = true;
    }
  }
  return changed ? { ...progress, adRows: nextRows } : progress;
}

export function grantAdViewForRow(progress, animals, rowId, now = Date.now(), random = Math.random) {
  const row = getAdRewardRow(rowId);
  if (!row) return { progress, unlockedAnimals: [], blockedReason: "missing" };

  const normalized = normalizeAdRows(progress, now);
  const rowProgress = getAdRowProgress(normalized, rowId);
  const rowState = getAdRowState(normalized, rowId, now);
  if (rowState.status === "cooldown") return { progress: normalized, unlockedAnimals: [], blockedReason: "cooldown", remainingMs: rowState.remainingMs };

  const lockedPool = getLockedAnimalsForRow(row, animals, normalized.unlockedIds);
  if (!lockedPool.length) return { progress: normalized, unlockedAnimals: [], blockedReason: "complete" };

  const seriesStartedAt = rowProgress.seriesStartedAt || now;
  const nextAdViews = rowProgress.adViews + 1;
  const shouldGrant = nextAdViews >= row.requiredViews;
  const hitCooldownChunk = !shouldGrant && nextAdViews % ADS_PER_UNLOCK === 0;
  const grantCount = shouldGrant ? Math.min(row.grantCount || 1, lockedPool.length) : 0;
  const unlockedAnimals = grantCount ? takeRandom(lockedPool, grantCount, random) : [];
  const unlockedIds = unlockedAnimals.length ? [...normalized.unlockedIds, ...unlockedAnimals.map((animal) => animal.id)] : normalized.unlockedIds;
  const nextRowProgress = {
    ...rowProgress,
    adViews: shouldGrant && row.resetOnExpire ? 0 : nextAdViews,
    totalAdViews: rowProgress.totalAdViews + 1,
    seriesStartedAt: shouldGrant && row.resetOnExpire ? null : seriesStartedAt,
    seriesCompletedAt: shouldGrant || hitCooldownChunk ? now : null,
    categoryUnlocked: rowProgress.categoryUnlocked || shouldGrant
  };

  return {
    progress: {
      ...normalized,
      unlockedIds,
      highlightedUnlockId: unlockedAnimals[0]?.id || normalized.highlightedUnlockId,
      adRows: { ...(normalized.adRows || {}), [rowId]: nextRowProgress }
    },
    unlockedAnimal: unlockedAnimals[0] || null,
    unlockedAnimals
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

  const lockedAnimals = animals.filter((animal) => !isDinosaur(animal) && !normalized.unlockedIds.includes(animal.id));
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

  const lockedAnimals = animals.filter((animal) => !isDinosaur(animal) && !progress.unlockedIds.includes(animal.id));
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

function takeRandom(items, count, random) {
  const pool = [...items];
  const selected = [];
  while (pool.length && selected.length < count) {
    const index = Math.floor(random() * pool.length);
    selected.push(pool.splice(index, 1)[0]);
  }
  return selected;
}
