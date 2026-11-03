# Digidex · Leyendas Digimon (versión de prueba)

**Leyendas Digimon** es el juego de mesa de Leyendas de Sinnoh en **Modo Cartas**, con las cartas Digimon de `sinnoh_cube.xlsx` en vez de las Pokémon.

Sitio: https://alenae1993.github.io/Digidex/

## Cómo funciona

Esta página **reutiliza el motor de DexPoke sin modificarlo**: mapa, turnos, pueblos, combates de cartas y campañas. Los carga desde https://alenae1993.github.io/DexPoke/, que está en el mismo dominio. Por eso el repo es liviano: no copia los 120 MB de DexPoke.

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Copia de `batalla.html` de DexPoke con tres cambios: `<base href="../DexPoke/">`, guardado propio (`digidex-batalla-v1`, para no pisar la partida de Sinnoh) y los tres scripts Digimon. No tiene service worker. |
| `digimon_datos.js` | **Generado.** Las 376 cartas: 96 débiles, 134 moderadas, 131 fuertes, 15 iniciales y 336 copias de evolución. |
| `digimon_motor.js` | Registra cada Digimon como especie del motor y reemplaza los mazos de salvajes, iniciales y evoluciones. Se carga antes de `sinnoh.js`. |
| `digimon_capa.js` | Lo demás. Se carga al final. |
| `herramientas/evoluciones.py` | Escribe la hoja `digievoluciones` del cube: hasta 3 digievoluciones por Digimon con su costo en PV. Uso: `python evoluciones.py sinnoh_cube.xlsx digi.json` (después abre el cube en Excel y guárdalo, para que se recalculen las fórmulas). |
| `herramientas/anadir_imagenes.py` | Agrega ilustraciones con fondo transparente al paquete (villanos y legendarios nuevos). |
| `herramientas/build_web.py` | Regenera `digimon_datos.js` desde el cube: `python build_web.py sinnoh_cube.xlsx ../digimon_datos.js`. Usa `digi.json`, los datos de la DigiDex. |
| `docs/` | Campañas y economía (propuestas). |

`digimon_capa.js` se encarga de:
- dibujar las cartas;
- aplicar la tabla de elementos;
- poner los iniciales;
- forzar el Modo Cartas;
- cambiar los textos.

## Reglas que cambian respecto de Sinnoh

- **Solo Modo Cartas.** Las batallas del motor Pokémon no sirven para Digimon.
- **Elementos de Digimon Story:**
  - Fuego > Planta > Agua > Fuego.
  - Eléctrico > Viento > Tierra > Eléctrico.
  - Luz y Oscuridad se ganan entre sí.
  - Neutral no tiene ventajas ni debilidades.
  - Ventaja: +2 de fuerza. Desventaja: −2.
- **Digievoluciones:** hasta 3 por Digimon, cada una con su costo en PV. Salen de la hoja `digievoluciones` del cube; si la editas, vuelve a correr `build_web.py`.
- **Iniciales:** los 15 del cube, 2 por pueblo (Canal tiene solo a Gomamon).
- **Textos:** Bonguri → alimentos (Carne, Banana, Pescado Fresco, Manzana, Piña, Zanahoria, DigiProteína); Balls → Captura Básica, Mejorada, Avanzada y Ancestral.

## Campaña 1 · La rebelión de Lucemon (jugable)

La campaña del juego es la de `docs/campana_lucemon.md`, con las mismas reglas del motor:

