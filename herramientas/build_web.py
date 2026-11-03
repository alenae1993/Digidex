"""Genera digimon_datos.js (cartas Digimon para el Modo Cartas de Leyendas) desde sinnoh_cube.xlsx.

Uso (desde la carpeta herramientas): python build_web.py sinnoh_cube.xlsx ../digimon_datos.js
"""
import json, re, sys, difflib
import openpyxl

CUBE = sys.argv[1] if len(sys.argv) > 1 else "sinnoh_cube.xlsx"
OUT = sys.argv[2] if len(sys.argv) > 2 else "../digimon_datos.js"
DIGI = sys.argv[3] if len(sys.argv) > 3 else str(__import__("pathlib").Path(__file__).with_name("digi.json"))

# Elementos de Digimon -> tipo interno del motor (solo para que el motor no falle; la tabla de efectividad es la de Digimon).
ELEM = {"fire": "Fire", "water": "Water", "plant": "Grass", "electric": "Electric", "wind": "Flying",
        "earth": "Ground", "dark": "Dark", "ligth": "Fairy", "light": "Fairy", "neutral": "Normal"}
TIER = {"weak": ("W", "Weak Encounter Card", "Weak"), "moderate": ("M", "Moderate Encounter Card", "Moderate"),
        "strong": ("S", "Strong Encounter Card", "Strong"), "starter": (None, "Starter Card", "Starter")}
ALIAS = {"Biyomon": "Piyomon", "Phoenixmon": "Hououmon", "Armadillomon": "Armadimon", "Candlemon": "Candmon",
         "DemiDevimon": "Pico Devimon", "Dracmon": "Dracumon", "Goblimon": "Goburimon", "Gotsumon": "Gottsumon",
         "Huckmon": "Hackmon", "KoDokugumon": "Kodokugumon Child", "Mushroomon": "Mushmon", "Salamon": "Plotmon",
         "Syakomon": "Shakomon"}

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower().replace("ó", "o"))
D = json.load(open(DIGI, encoding="utf-8"))["D"]
byn = {norm(x["n"]): x for x in D}
wb = openpyxl.load_workbook(CUBE, data_only=True)
prop = {r[2]: r[12] for r in wb["lineas_propuestas"].iter_rows(min_row=2, values_only=True) if r[2] and r[12]}
ALL = [r for r in wb["pokemon"].iter_rows(min_row=2, values_only=True) if r[1]]
rows = [r for r in ALL if not r[36] and r[35] != "legendary"]  # salvajes e iniciales (sin villanos ni legendarios)
VILL = [r for r in ALL if r[36]]                                 # campaña 1: Soldados Pesadilla, Señores Demonio, Lucemon
LEG = [r for r in ALL if r[35] == "legendary" and r[13] != "Noble"]  # Arcángeles y legendarios de los santuarios


def image(name):
    x = byn.get(norm(ALIAS.get(name, name)))
    if x:
        return x["im"]
    if name in prop:
        return prop[name]
    return "https://digi-api.com/images/digimon/w/" + name.replace(" ", "_") + ".png"


def level(name):
    x = byn.get(norm(ALIAS.get(name, name)))
    return x["L"] if x else ""


names = {r[1] for r in rows}
# Digievoluciones (hoja "digievoluciones", hasta 3 por Digimon con su costo en PV). Si la hoja no existe, se usa evolve_into.
EVO = {}
if "digievoluciones" in wb.sheetnames:
    for e in wb["digievoluciones"].iter_rows(min_row=2, values_only=True):
        if e[0] and e[2] in names:
            EVO.setdefault(e[0], []).append((e[2], int(e[4] or 1), e[5] or ""))
pre = {}
for r in rows:
    if r[25]:
        pre[r[25]] = r[1]

