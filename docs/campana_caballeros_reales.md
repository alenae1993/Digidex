# Campaña 6 · Los Caballeros Reales

Sexta campaña de **Leyendas del Mundo Digital**. Está inspirada en **Digimon X-Evolution** y en el bloque de los **Caballeros Reales** (Royal Knights) del póster *Main Forces of the Digital World*.

Usa la plantilla **Corazón de Sinnoh**. Es la campaña con los rivales más fuertes: aquí los comandantes son Caballeros Reales de nivel Mega desde el principio.

> **Estado:** propuesta para revisar. Lo marcado con **⚠** queda pendiente de decisión.

---

## Historia

**Yggdrasil**, el sistema que gobierna el Mundo Digital, decidió que hay demasiados Digimon. Activó el **Programa X**, un virus que borra a todo Digimon que toca. Pero algunos sobrevivieron: sus datos reaccionaron al virus y generaron el **X-Antibody**, que los hace más fuertes.

Para Yggdrasil, esos sobrevivientes son un error. Puso en marcha el **Proyecto Arca**: guardar en el Arca solo a los Digimon que él elija y borrar al resto. Y mandó a los **Caballeros Reales** que le son leales a cazar a los Digimon con X-Antibody.

No todos los Caballeros obedecieron. **Alphamon**, **Omegamon** y **Dukemon** se rebelaron, y por eso sus datos también mutaron con el X-Antibody.

**Eres un niño del mundo real.** Un Digimon pequeño que escapó del borrado, **Dorumon**, abre una grieta hasta tu pantalla y te pide ayuda. Los Caballeros leales le quitaron a los rebeldes los **3 Fragmentos del Programa X**, la única forma de entender (y detener) el borrado. Si los recuperas, podrás llegar hasta Yggdrasil.

---

## Cómo se juega el inicio

| Paso del juego actual | En esta campaña |
|---|---|
| Elegir pueblo natal | Igual que en la campaña 1 |
| Elegir inicial | Los 15 iniciales del cube **más Dorumon** |
| Seguidor | Elegido entre los 3 Caballeros rebeldes (los dioses de esta campaña) |

**⚠** Para que Dorumon sea elegible hay que marcarlo como inicial (columna `is_starter`) solo para esta campaña. La otra opción es que Dorumon sea solo el personaje que te llama, sin cambiar los iniciales.

---

## Equivalencias con Corazón de Sinnoh

| Corazón de Sinnoh | Los Caballeros Reales | Regla |
|---|---|---|
| Reclutas Galaxia en cada pueblo natal | **Soldados del Arca**, Digimon que obedecen a Yggdrasil | Igual |
| Venus, Ceres y Saturno en los lagos (2, 3 y 4 de sus 5 Pokémon) | **Craniummon, Duftmon y Examon**, los 3 cazadores | Igual, en cualquier orden |
| Fragmentos de Emoción, Conocimiento y Voluntad (+1 espacio cada uno) | **Fragmentos del Programa X**: del Escudo, de la Estrategia y del Dragón (+1 espacio cada uno) | Igual |
| Ofrenda en el Santuario del Origen → Corazón de Sinnoh | Ofrenda en el **Santuario de los Rebeldes** → **X-Antibody** (+1 de ataque a ataques de su mismo elemento) | Igual |
| Helio en el Templo (6 de 8) | **Yggdrasil en el Arca** (6 de 8; el último siempre es Yggdrasil_7D6) | Igual |
| Dialga, Palkia y Giratina | **Omegamon (X-Antibody), Dukemon (X-Antibody) y Alphamon** | Igual. Alphamon toma el lugar de Giratina y su segunda forma: **Alphamon (Ouryuken)** |
| Final: Héroe o Traidor | **Héroe:** derrotas a Yggdrasil y el borrado se detiene. **Traidor:** aceptas ser el decimocuarto Caballero Real y el Arca se cierra | Igual |

---

## Enemigos

### Soldados del Arca (equivalen a los 8 Reclutas)

| Digimon | Nivel |
|---|---|
| PawnChessmon | Novato |
| Kotemon | Novato |
| Huckmon | Novato |
| Spadamon | Novato |
| Dracomon | Novato |
| Liollmon | Novato |
| RookChessmon | Campeón |
| Dinohumon | Campeón |

Todos existen ya en el cube.

### Los 3 cazadores (equivalen a los Comandantes, 5 Digimon cada uno)

