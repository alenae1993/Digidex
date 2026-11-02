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
rows = [r for r in wb["pokemon"].iter_rows(min_row=2, values_only=True) if r[1]]


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
    evo = [r[25]] if r[25] and r[25] in names else []
    d = {"pokedex_name": name, "internal_name": name, "health": int(r[19]), "initiative": int(r[18]),
         "types": [ELEM.get(elem, "Normal")], "moves": learn, "evolve_into": evo or None,
         "evolve_cost": int(r[26]) if evo and r[26] not in (None, "") else None, "encounter_tier": enc,
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

out = {"wild": wild, "starters": starters, "evolutions": evolutions, "species": species}
js = ("// Cartas Digimon para Leyendas (Modo Cartas). Generado por build_web.py desde sinnoh_cube.xlsx: no editar a mano.\n"
      "const DGDATA=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
open(OUT, "w", encoding="utf-8").write(js)
print("salvajes:", {k: len(v) for k, v in wild.items()}, "iniciales:", len(starters), "evoluciones:", len(evolutions),
      "bytes:", len(js.encode()))