| En Sinnoh | En Digidex |
|---|---|
| Pueblos (Stark, Puntaneva…) | Aldeas: Ciudad Factorial, Aldea Freezeland, Playa de Coral, Ciudad del Comienzo, Tierra de Escarabajos, Castillo Geko, Pueblo Juguete, Aldea Yokomon |
| Reclutas del Equipo Galaxia | Soldados Pesadilla (8 Digimon) |
| 3 Comandantes en los lagos | Los 6 Señores Demonio, de a dos por Puerta: Lilithmon y Leviamon · Belphemon y Barbamon · Daemon y Beelzemon. Cada victoria da 2 Emblemas = +1 espacio de equipo |
| Helio en el Templo de Sinnoh | Lucemon en la Puerta de Cocytus (5 de su corte + Lucemon Satan Mode, que siempre sale) |
| Corazón de Sinnoh en el Santuario Origin | Emblema de la Luz en el Altar de Yggdrasil |
| Dialga, Palkia, Giratina (+ Forma Origen) | Seraphimon, Ophanimon, Cherubimon (+ Forma Pluma, Modo Caído, Forma Vicio) |
| Legendarios de los santuarios | Goddramon, Holydramon, Megidramon, Omegamon, Duftmon, Craniummon, Huanglongmon, Dukemon, Examon, Alphamon, Magnamon, Imperialdramon, Baihumon, Xuanwumon, Zhuqiaomon, los 3 Ancient y Susanoomon |
| Cartas de Acto, Cambio de Destino, Santuario y Pueblo | Las del mod en español (`img/cartas/`) |

Los villanos y legendarios salen del cube (`build_web.py` ahora también exporta `villains` y `legends`).

### Cartas y fichas del mod

- **Cartas Digimon:** son las mismas del juego de mesa (las que arma el `card_generator` del mod), no un dibujo aproximado. Están en `img/digimon_cartas.bin` (446 cartas a 300 px), con su índice en `digimon_cartas.js`. Cada carta del cube lleva su fila (`dg.row`), que es el número del archivo `card_fronts/<fila>_<nombre>.png`.
- **Fichas del tablero:** los huertos de alimentos, arrecifes, aldeas, Puertas, Puerta de Cocytus, Altar de Yggdrasil, legendarios, Señores Demonio, alijos y artefactos usan las imágenes nuevas de `assets/tokens`. La tabla `herramientas/fichas_tablero.json` dice qué imagen de Sinnoh reemplaza cada una.
- Para rehacer el paquete después de cambiar el cube o las fichas: generar las cartas con el `card_generator`, y luego `python herramientas/empaquetar_cartas.py <carpeta card_fronts> herramientas/fichas_tablero.json . <carpeta assets del mod>`.
- Sin ilustración todavía (la carta muestra "?"): Soloogarmon, Zanbamon, Pulsemon, Fujitsumon y SantaAgumon (este último usa el dibujo anterior).

## Lo que todavía es de Sinnoh

- El mapa: la forma del tablero, los colores de las casillas y los santuarios genéricos (las fichas ya son Digimon).
- Las ilustraciones del panel del entrenador (mochila, Poké Balls, "Fragmentos del Corazón"): son imágenes del motor.
- Las Tarjetas de Entrenador y la campaña Ultra Explosión.

## Imágenes

Las ilustraciones oficiales están en **`img/digimon_imagenes.bin`**, un solo archivo de 7,2 MB con 395 imágenes WebP de fondo transparente. Su índice está en `digimon_imagenes.js`. El juego baja el paquete una vez y lo guarda en la caché del navegador.

- Las imágenes se tomaron de repositorios públicos de GitHub con el arte oficial: `AMGHs/dimigon-imgs`, `TheWitchSaphire/digimon-bingo-images` y, para 27 Digimon, las versiones de 120 px de `tyreest19/PokemonVsDigimon`, que se ven algo borrosas.
- El fondo blanco se quitó con `herramientas/empaquetar_imagenes.py`, que rellena desde los bordes. Así, lo blanco dentro del Digimon se conserva.
- Para agregar o cambiar una imagen: arma un JSON `{"Nombre del cube": "ruta/imagen.png"}` y corre `python empaquetar_imagenes.py mapa.json ..`.
- Los Digimon sin imagen en el paquete intentan cargarla desde Digi-API. Si no se puede, la carta muestra sus iniciales.

## Publicar

1. Sube todos los archivos a la raíz del repo (Add file → Upload files).
2. En Settings → Pages, elige "Deploy from a branch", rama `main`, carpeta `/ (root)`.
3. Espera 1 o 2 minutos y abre https://alenae1993.github.io/Digidex/.

**Importante:** depende de que DexPoke siga publicado. Si en DexPoke se renombra o se borra algún archivo del juego de Sinnoh, esta página puede dejar de funcionar.