cards, species, cid = [], [], 900000
wild = {"W": [], "M": [], "S": []}
starters, evolutions = [], []
for i, r in enumerate(rows):
    name = r[1]
    elem = (r[41] or "neutral").lower()
    tier_key = (r[35] or "weak").lower()
    tier, tag, enc = TIER.get(tier_key, TIER["weak"])
    learn = [ELEM.get((m or "neutral").lower(), "Normal") for m in r[21:25]]
    evo_rows = EVO.get(name) or ([(r[25], int(r[26] or 1), "Cube (original)")] if r[25] and r[25] in names else [])
    evo = [e[0] for e in evo_rows]
    d = {"pokedex_name": name, "internal_name": name, "health": int(r[19]), "initiative": int(r[18]),
         "types": [ELEM.get(elem, "Normal")], "moves": learn, "evolve_into": evo or None,
         "evolve_cost": evo_rows[0][1] if evo_rows else None, "evo_costs": {e[0]: e[1] for e in evo_rows},
         "evo_src": {e[0]: e[2] for e in evo_rows}, "encounter_tier": enc,
         "move_name": r[29] or "Placaje", "move_type": ELEM.get((r[30] or elem).lower(), "Normal"),
         "move_attack_strength": str(int(r[31] or 0)), "move_effect": r[32] or "", "sp": name, "evo": evo}
    meta = {"elem": elem, "attr": (r[40] or "").lower(), "img": image(name), "lv": level(name),
            "cls": r[11] or "", "pre": pre.get(name, "")}
    base = {"n": name, "gm": "", "desc": f"Digimon {meta['cls']}".strip(), "b": r[12], "k": r[13], "d": d, "dg": meta}
    copies = max(1, int(r[37] or 1))
    cid += 1
    first = dict(base, cid=cid, img=f"dg{cid}", img2=f"dg{cid}",
                 tags=[t for t in [r[12], r[13], tag] if t])
    if tier:
        first["tier"] = tier
        wild[tier].append(first)
    else:
        starters.append(first)
    for k in range(1, copies):
        cid += 1
        evolutions.append(dict(base, cid=cid, img=f"dg{cid}", img2=f"dg{cid}",
                               tags=["Evolution Card", r[12], r[13]]))
    stats = dict(hp=r[4], atk=r[5], def_=r[6], spa=r[7], spd=r[8], spe=r[9])
    species.append({"name": name, "num": 2000 + i, "types": [ELEM.get(elem, "Normal")],
                    "bs": [int(stats[k] or 50) for k in ("hp", "atk", "def_", "spa", "spd", "spe")]})

# Villanos y legendarios de la campaña 1 (misma forma de carta; el motor los usa en vez del Equipo Galaxia y los legendarios).
known = {x["name"] for x in species}
VT = {"grunt": ("Grunt", "Galactic Grunt"), "commander": ("Commander", "Galactic Commander"), "boss": ("Boss", "Galactic Boss")}
villains = []
seen_form = set()


def extra_card(r, enc, tags, sp, tier=None):
    global cid
    name, elem = r[1], (r[41] or "neutral").lower()
    learn = [ELEM.get((m or "neutral").lower(), "Normal") for m in r[21:25]]
    d = {"pokedex_name": name, "internal_name": name, "health": int(r[19]), "initiative": int(r[18]),
         "types": [ELEM.get(elem, "Normal")], "moves": learn, "evolve_into": None, "evolve_cost": None, "evo_costs": {},
         "evo_src": {}, "encounter_tier": enc, "move_name": r[29] or "Placaje", "move_type": ELEM.get((r[30] or elem).lower(), "Normal"),
         "move_attack_strength": str(int(r[31] or 0)), "move_effect": r[32] or "", "sp": sp, "evo": []}
    meta = {"elem": elem, "attr": (r[40] or "").lower(), "img": image(name), "lv": level(name), "cls": r[11] or "", "pre": "",
            "art": f"{int(r[0]):03}" if isinstance(r[0], (int, float)) else str(r[0])}
    cid += 1
    c = {"n": name if enc == "Legendary" else f"{name} ({r[28]})", "gm": "", "desc": r[28] or "", "d": d, "dg": meta,
         "cid": cid, "img": f"dg{cid}", "img2": f"dg{cid}", "tags": tags}
    if r[36]:
        c["dg"]["trainer"] = r[36]
    if tier:
        c.update(tier=tier, b=r[12], k=r[13])
    if sp not in known:
        known.add(sp)
        species.append({"name": sp, "num": 3000 + len(species), "types": [ELEM.get(elem, "Normal")],
                        "bs": [int(v or 50) for v in r[4:10]]})
    return c


for r in VILL:
    enc, tag = VT[r[35]]
    villains.append(extra_card(r, enc, [tag, "Space"], r[1]))
legends = []
for r in LEG:
    form = (r[39] or 0) >= 2
    if form and r[1] in ("Seraphimon", "Ophanimon", "Cherubimon"):
        sp = r[1] + "-Origin"            # la segunda fase de los Arcángeles (como Dialga/Palkia/Giratina Origen)
    elif form:
        continue                          # otras formas (Imperialdramon, Dukemon): solo en el mod de mesa
    else:
        sp = r[1]
    c = extra_card(r, "Legendary", [t for t in [r[13], "Legendary Encounter Card", r[12]] if t], sp, tier="L")
    if sp.endswith("-Origin"):
        c["d"]["pokedex_name"] = c["n"] = f"{r[1]} {r[28]}"   # p. ej. "Ophanimon Modo Caído"
    legends.append(c)

out = {"wild": wild, "starters": starters, "evolutions": evolutions, "species": species, "villains": villains, "legends": legends}
js = ("// Cartas Digimon para Leyendas (Modo Cartas). Generado por build_web.py desde sinnoh_cube.xlsx: no editar a mano.\n"
      "const DGDATA=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
open(OUT, "w", encoding="utf-8").write(js)
print("villanos:", len(villains), "legendarios:", len(legends))
print("salvajes:", {k: len(v) for k, v in wild.items()}, "iniciales:", len(starters), "evoluciones:", len(evolutions),
      "bytes:", len(js.encode()))
