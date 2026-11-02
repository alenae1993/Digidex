"use strict";
/* ---------- Leyendas Digimon · motor ----------
   Se carga DESPUÉS de sinnoh_datos.js y ANTES de sinnoh.js (los mazos se leen al cargar sinnoh.js).
   1. Registra cada Digimon como especie en el Dex del motor, para que el resto del código (nombres, tipos, sets) funcione.
   2. Reemplaza los mazos de salvajes (Débil/Moderado/Fuerte), iniciales y evoluciones por las cartas Digimon.
   Los mazos de campaña (Equipo Galaxia), legendarios y Ultraentes quedan como en el mod por ahora. */
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
})();
