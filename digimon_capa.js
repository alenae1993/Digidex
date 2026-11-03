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
// Digievoluciones en la carta: "Digievoluciona (PV): Greymon 3 · Birdramon 3 · GeoGreymon 4", en hasta 2 líneas.
function dgEvoLines(d) {
  const ev = d.evo || [];
  if (!ev.length) return ["Sin digievolución"];
  return dgWrap("Digievoluciona (PV): " + ev.map(t => `${t} ${dgEvoCost(d, t)}`).join(" · "), 52).slice(0, 2);
}
const dgEvoCost = (d, t) => d.evo_costs?.[t] ?? d.evolve_cost ?? 0;
function dgCardSVG(c, art) {
  const d = c.d, [elEs, col] = DG_ELEM[d.types[0]] || DG_ELEM.Normal, [mvEs, mvCol] = DG_ELEM[d.move_type] || DG_ELEM.Normal;
  const lv = DG_LEVEL[c.dg?.lv] || "", str = +d.move_attack_strength || 0;
  const fx = dgWrap(d.move_effect, 40).slice(0, 5), nameSize = d.pokedex_name.length > 14 ? 20 : 25;
  const learn = d.moves.map((t, i) => `<rect x="${148 + i * 37}" y="303" width="33" height="20" rx="5" fill="${(DG_ELEM[t] || DG_ELEM.Normal)[1]}"/>
    <text x="${164.5 + i * 37}" y="317" font-size="10" text-anchor="middle" fill="#fff" font-weight="700">${dgEsc(DG_ABBR[t] || "Neu")}</text>`).join("");
  const dice = Array.from({length: str}, (_, i) => `<rect x="${206 - str * 11 + i * 22 + 50}" y="384" width="17" height="17" rx="3" fill="#fff" stroke="#222" stroke-width="1.5"/>`).join("");
  const pic = art ? `<image href="${art}" x="20" y="70" width="260" height="180" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="150" y="175" font-size="64" text-anchor="middle" fill="#ffffff55" font-weight="700">${dgEsc(d.pokedex_name.slice(0, 2))}</text>`;
  const tier = {W: "Débil", M: "Moderado", S: "Fuerte", L: "Legendario"}[c.tier] || (c.tags?.includes("Starter Card") ? "Inicial" :
    {Grunt: "Soldado Pesadilla", Commander: "Señor Demonio", Boss: "Lucemon"}[d.encounter_tier] || "Evolución");
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
  ${dgEvoLines(d).map((l, i) => `<text x="18" y="${341 + i * 12}" font-size="10" fill="#ffffffcc">${dgEsc(l)}</text>`).join("")}
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
// Ilustraciones: primero el paquete propio img/digimon_imagenes.bin (fondo quitado, WebP), que se baja una sola vez y
// queda en la caché del navegador; si un Digimon no está en el paquete, se intenta Digi-API (puede fallar por CORS).
const dgReadBlob = b => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(b); });
let DG_PACK = null;
function dgPack() {
  if (!DG_PACK && typeof DGIMG !== "undefined") {
    const url = new URL(`../Digidex/${DGIMG.pack}?v=${DGIMG.v}`, document.baseURI).href;
    DG_PACK = fetch(url).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null);
  }
  return DG_PACK || Promise.resolve(null);
}
async function dgLoadArt(c) {
  const name = c.d.pokedex_name, e = typeof DGIMG !== "undefined" && DGIMG.idx[name];
  if (e) {
    const buf = await dgPack();
    if (buf) return dgReadBlob(new Blob([buf.slice(e[0], e[0] + e[1])], {type: "image/webp"}));
  }
  if (!c.dg?.img) return null;
  try {
    const r = await fetch(c.dg.img, {mode: "cors"}); if (!r.ok) return null;
    const b = await r.blob(); return b.type.startsWith("image") ? dgReadBlob(b) : null;
  } catch (err) { return null; }
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
  // Imagen real (no un objeto {src}): el mapa la dibuja en el canvas con drawImage (legendarios en los santuarios).
  if (!DG_IMAGES.has(key)) { const im = new Image(); im.src = dgSvgSrc(dgCardSVG(c, DG_ART.get(id))); DG_IMAGES.set(key, im); }
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

/* ---------- Digievoluciones con costo propio ----------
   Cada Digimon puede tener hasta 3 digievoluciones (hoja "digievoluciones" del cube), cada una con su costo en PV.
   El Modo Cartas original usa un solo costo por carta: aquí se toma el de cada destino. Los descuentos del juego
   (Comida Infundida a mitad de costo, habilidad de Entrenador −2) se aplican igual que antes. */
function dgEvoCostFor(run, s, sp) {
  const d = cardBySpecies(s.species)?.d, base = d ? dgEvoCost(d, sp) : s.card.cost;
  return Math.max(0, base - (run.halfEvo ? Math.ceil(base / 2) : 0) - (sinFx?.(run, "pvUnlock") ? 2 : 0));
}
const dgEvoList = s => cardBySpecies(s.species)?.d?.evo || s.card.evo || [];
cardEvoHTML = function (run) {
  const rows = run.team.flatMap((s, i) => !s.card ? [] : dgEvoList(s).map(sp => {
    const cost = dgEvoCostFor(run, s, sp), src = cardBySpecies(s.species)?.d?.evo_src?.[sp] || "";
    return `<li><b>${esc(esSp(s.species))} → ${esc(esSp(sp))}</b><small>${cost} PV${run.halfEvo ? " (Comida Infundida)" : ""}${/Propuesta/.test(src) ? " · propuesta" : ""}</small>
      <button class="btn" data-act="cbevolve" data-member="${i}" data-sp="${esc(sp)}" ${run.pv >= cost && sinMapAction(run) && cardBySpecies(sp) ? "" : "disabled"}>Digievolucionar</button></li>`;
  }));
  return rows.length ? `<h2>Digievolucionar (Puntos de Viaje)</h2><ul class="sin-objects">${rows.join("")}</ul>` : "";
};
cardEvolve = function (member, sp) {
  const run = ST.sin.run, s = run.team[member], card = cardBySpecies(sp);
  if (!s?.card || !card || !dgEvoList(s).includes(sp) || !sinMapAction(run)) return;
  const cost = dgEvoCostFor(run, s, sp);
  if (run.pv < cost) return;
  run.pv -= cost; delete run.halfEvo;
  const old = s.card.sig, from = s.species;
  Object.assign(s, cardSet({...s, species: card.d.sp}, card), {species: card.d.sp, hpNow: undefined, status: ""});
  if ((s.cmoves || []).length < 2 && !s.cmoves.some(m => m.name === old.name)) s.cmoves.push(old);
  run.notice = `¡${esSp(from)} digievolucionó en ${esSp(s.species)}! Se restauró por completo.`;
  sinSave(); sinUpdateTurn();
};

/* ---------- Campaña 1 · La rebelión de Lucemon ----------
   Lo mismo que el mod de mesa (docs/campana_lucemon.md): aldeas Digimon, Soldados Pesadilla, los 6 Señores Demonio,
   Lucemon, los 3 Arcángeles y los legendarios Digimon. Las reglas del motor no cambian; se reemplazan los datos y textos.
   En esta versión web cada uno de los 3 lagos es un par de Puertas: dos Señores Demonio que entregan 2 Emblemas, así que
   cada victoria da +1 espacio de equipo (la regla de la campaña: +1 espacio por cada 2 Emblemas). */
const DG_VILLAGES = {"Stark Village": "Ciudad Factorial", "Snowpoint Village": "Aldea Freezeland", "Sunyshore Village": "Playa de Coral",
  "Nesburgh Village": "Ciudad del Comienzo", "Celestic Village": "Tierra de Escarabajos", "Canalave Village": "Castillo Geko",
  "Eterna Village": "Pueblo Juguete", "Sinnome Village": "Aldea Yokomon"};
SIN_VILLAGES.forEach(v => { if (DG_VILLAGES[v.village]) v.name = DG_VILLAGES[v.village]; });
[...(DGDATA.villains || []), ...(DGDATA.legends || [])].forEach(c => { DG_BY_IMG.set(c.img, c); if (!DG_BY_ID.has(toID(c.n))) DG_BY_ID.set(toID(c.n), c); });
const DG_LORDS = {
  emotion: {name: "Lilithmon y Leviamon", lords: ["lilithmon", "leviamon"], fragment: "Emblemas de la Pureza y la Amistad", lake: "Puertas de la Lujuria y la Envidia"},
  knowledge: {name: "Belphemon y Barbamon", lords: ["belphemon", "barbamon"], fragment: "Emblemas del Valor y la Sinceridad", lake: "Puertas de la Pereza y la Codicia"},
  willpower: {name: "Daemon y Beelzemon", lords: ["daemon", "beelzemon"], fragment: "Emblemas del Amor y el Conocimiento", lake: "Puertas de la Ira y la Gula"}
};
SIN_COMMANDERS.forEach(c => { const l = DG_LORDS[c.id]; if (l) Object.assign(c, {name: l.name, article: "los", fragment: l.fragment, lake: l.lake}); });
Object.assign(SIN_NAMES, DG_VILLAGES, {
  "Lake Verity Battle": DG_LORDS.emotion.lake, "Lake Acuity Battle": DG_LORDS.knowledge.lake, "Lake Valor Battle": DG_LORDS.willpower.lake,
  "Origin Shrine": "Altar de Yggdrasil", "Temple of Sinnoh Battle": "Puerta de Cocytus · Lucemon",
  "Odd Keystone": "Escudo de Alphamon", "Gracidea Flower": "Rosa Carmesí", "Seafarer Egg": "Digihuevo de los Milagros",
  "Magma Stone": "Escama de Examon", "Secret Key": "Llave Digimental", "Steelrock Core": "Digicore de Zhuqiaomon",
  "Icesteel Core": "Digicore de Xuanwumon", "Rockice Core": "Digicore de Baihumon", "Adamant Artifact": "Pluma de Seraphimon",
  "Lustrous Artifact": "Pluma de Ophanimon", "Griseous Artifact": "Pluma de Cherubimon",
  "The Garden of Gratitude": "Jardín Real", "The Magma Chamber": "Nido del Dragón", "The Hallowed Tower": "Torre Sagrada",
  "The Temple of the Sea": "Templo de los Milagros", "Valley Ruins": "Ruinas de Baihumon", "Westbreeze Ruins": "Ruinas de Xuanwumon",
  "Firelilly Ruins": "Ruinas de Zhuqiaomon", "Lake Verity Cavern": "Cueva de AncientWisemon", "Lake Acuity Cavern": "Cueva de AncientGarurumon",
  "Lake Valor Cavern": "Cueva de AncientGreymon", "The Temple of Sinnoh": "Templo de Susanoomon", "The Grand Chateau": "Fortaleza Imperial"
});
Object.entries({"Seafarer Egg": "Digihuevo de los Milagros", "Odd Keystone": "Escudo de Alphamon", "Magma Stone": "Escama de Examon",
  "Secret Key": "Llave Digimental", "Gracidea Flower": "Rosa Carmesí", "Rockice Core": "Digicore de Baihumon", "Icesteel Core": "Digicore de Xuanwumon",
  "Steelrock Core": "Digicore de Zhuqiaomon", "Adamant Artifact": "Pluma de Seraphimon", "Lustrous Artifact": "Pluma de Ophanimon",
  "Griseous Artifact": "Pluma de Cherubimon"}).forEach(([k, n]) => { if (SIN_ARTIFACTS[k]) SIN_ARTIFACTS[k].name = n; });
SIN_GODS.dialga.species = "Seraphimon"; SIN_GODS.palkia.species = "Ophanimon"; SIN_GODS.giratina.species = "Cherubimon";
// Los Arcángeles en su segunda fase (como la Forma Origen): especie "<Arcángel>-Origin" con las stats de su carta de forma.
["Seraphimon", "Ophanimon", "Cherubimon"].forEach(n => { const c = DGDATA.legends.find(x => x.d.sp === n + "-Origin"); if (c) DG_BY_ID.set(toID(n + "-Origin"), c); });
const DG_SHRINE = {
  c373200: ["El Trueno Divino", "Goddramon"], c373201: ["El Aliento Divino", "Holydramon"], c373202: ["El Fuego Divino", "Megidramon"],
  c373203: ["Un Caballero Eterno", "Omegamon"], c373204: ["Una Sombra Emerge", "Duftmon"], c373205: ["Un Faro de Luz", "Craniummon"],
  c373206: ["Un Gigante Despierta", "Huanglongmon"], c382800: ["Encuentro del Destino"], c382801: ["Regalo Inesperado"],
  c382802: ["Intercambio Equivalente"], c382803: ["Sabiduría Ancestral"], c382804: ["Gran Banquete"], c382805: ["Tesoro Escondido"],
  c382806: ["Momento de Calma"]};
Object.entries(DG_SHRINE).forEach(([k, [name, sp]]) => { const e = SIN_SHRINE_EFFECTS[k]; if (!e) return; e.name = name; if (sp) e.species = sp; });
const DG_LEG_FROM = {magnamon: "manaphy", examon: "heatran", alphamon: "spiritomb", imperialdramon: "rotom", dukemon: "shaymin",
  baihumon: "regirock", xuanwumon: "regice", zhuqiaomon: "registeel", ancientwisemon: "mesprit", ancientgarurumon: "uxie",
  ancientgreymon: "azelf", susanoomon: "silvally", huanglongmon: "regigigas"};
Object.entries(DG_LEG_FROM).forEach(([dg, pk]) => {
  if (SIN_LEGEND_REQUIREMENTS[pk]) SIN_LEGEND_REQUIREMENTS[dg] = SIN_LEGEND_REQUIREMENTS[pk];
  if (SIN_LEGEND_LEVELS[pk]) SIN_LEGEND_LEVELS[dg] = SIN_LEGEND_LEVELS[pk];
});
Object.assign(SIN_ACTS[0], {name: "Prólogo · La Incursión", objective: "Elige tu aldea natal y tu Digimon inicial para comenzar el viaje."});
Object.assign(SIN_ACTS[1], {name: "Acto I · El Viaje", objective: "Derrota a los 2 Soldados Pesadilla de tu aldea natal."});
Object.assign(SIN_ACTS[2], {name: "Acto II · Los Emblemas", objective: "Derrota a los 6 Señores Demonio en sus Puertas (de a dos) para reunir los seis Emblemas."});
Object.assign(SIN_ACTS[3], {name: "Acto III · La Luz", objective: "Obtén el Emblema de la Luz en el Altar de Yggdrasil y derrota a Lucemon en la Puerta de Cocytus."});
Object.assign(SIN_ACTS[4], {name: "Final · La Elección", objective: "Elige el destino del Emblema de la Luz."});
Object.assign(SIN_FOE_SPRITES, {[DG_LORDS.emotion.name]: "tr/ATENEA1", [DG_LORDS.knowledge.name]: "tr/ATENEA2",
  [DG_LORDS.willpower.name]: "tr/ATLAS1", Lucemon: "tr/GIOVANNI1"});
const _dgSpec = sinTrainerSpec;
sinTrainerSpec = function (run, key) {
  const s = _dgSpec(run, key); if (!s) return s;
  if (s.kind === "grunt") Object.assign(s, {name: "Soldados Pesadilla", intro: "¡Los Soldados Pesadilla de Lucemon te desafían!"});
  if (s.kind === "commander") {
    const l = DG_LORDS[s.id];
    s.cards = SIN_CARDS.filter(c => c.d?.encounter_tier === "Commander" && l.lords.includes(c.dg?.trainer));
    s.intro = `¡${l.name}, Señores Demonio, te desafían en las ${l.lake}!`;
  }
  if (s.kind === "boss") {
    // Lucemon (Satan Mode) siempre sale: 5 de la corte al azar + él (el motor baraja y toma 6).
    const satan = s.cards.filter(c => /Satan/.test(c.d.pokedex_name)), rest = shuffle(s.cards.filter(c => !/Satan/.test(c.d.pokedex_name)));
    Object.assign(s, {name: "Lucemon", intro: "¡Lucemon, el séptimo Señor Demonio, te desafía en la Puerta de Cocytus!",
      cards: [...rest.slice(0, s.count - satan.length), ...satan]});
  }
  return s;
};
// Cartas de texto en español del mod (Acto, Cambio de Destino, Santuario y Aldeas) e imagen de los Soldados Pesadilla.
const DG_CARD_FILES = new Set(["c373600", "c373601", "c373602", "c373603", "c373604", "c373300", "c373301", "c373302", "c373303",
  ...Array.from({length: 8}, (_, i) => "c37320" + i), ...Array.from({length: 7}, (_, i) => "c38280" + i), ...Array.from({length: 8}, (_, i) => "c29840" + i)]);
const DG_FILE_IMAGES = new Map();
const _dgSinImage2 = sinImage;
sinImage = function (key) {
  const file = DG_CARD_FILES.has(key) ? `img/cartas/${key}.webp` : key && key === SIN_GRUNT_IMAGE ? "img/cartas/soldado_pesadilla.webp" : null;
  if (!file) return _dgSinImage2(key);
  if (!DG_FILE_IMAGES.has(key)) {
    const im = new Image(); im.src = new URL(`../Digidex/${file}`, document.baseURI).href; DG_FILE_IMAGES.set(key, im);
  }
  return DG_FILE_IMAGES.get(key);
};
DG_TEXT.push(
  [/del Equipo Galaxia/g, "de Lucemon"], [/Equipo Galaxia/g, "ejército de Lucemon"], [/Reclutas/g, "Soldados Pesadilla"], [/Recluta/g, "Soldado Pesadilla"],
  [/Comandantes/g, "Señores Demonio"], [/Comandante/g, "Señor Demonio"], [/Helio/g, "Lucemon"],
  [/Corazón de Sinnoh/g, "Emblema de la Luz"], [/el Corazón/g, "el Emblema de la Luz"], [/Fragmentos de Sinnoh/g, "pares de Emblemas"],
  [/Fragmento de Sinnoh/g, "par de Emblemas"], [/Fragmentos/g, "Puertas"], [/fragmentos/g, "Emblemas"],
  [/Santuario Origin/g, "Altar de Yggdrasil"], [/Templo de Sinnoh/g, "Puerta de Cocytus"], [/Dioses de Sinnoh/g, "Arcángeles"],
  [/Dios de Sinnoh/g, "Arcángel"], [/Arceus/g, "Yggdrasil"], [/Dialga/g, "Seraphimon"], [/Palkia/g, "Ophanimon"], [/Giratina/g, "Cherubimon"],
  [/Forma Origen/g, "segunda forma"], [/Santuario Frostsong/g, "Santuario Canto Helado"], [/Santuario Thundersong/g, "Santuario Canto Trueno"],
  [/Santuario Firesong/g, "Santuario Canto Fuego"], [/Santuario Timeless/g, "Santuario Atemporal"], [/Santuario Moonglade/g, "Santuario Claro Lunar"],
  [/Santuario Colossus/g, "Santuario del Coloso"], [/Sinnoh/g, "el Mundo Digital"], [/pueblo natal/g, "aldea natal"], [/Pueblo natal/g, "Aldea natal"],
  [/entrenador/g, "domador"], [/Entrenador/g, "Domador"], [/el Emblemas/g, "los Emblemas"], [/del Emblemas/g, "de los Emblemas"]);
const _dgTextsTest = /Emblemas|Sinnoh|Pokémon|Bonguri|Ball|stofado|Galaxia|Recluta|Comandante|Helio|Fragmento|fragmento|Origin|Arceus|Dialga|Palkia|Giratina|natal|ntrenador/;
dgTexts = function (root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { let t = n.nodeValue; if (!_dgTextsTest.test(t)) continue; DG_TEXT.forEach(([re, s]) => { t = t.replace(re, s); }); if (t !== n.nodeValue) n.nodeValue = t; }
};

/* ---------- Cartas reales del mod y fichas nuevas del tablero ----------
   digimon_cartas.js + img/digimon_cartas.bin (herramientas/empaquetar_cartas.py): cada carta Digimon se ve igual que en el
   mod de mesa (la que arma el card_generator), y las fichas del mapa (huertos, arrecifes, aldeas, puertas, legendarios,
   alijos y artefactos) usan las imágenes nuevas. Mientras el paquete carga, la carta se dibuja como antes. */
let DG_CPACK = null;
const DG_CIMG = new Map();
function dgCartasPack() {
  if (!DG_CPACK) DG_CPACK = fetch(new URL(`../Digidex/${DGCARTAS.pack}?v=${DGCARTAS.v}`, document.baseURI).href)
    .then(r => r.ok ? r.arrayBuffer() : null).catch(() => null);
  return DG_CPACK;
}
function dgPackImage(id, e) {
  if (!DG_CIMG.has(id)) {
    DG_CIMG.set(id, null);
    dgCartasPack().then(buf => {
      if (!buf) return;
      const im = new Image();
      im.onload = () => {
        DG_CIMG.set(id, im);
        if (typeof sinFillImages === "function") sinFillImages();
        if (typeof sinRequestDraw === "function") sinRequestDraw();
      };
      im.src = URL.createObjectURL(new Blob([buf.slice(e[0], e[0] + e[1])], {type: "image/webp"}));
    });
  }
  return DG_CIMG.get(id);
}
const _dgSinImage3 = sinImage;
sinImage = function (key) {
  if (typeof DGCARTAS !== "undefined" && key) {
    const c = dgCardOf(key), row = c?.dg?.row;
    const e = c ? (row != null ? DGCARTAS.cartas[row] : null) : DGCARTAS.fichas[key];
    if (e) return dgPackImage(c ? "r" + row : key, e) || (c ? _dgSinImage3(key) : null);
  }
  return _dgSinImage3(key);
};
