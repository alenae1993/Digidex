"use strict";
/* ---------- Leyendas Digimon · capa visual y de reglas ----------
   Se carga al final, después de sinnoh.js y sinnoh_cartas.js. No modifica archivos de DexPoke: solo reemplaza
   funciones globales en esta página.
   - Solo Modo Cartas (las batallas del motor Pokémon no sirven para Digimon).
   - Iniciales Digimon repartidos en los 8 pueblos.
   - Tabla de elementos de Digimon Story (Fuego > Planta > Agua > Fuego; Eléctrico > Viento > Tierra > Eléctrico; Luz ⇄ Oscuridad).
   - Cartas dibujadas en SVG con los datos del cube; la ilustración se toma de img/<Nombre>.png (si existe) o de Digi-API. */

/* ---------- Elementos ---------- */
const DG_ELEM = {Fire: ["Fuego", "#e4572e", "fire"], Water: ["Agua", "#2f80ed", "water"], Grass: ["Planta", "#3f9b4a", "plant"],
  Electric: ["Eléctrico", "#e8b923", "electric"], Flying: ["Viento", "#4fb39a", "wind"], Ground: ["Tierra", "#9a6a3a", "earth"],
  Dark: ["Oscuridad", "#5a3f7d", "dark"], Fairy: ["Luz", "#e9cf5f", "ligth"], Normal: ["Neutral", "#8e959c", "neutral"]};
for (const [t, [es, col]] of Object.entries(DG_ELEM)) { const k = t.toUpperCase(); if (TY[k]) { TY[k][0] = es; TY[k][1] = col; } }
Object.assign(CARD_TYPE_ES, {luz: "Fairy", viento: "Flying", oscuridad: "Dark", neutral: "Normal", neutro: "Normal", electricidad: "Electric"});
const DG_CHART = {Fire: {Grass: 1, Water: -1}, Water: {Fire: 1, Grass: -1}, Grass: {Water: 1, Fire: -1},
  Electric: {Flying: 1, Ground: -1}, Flying: {Ground: 1, Electric: -1}, Ground: {Electric: 1, Flying: -1},
  Fairy: {Dark: 1}, Dark: {Fairy: 1}};
// cardTypeBonus (sinnoh_cartas.js) usa Dex.getEffectiveness y Dex.getImmunity: en esta página responden con la tabla de Digimon.
Dex.getImmunity = () => true;
Dex.getEffectiveness = (src, tgt) => {
  const s = typeof src === "string" ? src : src?.type;
  const ts = typeof tgt === "string" ? [tgt] : Array.isArray(tgt) ? tgt : (tgt?.getTypes?.() || tgt?.types || []);
  return ts.reduce((a, t) => a + ((DG_CHART[s] || {})[t] || 0), 0);
};

/* ---------- Iniciales ---------- */
const DG_START = {Pink: ["Patamon", "Biyomon"], Yellow: ["Terriermon", "Veemon"], Purple: ["Renamon", "Coronamon"],
  Orange: ["Shoutmon", "Gumdramon"], Red: ["Agumon", "Guilmon"], White: ["Gabumon", "Gaomon"], Green: ["Palmon", "Wormmon"], Blue: ["Gomamon"]};
SIN_VILLAGES.forEach(v => { if (DG_START[v.color]) v.starters = DG_START[v.color].filter(s => sinStarterCard(s)); });
SIN_NEW.mode = "cards";

