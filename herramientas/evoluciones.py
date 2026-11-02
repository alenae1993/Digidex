"""Propone hasta 3 digievoluciones por Digimon del cube y las escribe en la hoja "digievoluciones".

Criterio (en orden):
  1. La evolución que ya tenía el cube (columna evolve_into) siempre se mantiene y va primero.
  2. Evoluciones oficiales según la DigiDex (Digi-API, "nextEvolutions"), solo si:
     - el destino está en el cube y es exactamente la etapa siguiente (Novato → Campeón → Perfecto → Mega);
     - no es una evolución especial (Warp, DNA/Jogress, "with ...", Death Evolution, Spirit, X-Antibody, juego de cartas);
     - no es una evolución "de fracaso" (Numemon, Sukamon, Nanimon, Raremon, Geremon...).
     - comparte elemento o tipo de Digimon con el original (el atributo solo no basta);
     Se ordenan por parecido: mismo elemento (+4), mismo atributo (+2), mismo tipo de Digimon (+2), mismo campo (+1).
  3. Si no hay 3 oficiales, se completa con Digimon de la etapa siguiente del mismo elemento y mismo tipo o atributo
     (marcados como "Propuesta").
Costo en PV: misma fórmula del cube (evolve_cost) con los totales de carta (iniciativa + vida).

Uso: python evoluciones.py sinnoh_cube.xlsx digi.json
"""
import json, re, sys
import openpyxl
from openpyxl.styles import Font, PatternFill

CUBE = sys.argv[1] if len(sys.argv) > 1 else "sinnoh_cube.xlsx"
DIGI = sys.argv[2] if len(sys.argv) > 2 else "digi.json"
MAX = 3
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower().replace("ó", "o"))
ALIAS = {"Biyomon": "Piyomon", "Phoenixmon": "Hououmon", "Armadillomon": "Armadimon", "Candlemon": "Candmon",
         "DemiDevimon": "Pico Devimon", "Dracmon": "Dracumon", "Goblimon": "Goburimon", "Gotsumon": "Gottsumon",
         "Huckmon": "Hackmon", "KoDokugumon": "Kodokugumon Child", "Mushroomon": "Mushmon", "Salamon": "Plotmon",
         "Syakomon": "Shakomon"}
FAIL = {"numemon", "sukamon", "nanimon", "raremon", "geremon", "platinumsukamon", "monzaemon"}
SPECIAL = re.compile(r"warp|with |death|jogress|dna|spirit|card game|x-antibody|armor|digimental", re.I)
STAGE = {"Child": 1, "Adult": 2, "Armor": 2, "Perfect": 3, "Ultimate": 4}
STAGE_ES = {1: "Novato", 2: "Campeón", 3: "Perfecto", 4: "Mega"}

D = json.load(open(DIGI, encoding="utf-8"))["D"]
byn = {norm(x["n"]): x for x in D}
wb_v = openpyxl.load_workbook(CUBE, data_only=True)
prop = {r[2]: r[3] for r in wb_v["lineas_propuestas"].iter_rows(min_row=2, values_only=True) if r[2]}
rows = [r for r in wb_v["pokemon"].iter_rows(min_row=2, values_only=True) if r[1]]


def digi(name):
    for n in (ALIAS.get(name), prop.get(name), name):
        if n and norm(n) in byn:
            return byn[norm(n)]


info = {}
for r in rows:
    x = digi(r[1])
    info[r[1]] = {"row": r, "dg": x, "elem": (r[41] or "neutral").lower(), "attr": (r[40] or "").lower(),
                  "total": (r[18] or 0) + (r[19] or 0), "stage": STAGE.get(x["L"]) if x else None,
                  "types": set(w for t in (x["t"] if x else []) for w in t.lower().split()),
                  "fields": set(x["f"] if x else [])}
# Etapa de los que no están en la DigiDex: la de su pre-evolución + 1.
for _ in range(4):
    for n, i in info.items():
        tgt = i["row"][25]
        if tgt in info and info[tgt]["stage"] is None and i["stage"]:
            info[tgt]["stage"] = i["stage"] + 1
id2cube = {}
for n, i in info.items():
    if i["dg"]:
        id2cube.setdefault(i["dg"]["id"], n)


