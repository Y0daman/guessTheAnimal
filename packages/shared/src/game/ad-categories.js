export const AD_REWARD_ROWS = [
  { id: "water", title: "Vatten", icon: "🌊", requiredViews: 5, resetOnExpire: true, matches: (animal) => animal.attributes.livesNearWater || animal.attributes.canSwim || animal.habitats.some((habitat) => ["hav", "sjö", "flod", "damm", "kust", "våtmark", "rev"].some((word) => habitat.includes(word))) },
  { id: "land", title: "Land", icon: "🌿", requiredViews: 5, resetOnExpire: true, matches: (animal) => animal.attributes.mostlyLand },
  { id: "flying", title: "Flyger", icon: "🪽", requiredViews: 5, resetOnExpire: true, matches: (animal) => animal.attributes.canFly || animal.attributes.hasWings },
  { id: "africa", title: "Afrika", icon: "🦁", requiredViews: 5, resetOnExpire: true, matches: (animal) => animal.continents.includes("Afrika") },
  { id: "europe", title: "Europa", icon: "🦌", requiredViews: 5, resetOnExpire: true, matches: (animal) => animal.continents.includes("Europa") },
  { id: "asia", title: "Asien", icon: "🐼", requiredViews: 5, resetOnExpire: true, matches: (animal) => animal.continents.includes("Asien") },
  { id: "north-america", title: "Nordamerika", icon: "🦝", requiredViews: 5, resetOnExpire: true, matches: (animal) => animal.continents.includes("Nordamerika") },
  { id: "south-america", title: "Sydamerika", icon: "🦥", requiredViews: 5, resetOnExpire: true, matches: (animal) => animal.continents.includes("Sydamerika") },
  { id: "oceania", title: "Oceanien", icon: "🦘", requiredViews: 5, resetOnExpire: true, matches: (animal) => animal.continents.includes("Oceanien") },
  { id: "dinosaurs", title: "Dinosaurier", icon: "🦖", requiredViews: 20, resetOnExpire: false, grantCount: 10, matches: (animal) => animal.category === "dinosaurs" || animal.tags?.includes("dinosaurs") }
];

export function getAdRewardRow(rowId) {
  return AD_REWARD_ROWS.find((row) => row.id === rowId) || null;
}

export function getLockedAnimalsForRow(row, animals, unlockedIds) {
  return animals.filter((animal) => !unlockedIds.includes(animal.id) && row.matches(animal));
}
