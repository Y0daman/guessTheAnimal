import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const imageCardsRoot = resolve(projectRoot, "packages/shared/assets/image-cards");
const animalMetadataPath = resolve(imageCardsRoot, "animals/metadata.json");
const outputPath = resolve(imageCardsRoot, "gallery.html");

const metadata = JSON.parse(readFileSync(animalMetadataPath, "utf8"));
const cards = metadata.animals.map((animal) => {
  const imagePath = resolve(imageCardsRoot, `${animal.imageId}.png`);
  const relativeImagePath = relative(dirname(outputPath), imagePath).replaceAll("\\", "/");
  return {
    id: animal.id,
    name: animal.nameSv || animal.names?.sv || animal.id,
    imageId: animal.imageId,
    imagePath: relativeImagePath,
    exists: existsSync(imagePath),
    category: animal.category === "dinosaurs" ? "Dinosaurier" : "Djur",
    difficulty: animal.difficulty || "easy",
    habitats: animal.habitats || [],
    continents: animal.continents || [],
    clues: animal.cluesSv || [],
    attributes: animal.attributes || {}
  };
});

const groups = groupBy(cards, (card) => card.category);
const totalImages = cards.filter((card) => card.exists).length;
const summary = Object.entries(groups).map(([name, items]) => `<div class="pill">${escapeHtml(name)}: ${items.length}</div>`).join("");

const html = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Guess The Animal - Image Gallery</title>
  <style>
    :root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0f172a;color:#f8fafc}
    body{margin:0;padding:32px;background:radial-gradient(circle at 15% 0%,rgba(56,189,248,.16),transparent 28rem),#0f172a}
    header{max-width:1280px;margin:0 auto 28px}
    h1{font-size:clamp(2rem,5vw,4.5rem);margin:0 0 8px;letter-spacing:-.06em;line-height:.92}
    h2{font-size:1.7rem;margin:42px auto 16px;max-width:1280px;display:flex;align-items:baseline;gap:10px;letter-spacing:-.03em}
    h2 span{color:#38bdf8;font-size:1rem}
    p{color:#cbd5e1;line-height:1.5}code{color:#bae6fd}.summary{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.pill{border-radius:999px;padding:8px 12px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;font-weight:800}.toolbar{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.toolbar input,.toolbar select{border:1px solid #334155;border-radius:999px;background:#020617;color:#f8fafc;padding:10px 14px;font:inherit}.toolbar input{min-width:min(420px,100%)}.grid{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:16px}.card{border:1px solid #334155;border-radius:22px;background:#1e293b;padding:12px;box-shadow:0 12px 28px rgb(0 0 0 / .22)}.card.missing{outline:2px solid #ef4444}.imageWrap{aspect-ratio:1/1;border-radius:17px;background:#020617;display:grid;place-items:center;overflow:hidden}img{width:100%;height:100%;object-fit:contain;display:block}h3{margin:12px 0 4px;font-size:1.05rem;line-height:1.1}.sub{margin:0;color:#94a3b8;font-size:.78rem}.badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.badge{border-radius:999px;padding:4px 7px;background:#0f172a;color:#cbd5e1;font-size:.72rem;font-weight:800}.badge.hard{background:#7f1d1d;color:#fecaca}.badge.easy{background:#064e3b;color:#a7f3d0}ul{margin:10px 0 0;padding-left:18px;color:#cbd5e1;font-size:.8rem}li{margin:4px 0}.hidden{display:none!important}@media(max-width:640px){body{padding:18px}.grid{grid-template-columns:repeat(auto-fill,minmax(132px,1fr))}}
  </style>
</head>
<body>
  <header>
    <h1>Guess The Animal Gallery</h1>
    <p>Statiskt bildgalleri för alla kort under <code>packages/shared/assets/image-cards</code>. Öppna denna fil direkt i webbläsaren.</p>
    <div class="summary"><div class="pill">Total cards: ${cards.length}</div><div class="pill">Images found: ${totalImages}</div>${summary}</div>
    <div class="toolbar">
      <input id="search" type="search" placeholder="Sök namn, id, habitat, kontinent..." />
      <select id="category"><option value="all">Alla kategorier</option>${Object.keys(groups).map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("")}</select>
      <select id="difficulty"><option value="all">Alla svårigheter</option><option value="easy">Lätt</option><option value="hard">Svår</option></select>
    </div>
  </header>
  ${Object.entries(groups).map(([name, items]) => renderGroup(name, items)).join("\n")}
  <script>
    const search = document.querySelector('#search');
    const category = document.querySelector('#category');
    const difficulty = document.querySelector('#difficulty');
    function applyFilters(){
      const query = search.value.trim().toLowerCase();
      const cat = category.value;
      const diff = difficulty.value;
      document.querySelectorAll('.card').forEach((card)=>{
        const matchesQuery = !query || card.dataset.search.includes(query);
        const matchesCategory = cat === 'all' || card.dataset.category === cat;
        const matchesDifficulty = diff === 'all' || card.dataset.difficulty === diff;
        card.classList.toggle('hidden', !(matchesQuery && matchesCategory && matchesDifficulty));
      });
    }
    search.addEventListener('input', applyFilters);
    category.addEventListener('change', applyFilters);
    difficulty.addEventListener('change', applyFilters);
  </script>
</body>
</html>`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);
console.log(`Wrote ${outputPath}`);

function renderGroup(name, items) {
  return `<section><h2>${escapeHtml(name)} <span>${items.length} kort</span></h2><div class="grid">${items.map(renderCard).join("")}</div></section>`;
}

function renderCard(card) {
  const search = [card.id, card.name, card.category, card.difficulty, card.imageId, ...card.habitats, ...card.continents, ...card.clues].join(" ").toLowerCase();
  const clueItems = card.clues.slice(0, 3).map((clue) => `<li>${escapeHtml(clue)}</li>`).join("");
  return `<article class="card ${card.exists ? "" : "missing"}" data-category="${escapeHtml(card.category)}" data-difficulty="${escapeHtml(card.difficulty)}" data-search="${escapeHtml(search)}">
    <div class="imageWrap">${card.exists ? `<img src="${escapeHtml(card.imagePath)}" alt="${escapeHtml(card.name)}" loading="lazy" />` : `<span>Missing image</span>`}</div>
    <h3>${escapeHtml(card.name)}</h3>
    <p class="sub">${escapeHtml(card.id)}</p>
    <div class="badges"><span class="badge ${card.difficulty}">${card.difficulty === "hard" ? "Svår" : "Lätt"}</span><span class="badge">${escapeHtml(card.category)}</span>${card.habitats.slice(0, 2).map((item) => `<span class="badge">${escapeHtml(item)}</span>`).join("")}</div>
    ${clueItems ? `<ul>${clueItems}</ul>` : ""}
  </article>`;
}

function groupBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
