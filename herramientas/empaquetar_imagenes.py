"""Quita el fondo blanco de las ilustraciones y las empaqueta en img/digimon_imagenes.bin + digimon_imagenes.js.

Entrada: un JSON {nombre del cube: ruta de la imagen original}.
Salida:
  - img/digimon_imagenes.bin: encabezado de 16 bytes "DGDEXPAK" + ceros, y luego las imágenes WebP pegadas.
  - digimon_imagenes.js: const DGIMG = {pack, v, idx: {nombre: [inicio, bytes]}}.
Un solo archivo binario evita subir cientos de imágenes sueltas por la web de GitHub (máximo 100 archivos por subida).

Uso: python empaquetar_imagenes.py mapa.json carpeta_salida
"""
import io, json, sys, hashlib
import numpy as np
from PIL import Image
from scipy import ndimage

UMBRAL = 28      # cuánto se puede alejar del blanco un píxel de fondo
SIZE = 320


def quitar_fondo(im):
    im = im.convert("RGB")
    if im.size != (SIZE, SIZE):
        im.thumbnail((SIZE, SIZE), Image.LANCZOS) if max(im.size) > SIZE else None
        if max(im.size) < SIZE:
            k = SIZE / max(im.size)
            im = im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)
        canvas = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))
        canvas.paste(im, ((SIZE - im.size[0]) // 2, (SIZE - im.size[1]) // 2))
        im = canvas
    a = np.asarray(im).astype(np.int16)
    white = (a >= 255 - UMBRAL).all(axis=2)
    lab, _ = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # Borde suave: los píxeles junto al fondo quedan semitransparentes según lo blancos que sean.
    edge = ndimage.binary_dilation(bg) & ~bg
    whiteness = a.min(axis=2)
    soft = np.clip((255 - whiteness) * 255 // (UMBRAL * 3), 60, 255).astype(np.uint8)
    alpha[edge] = np.minimum(alpha[edge], soft[edge])
    out = np.dstack([np.asarray(im), alpha])
    return Image.fromarray(out, "RGBA")


def main():
    mapping = json.load(open(sys.argv[1], encoding="utf-8"))
    outdir = sys.argv[2]
    header = b"DGDEXPAK" + b"\0" * 8
    blob, idx = bytearray(header), {}
    for name, path in sorted(mapping.items()):
        img = quitar_fondo(Image.open(path))
        buf = io.BytesIO()
        img.save(buf, "WEBP", quality=82, method=6)
        data = buf.getvalue()
        idx[name] = [len(blob), len(data)]
        blob += data
    v = hashlib.sha1(blob).hexdigest()[:8]
    open(f"{outdir}/img/digimon_imagenes.bin", "wb").write(blob)
    js = ("// Índice de ilustraciones Digimon (generado por empaquetar_imagenes.py; no editar a mano).\n"
          "const DGIMG=" + json.dumps({"pack": "img/digimon_imagenes.bin", "v": v, "idx": idx}, ensure_ascii=False,
                                       separators=(",", ":")) + ";\n")
    open(f"{outdir}/digimon_imagenes.js", "w", encoding="utf-8").write(js)
    print("imágenes:", len(idx), "· paquete:", round(len(blob) / 1e6, 2), "MB")


if __name__ == "__main__":
    main()