def cost(a, b):
    ua, ub = info[a]["total"], info[b]["total"]
    return max(1, round(((ub - 6) * (ub - 7) - (ua - 6) * (ua - 7)) / 15) + 1)


def score(a, b):
    A, B = info[a], info[b]
    s = 4 * (A["elem"] == B["elem"]) + 2 * (A["attr"] == B["attr"] and A["attr"] != "")
    s += 2 * bool(A["types"] & B["types"]) + 1 * bool(A["fields"] & B["fields"])
    return s


def why(a, b):
    A, B = info[a], info[b],
    m = [k for k, ok in [("mismo elemento", A["elem"] == B["elem"]), ("mismo atributo", A["attr"] == B["attr"] and A["attr"]),
                         ("mismo tipo", A["types"] & B["types"]), ("mismo campo", A["fields"] & B["fields"])] if ok]
    return ", ".join(m) or "evolución oficial"


result = {}
for n, i in info.items():
    st = i["stage"]
    if not st or st >= 4:
        continue
    chosen = []
    primary = i["row"][25]
    if primary in info:
        chosen.append((primary, "Cube (original)"))
    official = []
    if i["dg"]:
        for did, nm, cond in i["dg"]["ne"]:
            if cond and SPECIAL.search(cond) and not cond.lower().startswith("with or without"):
                continue
            t = id2cube.get(did)
            if not t or t == n or t == primary or info[t]["stage"] != st + 1 or norm(t) in FAIL:
                continue
            # Coherencia mínima: mismo elemento o mismo tipo de Digimon (solo el atributo no basta).
            if info[t]["elem"] != i["elem"] and not (info[t]["types"] & i["types"]):
                continue
            if t not in official:
                official.append(t)
    official.sort(key=lambda t: -score(n, t))
    for t in official:
        if len(chosen) >= MAX:
            break
        chosen.append((t, "Oficial (Digi-API)"))
    if len(chosen) < MAX:
        pool = [t for t, j in info.items() if j["stage"] == st + 1 and t not in dict(chosen) and t != n
                and j["elem"] == i["elem"] and (j["types"] & i["types"] or (j["attr"] == i["attr"] and i["attr"]))
                and norm(t) not in FAIL]
        pool.sort(key=lambda t: (-score(n, t), abs(info[t]["total"] - i["total"] - 3)))
        for t in pool[:MAX - len(chosen)]:
            chosen.append((t, "Propuesta (mismo elemento)"))
    if chosen:
        result[n] = [(t, src, cost(n, t), why(n, t)) for t, src in chosen]

# Escribe la hoja (se conserva el resto del libro con sus fórmulas).
wb = openpyxl.load_workbook(CUBE)
if "digievoluciones" in wb.sheetnames:
    del wb["digievoluciones"]
ws = wb.create_sheet("digievoluciones")
ws.append(["Digimon", "Etapa", "Evoluciona a", "Etapa destino", "Costo PV", "Fuente", "Por qué es coherente",
           "Elemento", "Elemento destino", "Atributo", "Atributo destino"])
fills = {"Cube (original)": "FFFFFF", "Oficial (Digi-API)": "E2F0D9", "Propuesta (mismo elemento)": "FFF2CC"}
for n, lst in result.items():
    for t, src, c, w in lst:
        ws.append([n, STAGE_ES[info[n]["stage"]], t, STAGE_ES.get(info[t]["stage"], ""), c, src, w,
                   info[n]["elem"], info[t]["elem"], info[n]["attr"], info[t]["attr"]])
        for cell in ws[ws.max_row]:
            cell.fill = PatternFill("solid", fgColor=fills[src])
for cell in ws[1]:
    cell.font = Font(bold=True)
for col, w in zip("ABCDEFGHIJK", [18, 10, 20, 12, 9, 26, 40, 10, 14, 10, 14]):
    ws.column_dimensions[col].width = w
ws.freeze_panes = "A2"
wb.save(CUBE)

from collections import Counter
print("Digimon con evolución:", len(result), "· total evoluciones:", sum(len(v) for v in result.values()))
print("por cantidad:", Counter(len(v) for v in result.values()))
print("por fuente:", Counter(s for v in result.values() for _, s, _, _ in v))
json.dump(result, open("evoluciones.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
