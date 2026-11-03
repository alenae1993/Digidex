"""Empaqueta las cartas reales del mod y las fichas nuevas del tablero en img/digimon_cartas.bin + digimon_cartas.js.

Las cartas Digimon son las mismas que arma el card_generator del mod (card_fronts/<fila>_<nombre>.png), reducidas a
300 px de ancho como las cartas de DexPoke. Las fichas del mapa son las imágenes nuevas de assets/tokens (y las
fichas de alijo) que reemplazan a cada imagen de Sinnoh del tablero web.

Entrada:
  carpeta_cartas   carpeta con las cartas: <fila>.webp/.png o <fila>_<nombre>.png (la fila es la del cube, desde 0)
  fichas.json      {clave de imagen de Sinnoh (k3, c198000…): ruta de la ficha nueva, relativa a carpeta_assets}
  carpeta_assets   la carpeta assets del mod (por defecto, la carpeta de fichas.json)
Salida (en la carpeta del Digidex):
  img/digimon_cartas.bin   encabezado de 16 bytes "DGCARPAK" + ceros, y luego las imágenes WebP pegadas
  digimon_cartas.js        const DGCARTAS = {pack, v, cartas: {fila: [inicio, bytes]}, fichas: {clave: [inicio, bytes]}}
Un solo archivo binario evita subir cientos de imágenes sueltas por la web de GitHub (máximo 100 archivos por subida).

Uso: python empaquetar_cartas.py carpeta_cartas fichas_tablero.json carpeta_digidex [carpeta_assets]
"""
import hashlib
import io
import json
import re
import sys
from pathlib import Path

from PIL import Image

CARTAS, FICHAS, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
ASSETS = Path(sys.argv[4]) if len(sys.argv) > 4 else FICHAS.parent
ANCHO = 300   # ancho de las cartas (igual que DexPoke)
FICHA = 256   # lado máximo de las fichas del mapa


def webp(im):
    b = io.BytesIO(); im.save(b, format="WEBP", quality=82); return b.getvalue()


data, cartas, fichas = bytearray(b"DGCARPAK" + bytes(8)), {}, {}
for f in sorted(CARTAS.iterdir()):
    m = re.match(r"(\d+)(?:_.*)?\.(webp|png)$", f.name)
    if not m:
        continue
    im = Image.open(f).convert("RGBA")  # conserva las esquinas redondeadas transparentes
    if im.width != ANCHO:
        im = im.resize((ANCHO, round(im.height * ANCHO / im.width)), Image.LANCZOS)
    b = webp(im); cartas[int(m.group(1))] = [len(data), len(b)]; data += b
hechas = {}
for clave, ruta in json.load(open(FICHAS, encoding="utf-8")).items():
    if ruta not in hechas:
        im = Image.open(ASSETS / ruta).convert("RGBA"); im.thumbnail((FICHA, FICHA), Image.LANCZOS)
        b = webp(im); hechas[ruta] = [len(data), len(b)]; data += b
    fichas[clave] = hechas[ruta]
(OUT / "img").mkdir(exist_ok=True)
(OUT / "img/digimon_cartas.bin").write_bytes(data)
v = hashlib.md5(data).hexdigest()[:8]
js = ("// Índice de las cartas del mod y las fichas del tablero (generado por empaquetar_cartas.py; no editar a mano).\n"
      "const DGCARTAS=" + json.dumps({"pack": "img/digimon_cartas.bin", "v": v, "cartas": cartas, "fichas": fichas},
                                     separators=(",", ":")) + ";\n")
(OUT / "digimon_cartas.js").write_text(js, encoding="utf-8")
print(f"cartas: {len(cartas)}  fichas: {len(fichas)} ({len(hechas)} imágenes)  {len(data) / 1e6:.1f} MB")