| Comandante | Zona del mapa | Su equipo (el último es su as) | Fragmento |
|---|---|---|---|
| **Craniummon**, el escudo de Yggdrasil | Montaña templada | KnightChessmon, Musyamon, Knightmon, Grademon, **Craniummon** | Fragmento del Escudo |
| **Duftmon**, el estratega | Bosque templado | Leormon, Panjyamon, SaberLeomon, Kaiser Leomon, **Duftmon** | Fragmento de la Estrategia |
| **Examon**, el dragón | Montaña cálida | Airdramon, Coredramon, Wingdramon, Slayerdramon, **Examon** | Fragmento del Dragón |

**Idea opcional:** cuando a Duftmon le queda un solo Digimon, cambia a **Duftmon (Leopard Mode)**, que también existe en la DigiDex. **⚠** Esto requiere código nuevo.

### La corte de Yggdrasil (equivale a los 8 de Helio)

Son los Caballeros que siguen siendo leales:

| # | Digimon | Nota |
|---|---|---|
| 1 | Magnamon | El más joven de los Caballeros (nivel Campeón en la DigiDex) |
| 2 | Gankoomon | |
| 3 | JESmon | Discípulo de Gankoomon |
| 4 | Sleipmon | |
| 5 | Dynasmon | |
| 6 | Lord Knightmon | Crusadermon en el doblaje |
| 7 | Ulforce V-dramon | |
| 8 | **Yggdrasil_7D6** | El as; siempre sale último |

**⚠ Yggdrasil_7D6** no está en la DigiDex, así que habría que crear su carta a mano, con imagen propia. Si eso complica, la alternativa es **Omegamon Zwart**, la copia oscura de Omegamon que creó Yggdrasil. Esa sí existe en la DigiDex.

### Los 3 dioses

| Dios | Equivale a | Nota |
|---|---|---|
| **Omegamon (X-Antibody)** | Dialga | |
| **Dukemon (X-Antibody)** | Palkia | |
| **Alphamon** → **Alphamon (Ouryuken)** | Giratina con sus 2 formas | El caballero "fantasma" que vuelve cuando el mundo está en peligro |

---

## El mapa

Se usa el **mismo tablero de la campaña 1** (Isla File y el continente Server):
- El **Arca** está en el **Monte Infinito**, en el centro del mapa. Es el lugar del combate final.
- El **Santuario de los Rebeldes** es el lugar de la ofrenda. **⚠** Propuesta: que sea el mismo nodo del Altar de Yggdrasil de la campaña 1.

---

## Conflictos con el cube salvaje

Varios Caballeros ya están en el mazo salvaje: **Alphamon** (final de la línea de Dorumon), **Jesmon**, **Sleipmon**, **Dynasmon**, **UlforceVeedramon**, **Crusadermon** y **Gallantmon**.

Es la misma decisión pendiente que con Piedmon y MetalSeadramon en la campaña 3:
- **Opción recomendada:** dejar los salvajes como están y crear cartas aparte de villano, por ejemplo **"Sleipmon (Caballero Real)"**, como hace el mod con el Equipo Galaxia.
- **Otra opción:** sacarlos del mazo salvaje.

Además, en la campaña 1 los Caballeros Reales son **legendarios de santuario**. En esta campaña no se pueden capturar mientras sirvan a Yggdrasil.

---

## Qué hay que crear

| Tipo | Cantidad | Detalle |
|---|---|---|
| Cazadores | 3 | Craniummon, Duftmon y Examon (nuevos) |
| Equipos de comandante | 2 nuevos | Grademon y Kaiser Leomon. El resto ya está en el cube |
| Corte | 8 | Magnamon, Gankoomon y Yggdrasil_7D6 (nuevos) y 5 cartas de villano de Caballeros que ya están en el cube |
| Dioses | 4 cartas | Omegamon (X-Antibody), Dukemon (X-Antibody), Alphamon y Alphamon (Ouryuken) |
| Código | 0–1 ajuste | Dorumon como inicial y el cambio de forma de Duftmon, si se usan |
| Textos | — | Cartas de Acto, nombres de los Fragmentos y del X-Antibody |

---

## Modo extra (para más adelante): las pruebas de los 13 Caballeros

Otra forma de usar a los Caballeros, sin villano: un modo tipo "liga" en el que recorres el mapa y superas la prueba de cada Caballero en su santuario. Lo dejo anotado como idea, no como campaña.
