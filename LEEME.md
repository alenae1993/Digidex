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

## Lo que todavía es de Sinnoh

- El mapa, los nombres de los pueblos y las cartas de pueblo.
- Las cartas de Acto, Destino y Santuario.
- Las Tarjetas de Entrenador.
- El Equipo Galaxia (reclutas, comandantes y Helio), los legendarios, los Dioses y los Ultraentes. Las campañas Digimon están en `docs/` y se programan después.
- Los íconos de los alimentos y de las capturas (solo cambian los textos).

## Imágenes

Las cartas se dibujan con los datos del cube. Para la ilustración, el juego intenta usar la imagen de Digi-API. Si el navegador no la deja usar (CORS), la carta muestra las iniciales del Digimon.

Cuando se descarguen las imágenes:
1. Ponlas en `img/<Nombre del cube>.png`, por ejemplo `img/Agumon.png`.
2. Cambia `DG_LOCAL_IMG` a `true` en `digimon_capa.js`.

## Publicar

1. Sube todos los archivos a la raíz del repo (Add file → Upload files).
2. En Settings → Pages, elige "Deploy from a branch", rama `main`, carpeta `/ (root)`.
3. Espera 1 o 2 minutos y abre https://alenae1993.github.io/Digidex/.

**Importante:** depende de que DexPoke siga publicado. Si en DexPoke se renombra o se borra algún archivo del juego de Sinnoh, esta página puede dejar de funcionar.
