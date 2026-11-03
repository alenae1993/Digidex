"""Agrega ilustraciones (PNG con fondo transparente, p. ej. las de assets/card_generator/pokemon del mod) al paquete
img/digimon_imagenes.bin de Digidex, sin tocar las que ya están.
Uso: python anadir_imagenes.py mapa.json carpeta_digidex     (mapa = {"Nombre en la carta": "ruta.png"})
"""
import hashlib, io, json, os, re, sys
from PIL import Image

MAPA, DGX = sys.argv[1], sys.argv[2]
js_path, bin_path = os.path.join(DGX, "digimon_imagenes.js"), os.path.join(DGX, "img/digimon_imagenes.bin")
js = open(js_path, encoding="utf-8").read()
data = json.loads(re.search(r"const DGIMG=(\{.*\});", js, re.S).group(1))
blob = bytearray(open(bin_path, "rb").read())
for name, path in json.load(open(MAPA, encoding="utf-8")).items():
    im = Image.open(path).convert("RGBA")
    bb = im.getbbox()
    if bb:
        im = im.crop(bb)
    im.thumbnail((320, 320), Image.LANCZOS)
    canvas = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((320 - im.width) // 2, (320 - im.height) // 2))
    buf = io.BytesIO(); canvas.save(buf, "WEBP", quality=82, method=6)
    b = buf.getvalue()
    data["idx"][name] = [len(blob), len(b)]
    blob += b
data["v"] = hashlib.md5(blob).hexdigest()[:8]
open(bin_path, "wb").write(blob)
head = js.split("const DGIMG=")[0]
open(js_path, "w", encoding="utf-8").write(head + "const DGIMG=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("imágenes:", len(data["idx"]), "bytes:", len(blob))