/* ---------- Cartas ---------- */
const DG_BY_IMG = new Map(), DG_BY_ID = new Map();
[...DGDATA.wild.W, ...DGDATA.wild.M, ...DGDATA.wild.S, ...DGDATA.starters, ...DGDATA.evolutions].forEach(c => {
  DG_BY_IMG.set(c.img, c); if (!DG_BY_ID.has(toID(c.n))) DG_BY_ID.set(toID(c.n), c);
});
const DG_ABBR = {Fire: "Fue", Water: "Agu", Grass: "Pla", Electric: "Elé", Flying: "Vie", Ground: "Tie", Dark: "Osc", Fairy: "Luz", Normal: "Neu"};
const DG_ATTR = {vaccine: "Vacuna", virus: "Virus", data: "Datos", free: "Libre"};
const DG_LEVEL = {"Baby I": "Bebé", "Baby II": "Entrenamiento", Child: "Novato", Adult: "Campeón", Perfect: "Perfecto", Ultimate: "Mega", Armor: "Armor", Hybrid: "Híbrido"};
const dgEsc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
function dgWrap(text, max) {
  const out = []; let line = "";
  String(text || "").split(/\s+/).filter(Boolean).forEach(w => {
    if ((line + " " + w).trim().length > max) { if (line) out.push(line); line = w; } else line = (line + " " + w).trim();
  });
  if (line) out.push(line); return out;
}
function dgCardSVG(c, art) {
  const d = c.d, [elEs, col] = DG_ELEM[d.types[0]] || DG_ELEM.Normal, [mvEs, mvCol] = DG_ELEM[d.move_type] || DG_ELEM.Normal;
  const lv = DG_LEVEL[c.dg?.lv] || "", str = +d.move_attack_strength || 0;
  const fx = dgWrap(d.move_effect, 40).slice(0, 5), nameSize = d.pokedex_name.length > 14 ? 20 : 25;
  const learn = d.moves.map((t, i) => `<rect x="${148 + i * 37}" y="303" width="33" height="20" rx="5" fill="${(DG_ELEM[t] || DG_ELEM.Normal)[1]}"/>
    <text x="${164.5 + i * 37}" y="317" font-size="10" text-anchor="middle" fill="#fff" font-weight="700">${dgEsc(DG_ABBR[t] || "Neu")}</text>`).join("");
  const dice = Array.from({length: str}, (_, i) => `<rect x="${206 - str * 11 + i * 22 + 50}" y="384" width="17" height="17" rx="3" fill="#fff" stroke="#222" stroke-width="1.5"/>`).join("");
  const pic = art ? `<image href="${art}" x="20" y="70" width="260" height="180" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="150" y="175" font-size="64" text-anchor="middle" fill="#ffffff55" font-weight="700">${dgEsc(d.pokedex_name.slice(0, 2))}</text>`;
  const tier = {W: "Débil", M: "Moderado", S: "Fuerte"}[c.tier] || (c.tags?.includes("Starter Card") ? "Inicial" : "Evolución");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="525" viewBox="0 0 300 525" font-family="Arial, Helvetica, sans-serif">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="#1b1f24"/></linearGradient></defs>
  <rect width="300" height="525" rx="16" fill="#111"/><rect x="6" y="6" width="288" height="513" rx="12" fill="url(#g)"/>
  <text x="18" y="38" font-size="${nameSize}" font-weight="700" fill="#fff">${dgEsc(d.pokedex_name)}</text>
  <text x="18" y="58" font-size="12" fill="#ffffffcc">${dgEsc([lv, elEs, DG_ATTR[c.dg?.attr] || ""].filter(Boolean).join(" · "))}</text>
  <text x="282" y="58" font-size="12" text-anchor="end" fill="#ffffffcc">${dgEsc(tier)}</text>
  <rect x="18" y="66" width="264" height="188" rx="10" fill="#ffffff22"/>${pic}
  <g font-weight="700" fill="#fff"><circle cx="248" cy="282" r="20" fill="#c0392b" stroke="#fff" stroke-width="2"/><text x="248" y="289" font-size="19" text-anchor="middle">${d.health}</text>
  <circle cx="200" cy="282" r="20" fill="#2c3e50" stroke="#fff" stroke-width="2"/><text x="200" y="289" font-size="19" text-anchor="middle">${d.initiative}</text></g>
  <text x="200" y="314" font-size="0">.</text>${learn}
  <text x="148" y="345" font-size="10" fill="#ffffffaa">${d.evolve_into ? dgEsc(`Evoluciona a ${d.evolve_into[0]} · ${d.evolve_cost} PV`) : "Sin evolución"}</text>
  <rect x="14" y="368" width="272" height="146" rx="10" fill="#f6ecd9" stroke="${mvCol}" stroke-width="4"/>
  <text x="26" y="398" font-size="17" font-weight="700" fill="#222">${dgEsc(d.move_name)}</text>${dice}
  <text x="26" y="417" font-size="11" fill="${mvCol}" font-weight="700">${dgEsc(mvEs)} · Fuerza ${str}</text>
  ${fx.map((l, i) => `<text x="26" y="${436 + i * 15}" font-size="12.5" fill="#333">${dgEsc(l)}</text>`).join("")}
  </svg>`;
}
const DG_IMAGES = new Map(), DG_ART = new Map();
const dgSvgSrc = svg => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
// Ilustración: primero img/<Nombre>.png en este repo (cuando se descarguen), luego Digi-API. Se incrusta en el SVG como data URL;
// si el servidor no lo permite (CORS), la carta queda sin ilustración pero con todos sus datos.
// Cambiar a true cuando las imágenes estén en la carpeta img/ de este repo (así no se piden archivos que no existen).
const DG_LOCAL_IMG = false;
async function dgLoadArt(c) {
  const name = c.d.pokedex_name;
  for (const url of [DG_LOCAL_IMG && new URL(`../Digidex/img/${encodeURIComponent(name)}.png`, document.baseURI).href, c.dg?.img].filter(Boolean)) {
    try {
      const r = await fetch(url, {mode: "cors"}); if (!r.ok) continue;
      const b = await r.blob(); if (!b.type.startsWith("image")) continue;
      return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(b); });
    } catch (e) {}
  }
  return null;
}
const dgCardOf = key => DG_BY_IMG.get(key);
const _sinImage = sinImage;
sinImage = function (key) {
  const c = dgCardOf(key); if (!c) return _sinImage(key);
  const id = toID(c.n);
  if (!DG_ART.has(id)) {
    DG_ART.set(id, null);
    dgLoadArt(c).then(a => { if (!a) return; DG_ART.set(id, a); [...DG_IMAGES.keys()].filter(k => toID(dgCardOf(k).n) === id).forEach(k => DG_IMAGES.delete(k)); sinFillImages(); });
  }
  if (!DG_IMAGES.has(key)) DG_IMAGES.set(key, {src: dgSvgSrc(dgCardSVG(c, DG_ART.get(id)))});
  return DG_IMAGES.get(key);
};
// Retrato de un Digimon (fichas del mapa, listas): ilustración de Digi-API.
const _img = img;
img = function (name) { const c = DG_BY_ID.get(toID(name)); return c ? (DG_ART.get(toID(name)) || c.dg?.img || "") : _img(name); };

/* ---------- Textos ---------- */
document.title = "Leyendas Digimon";
// Economía (ver economia_alimentos.md): los Bonguri pasan a ser alimentos de Time Stranger y las Balls, capturas con Digivice.
const DG_FOOD = {rojo: ["Carne", "Carnes"], amarillo: ["Banana", "Bananas"], azul: ["Pescado Fresco", "Pescados Frescos"],
  rosa: ["Manzana", "Manzanas"], verde: ["Piña", "Piñas"], blanco: ["Zanahoria", "Zanahorias"], negro: ["DigiProteína", "DigiProteínas"]};
const DG_TEXT = [[/Leyendas de Sinnoh/g, "Leyendas Digimon"], [/Pokémon/g, "Digimon"],
  [/Árbol de Bonguri (rojo|amarillo|azul|rosa|verde|blanco|negro)/gi, (m, c) => `Huerto de ${DG_FOOD[c.toLowerCase()][1]}`],
  [/(\d+)?(\s*)Bonguri (Rojo|Amarillo|Azul|Rosa|Verde|Blanco|Negro)s?/gi, (m, n, sp, c) => (n || "") + sp + DG_FOOD[c.toLowerCase()][n && +n !== 1 ? 1 : 0]],
  [/Arrecife de Bonguri/gi, "Arrecife"], [/Bonguri/g, "alimentos"],
  [/Poké Balls?/g, m => m.endsWith("s") ? "Capturas Básicas" : "Captura Básica"], [/Super Balls?/g, "Captura Mejorada"],
  [/Ultra Balls?/g, "Captura Avanzada"], [/Spirit Balls?/g, "Captura Ancestral"], [/[Ee]stofados?/g, m => m.replace(/stofado/, "omida").replace(/^E/, "C").replace(/^e/, "c")]];
function dgTexts(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { let t = n.nodeValue; if (!/Sinnoh|Pokémon|Bonguri|Ball|stofado/.test(t)) continue; DG_TEXT.forEach(([re, s]) => { t = t.replace(re, s); }); if (t !== n.nodeValue) n.nodeValue = t; }
}
new MutationObserver(() => dgTexts(document.body)).observe(document.body, {childList: true, subtree: true, characterData: false});
const dgCss = document.createElement("style");
dgCss.textContent = `[data-act="sinmode"][data-mode="pokemon"]{display:none}`;
document.head.appendChild(dgCss);

/* ---------- Entrada directa al juego ---------- */
window.addEventListener("load", () => { if (typeof go === "function" && VIEW !== "sin") go("sin"); dgTexts(document.body); });

// Toda partida nueva es en Modo Cartas, y el menú de batallas Pokémon no se usa en esta página.
const _sinNewScreen = sinNewScreen;
sinNewScreen = function (...a) { SIN_NEW.mode = "cards"; return _sinNewScreen.apply(this, a); };
const _sinBegin = sinBegin;
sinBegin = function (...a) { SIN_NEW.mode = "cards"; return _sinBegin.apply(this, a); };
const _go = go;
go = function (v) { return _go(v === "menu" ? "sin" : v); };
