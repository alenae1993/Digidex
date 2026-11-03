"use strict";
/* ---------- Leyendas Digimon · motor ----------
   Se carga DESPUÉS de sinnoh_datos.js y ANTES de sinnoh.js (los mazos se leen al cargar sinnoh.js).
   1. Registra cada Digimon como especie en el Dex del motor, para que el resto del código (nombres, tipos, sets) funcione.
   2. Reemplaza los mazos de salvajes (Débil/Moderado/Fuerte), iniciales y evoluciones por las cartas Digimon.
   3. Campaña 1 (La rebelión de Lucemon): los mazos del Equipo Galaxia pasan a ser los Soldados Pesadilla, los Señores
      Demonio y la corte de Lucemon, y el mazo de legendarios pasa a ser el de los Arcángeles y legendarios Digimon.
      Las fichas de legendario del mapa apuntan a su Digimon. Los Ultraentes quedan como en el mod. */
(() => {
  const P = Dex.data.Pokedex, clash = [];
  for (const s of DGDATA.species) {
    const id = toID(s.name);
    if (P[id] && !P[id].dg) clash.push(s.name);
    const [hp, atk, def, spa, spd, spe] = s.bs;
    P[id] = {dg: true, num: s.num, name: s.name, types: s.types, gender: "N", baseStats: {hp, atk, def, spa, spd, spe},
      abilities: {0: "No Ability"}, heightm: 1, weightkg: 10, color: "Gray", eggGroups: ["Undiscovered"]};
  }
  if (clash.length) console.warn("Digimon con el mismo id que un Pokémon:", clash);
  const deck = tag => SIN.decks.find(d => (d.tags || []).includes(tag));
  deck("Weak Encounter Card").cards = DGDATA.wild.W;
  deck("Moderate Encounter Card").cards = DGDATA.wild.M;
  deck("Strong Encounter Card").cards = DGDATA.wild.S;
  deck("Starter Card").cards = DGDATA.starters;
  deck("Evolution Card").cards = DGDATA.evolutions;
  if (DGDATA.villains) {
    deck("Galactic Grunt").cards = DGDATA.villains.filter(c => c.d.encounter_tier === "Grunt");
    deck("Galactic Commander").cards = DGDATA.villains.filter(c => c.d.encounter_tier === "Commander");
    deck("Galactic Boss").cards = DGDATA.villains.filter(c => c.d.encounter_tier === "Boss");
  }
  if (DGDATA.legends) {
    // Se conservan los legendarios del mod que no usa esta campaña (Ultra Explosión: Necrozma, Ultraentes).
    const leg = deck("Legendary Encounter Card");
    leg.cards = [...DGDATA.legends, ...leg.cards.filter(c => c.d?.encounter_tier !== "Legendary")];
    const DG_LEG = {Shaymin: "Dukemon", Heatran: "Examon", Spiritomb: "Alphamon", Manaphy: "Magnamon", Regirock: "Baihumon",
      Regice: "Xuanwumon", Registeel: "Zhuqiaomon", Mesprit: "AncientWisemon", Uxie: "AncientGarurumon", Azelf: "AncientGreymon",
      Silvally: "Susanoomon", Rotom: "Imperialdramon"};
    SIN.tokens.forEach(t => { if (DG_LEG[t.gm]) t.gm = DG_LEG[t.gm]; });
  }
})();
