# Supervivencia en Isla — Especificación de Reglas v1.0

**Fecha:** 2026-08-11  
**Creador:** Lopez Jr (para Juan Andres)  
**Estado:** ✅ APROBADO (listo para implementación)

---

## 1. Descripción General

**Supervivencia en Isla** es un juego multiplayer en tiempo real para **2-4 jugadores** que compiten en un tablero de **12×12 casillas** (144 celdas). El objetivo es ser el **último jugador en pie** después de explorar, recopilar recursos, combatir enemigos, y comprar equipo en la tienda.

**Tema:** Isla tropical con vegetación verde. El color predominante es **verde** (hue OKLCH 145).

---

## 2. Setup del Juego

### 2.1 Tablero

**Dimensiones:** 12×12 casillas (144 totales)

**Distribución de casillas (aleatoria por partida):**
| Tipo | Cantidad | Color | Descripción |
|---|---|---|---|
| Vacía | 43 | ⚪ Blanco/Gris | Espacio libre, sin contenido |
| Recurso Común | 36 | 🟩 Verde claro | Madera, piedra, hojas (valor: $10) |
| Recurso Raro | 22 | 🟩 Verde medio | Cristales, minerales (valor: $30) |
| Recurso Muy Raro | 14 | 🟩 Verde oscuro | Gemas, artefactos (valor: $75) |
| Enemigo | 18 | 🔴 Rojo | Monstruos del tablero |
| Tienda | 12 | 🟨 Amarillo | NPC vendedor |

**Generación:** El tablero se genera **UNA SOLA VEZ** al iniciar la partida (aleatorio, **varía cada partida**).

### 2.2 Jugadores

Cada jugador comienza en una **posición aleatoria** del tablero (garantizando que no haya superposición inicial).

**Stats iniciales:**
- **HP:** 100
- **Dinero:** $0
- **Inventario:** 5 slots (expandible comprando mochilas en tienda)
- **Equipo:** Sin armas, sin armadura

---

## 3. Mecánica de Movimiento

### 3.1 Sistema de Dados

Cada turno, el jugador lanza **2 dados:**
1. **Dado de Número:** 1–6 (cantidad de casillas a moverse)
2. **Dado de Dirección:** Arriba, Abajo, Izquierda, Derecha (**SIN diagonal**)

**Resultado:** Se mueve `[número]` casillas en la dirección seleccionada.

**Validación:** El servidor valida que el movimiento sea dentro del tablero (0-11 en ambos ejes).

### 3.2 Límites del Tablero (Toroidal)

- El tablero es **toroidal** (tipo Snake/Pac-Man):
  - Si sales del borde derecho (x > 11), reapareces en el borde izquierdo (x = 0)
  - Si sales del borde inferior (y > 11), reapareces en el borde superior (y = 0)
  - Y viceversa (arriba ↔ abajo, izquierda ↔ derecha)

---

## 4. Casillas y sus Efectos

### 4.1 Casilla Vacía (⚪ Blanco)

**Efecto:** Nada sucede. El jugador se detiene ahí.

---

### 4.2 Casilla Recurso (🟩 Verde)

**Efecto:** El jugador **recibe el recurso** automáticamente.

**Recursos y valores:**
| Tipo | Valor (venta) | Rareza |
|---|---|---|
| Madera | $10 | Común |
| Piedra | $10 | Común |
| Hoja | $10 | Común |
| Cristal | $30 | Raro |
| Mineral | $30 | Raro |
| Gema | $75 | Muy Raro |
| Artefacto | $75 | Muy Raro |

**Inventario:**
- El recurso se guarda en la mochila del jugador.
- Si el inventario está lleno, el recurso se rechaza (queda en la casilla hasta que haya espacio).

---

### 4.3 Casilla Enemigo (🔴 Rojo)

**Efecto:** Se inicia un **combate**.

**Ver sección 5 (Combate) para detalles.**

---

### 4.4 Casilla Tienda (🟨 Amarillo)

**Efecto:** Se abre la interfaz de tienda. El jugador puede:
- Vender recursos por dinero
- Comprar equipo/items con dinero

**Ver sección 6 (Tienda) para detalles.**

---

## 5. Sistema de Combate

### 5.1 Tipos de Combate

Hay **4 tipos** con un ciclo de ventajas (como Pokémon):

```
Fuego → Hierba → Agua → Fuego
         ↓
     Electricidad (especial, afecta a todos)
```

**Tabla de ventajas:**
| Ataque | Golpea neutral | Golpea débil | Golpea fuerte |
|---|---|---|---|
| Fuego | Electricidad | Agua | Hierba |
| Hierba | Electricidad | Fuego | Agua |
| Agua | Electricidad | Hierba | Fuego |
| Electricidad | Todos | Ninguno | Todos (+5% extra) |

**Cálculo de daño con ventaja/desventaja:**
- Ventaja (tipo del atacante > tipo del defensor): daño × 1.5
- Desventaja (tipo del atacante < tipo del defensor): daño × 0.7
- Neutral: daño × 1.0

---

### 5.2 Enemigos

Cada enemigo tiene **stats individuales** y un **tipo**:

**Ejemplo de enemigos:**
```
Slime (Agua)          → ATK: 5,  DEF: 2,  HP: 10,  Tipo: Agua
Goblin (Fuego)        → ATK: 8,  DEF: 4,  HP: 15,  Tipo: Fuego
Dragón (Fuego)        → ATK: 15, DEF: 8,  HP: 30,  Tipo: Fuego
Espíritu (Electricidad)→ ATK: 10, DEF: 6,  HP: 12,  Tipo: Electricidad
```

---

### 5.3 Combate vs Enemigo (Rápido — 1 tirada)

**Flujo:**

1. **Inicio:** Jugador ve enemigo, elige: **Atacar** o **Huir**

2. **Si Atacar:**
   - Jugador lanza **1 dado** (1-6)
   - **Daño = Dado + ATK del jugador (del arma/equipo)**
   - Se aplica **modificador de tipo** (×1.5, ×0.7, ×1.0)
   - Se resta **DEF del enemigo** del daño
   - Si daño resultado > 0, el enemigo recibe daño
   - Si HP enemigo ≤ 0, **enemigo es derrotado**
     - Jugador gana: **XP + recursos específicos del enemigo**
       - Slime → 10 XP + 1 Piedra
       - Goblin → 25 XP + 1 Cristal
       - Dragón → 50 XP + 1 Gema
       - Espíritu → 30 XP + 1 Mineral
     - La casilla queda vacía (enemigo no reaparece)
   - Si HP enemigo > 0, **combate termina** (enemigo permanece en casilla, se recupera a HP inicial para próximo intento)

3. **Si Huir:**
   - Jugador lanza **1 dado**
   - Compara con **Velocidad del enemigo**
   - Si dado ≥ Velocidad enemigo: **escapas sin daño**
   - Si dado < Velocidad enemigo: **recibes daño de escape** (enemigo ATK × 0.5)
   - Ya sea que escapes o no, el turno termina

---

### 5.4 Combate vs Otro Jugador (Múltiples rondas)

**Flujo:**

1. **Inicio:** Dos jugadores en la misma casilla, se inicia combate
2. **Cada ronda:**
   - Ambos jugadores lanzan **1 dado**
   - Suman su **ATK** (del equipo)
   - Aplican **modificador de tipo**
   - Restan **DEF** del oponente
   - Ambos reciben daño simultáneamente
3. **Fin:** Cuando uno de los dos llega a **HP ≤ 0**
   - El jugador con 0 HP es **eliminado**
   - El ganador se queda en la casilla

**Nota:** Un jugador puede optar por **Huir** (mismo sistema que vs enemigo) en cada ronda.

---

## 6. Sistema de Armas y Armaduras

### 6.1 Armas

**Función:** Aumentan **ATK del jugador**.

**Cómo funcionan:**
- Se **equipan** en un slot
- Mientras estén equipadas, suman su valor a tu ATK base
- Tienen un **tipo** (Fuego, Agua, Hierba, Electricidad)

**Ejemplo de armas:**
```
Espada de Fuego  → +8 ATK, Tipo: Fuego, Precio: $50
Lanza de Agua    → +6 ATK, Tipo: Agua, Precio: $40
Arco Eléctrico   → +7 ATK, Tipo: Electricidad, Precio: $60
```

**ATK base sin arma:** 3

---

### 6.2 Armaduras

**Función:** Aumentan **DEF del jugador**.

**Cómo funcionan:**
- Se **equipan** en un slot
- Mientras estén equipadas, suman su valor a tu DEF base
- No tienen tipo (protegen de todos los ataques)

**Ejemplo de armaduras:**
```
Coraza de Hierba  → +5 DEF, Precio: $35
Escudo de Piedra  → +7 DEF, Precio: $45
Capa Reflectante  → +4 DEF, Precio: $25 (refleja 10% daño al atacante)
```

**DEF base sin armadura:** 2

---

## 7. Sistema de Pociones

**Función:** Restaurar HP.

**Cómo funcionan:**
- Se guardan en inventario
- Se usan **manualmente** (el jugador elige cuándo)
- Se consumen después de usar

**Ejemplos:**
```
Poción Menor   → +20 HP, Precio: $15
Poción Normal  → +40 HP, Precio: $30
Poción Mayor   → +70 HP, Precio: $60
Elixir Máximo  → +100 HP (cura completamente), Precio: $120
```

---

## 8. Amplificadores Especiales

**Función:** Efectos temporales que dan ventaja.

**Ejemplos:**
```
Botas de Velocidad   → +2 al dado de número (próximo turno), Precio: $25, Duración: 1 turno
Escudo de Invulnerabilidad → Ignora todo daño (próximo ataque recibido), Precio: $80, Duración: 1 ataque
Aumento de Fuerza    → +5 ATK (próximo combate), Precio: $40, Duración: 1 combate
Invisibilidad        → Enemigos no detectan (próximo movimiento), Precio: $50, Duración: 1 movimiento
```

---

## 9. La Tienda

### 9.1 Ubicación

Casillas amarillas distribuidas en el tablero (12 tiendas).

### 9.2 Inventario de Tienda

La tienda vende:
1. **Expansión de mochila** → +5 slots, Precio: $50
2. **Armas** (Fuego, Agua, Hierba, Electricidad) → Ver §6.1
3. **Armaduras** → Ver §6.2
4. **Pociones** → Ver §7
5. **Amplificadores especiales** → Ver §8
6. **Recursos exclusivos** (solo en tienda, NO en tablero)
   - Cristal Primordial → $150 (mejora arma +10 ATK)
   - Gema Etérea → $150 (mejora armadura +8 DEF)

### 9.3 Operaciones

**Vender recursos:**
- Cada recurso tiene precio fijo (común $10, raro $30, muy raro $75)
- El jugador elige qué recursos vender

**Comprar items:**
- El jugador elige qué comprar con su dinero
- Si no tiene dinero suficiente, se rechaza la compra

---

## 10. Inventario y Mochila

### 10.1 Capacidad inicial

- **5 slots** para items (armas, armaduras, pociones, amplificadores)
- **Ilimitado** para recursos (se guardan aparte)

### 10.2 Expandir capacidad

**Opción A:** Comprar mochilas en tienda (+5 slots por $50)

**Opción B:** Encontrar "Bolsas mágicas" en el tablero (encontrada = +5 slots automático)

**Máximo:** 50 slots (después no se puede expandir más)

---

## 11. Condición de Victoria

### 11.1 Regla de Oro: **El más fuerte sobrevive**

**Último jugador en pie gana.**

- Cuando un jugador llega a HP ≤ 0, es **eliminado** del juego
- El juego continúa con los jugadores restantes
- **Cuando solo queda 1 jugador vivo, ese jugador gana la partida**

### 11.2 Cómo se pierde

Un jugador es **eliminado** cuando:
1. Llega a **HP ≤ 0** en un combate vs enemigo o jugador
2. Sale fuera de **zona segura** en late-game (sufre daño acumulativo)

### 11.3 Modo Fantasma (Después de morir)

Cuando un jugador muere, pasa a **modo fantasma**:
- ✅ **Spectate**: Ver el tablero en tiempo real (todo visible)
- ✅ **Chat**: Escribir mensajes a otros jugadores/fantasmas
- ✅ **Votar eventos**: Participar en votaciones de eventos aleatorios
- ❌ No tiene dinero
- ❌ No puede atacar ni defenderse
- ❌ No puede comprar items

**Beneficio:** Mantiene al jugador enganchado al juego hasta el final

---

## 12. Turnos y Tiempos

### 12.1 Orden de turno

**Determinado por:**
- Orden de entrada a la partida (el primero en unirse va primero)

### 12.2 Duración del turno

**Máximo:** 30 segundos para hacer un movimiento.
- Si el jugador no lanza dados en 30s, el turno se salta automáticamente
- El servidor lanza dados aleatorios por el jugador y ejecuta movimiento

---

## 13. Eventos Aleatorios y Votación

### 13.1 Cuándo ocurren eventos

**Cada 10 turnos**, aparece una **votación de evento**:

```
EVENTO PRÓXIMO (Turno 25):
  ☐ Lluvia de Meteoritos (todos -10 HP, pero +3 gemas aparecen)
  ☐ Maremoto (todos se teletransportan random)
  ☐ Eclipse (enemigos +5 ATK, tienda -50%)
  ☐ Nada (sin evento)
```

### 13.2 Quién vota

**Tanto vivos como fantasmas pueden votar:**
- **1 vivo = 1 voto**
- **1 fantasma = 1 voto**
- Votación es **democracia pura** (mayoría simple activa evento)

**Ejemplo:**
```
Turno 35: 2 vivos + 2 fantasmas
  Vivos: ambos votan "Maremoto"
  Fantasmas: ambos votan "Eclipse"
  Resultado: 2 vs 2 = EMPATE → se activa el evento más antiguo sin usar
```

### 13.3 Tipos de eventos

**Balance (no favorecen a nadie):**
- **Lluvia de Meteoritos**: Todos toman -10 HP, pero 3 Gemas aparecen en casillas random
- **Maremoto**: Todos se teletransportan a posición aleatoria
- **Oscuridad Total**: -50% visibilidad para todos (no ven a 3+ casillas de distancia)

**Presión Late-Game:**
- **Zona segura se reduce antes**: La zona se achica 2 turnos antes de lo planeado
- **Terremoto**: Todos toman -15 HP, enemigos se despiertan (más agresivos)

**Oportunidad económica:**
- **Lluvia de Oro**: Tienda vende items a -50% (oportunidad de comprar barato)

---

## 14. Modos de Juego

### 14.1 Partidas Privadas (2-4 jugadores)

**Características:**
- Crear sala con código de invitación (amigos)
- Sin ranking ni puntos globales
- Estadísticas solo locales (histórico personal)
- Ideal para: jugar con amigos, aprender reglas, diversión casual

### 14.2 Partidas Ranked (6-8 jugadores)

**Características:**
- Matchmaking automático con otros jugadores
- Ganador recibe **puntos de ranking** (ELO o similar)
- Estadísticas globales (leaderboard público)
- Ideal para: competencia, subir ranking, juego competitivo

---

## 15. Estadísticas y Leaderboard

Se registra:
- **Partidas ganadas** (solo ranked)
- **Partidas jugadas**
- **Win rate** (% victorias)
- **Promedio de daño hecho**
- **Promedio de daño recibido**
- **Recursos encontrados (total)**
- **Dinero acumulado (en tienda, máximo)**
- **Enemigos derrotados**
- **Ranking ELO** (solo ranked)

---

## 16. Changelog

| Versión | Cambio | Fecha |
|---|---|---|
| v1.0 | Especificación inicial aprobada | 2026-08-11 |
| v1.1 | Posiciones aleatorias, tablero toroidal, XP como recompensa, 30s por turno | 2026-08-11 |
| v2.0 | Sistema fantasma (spectate + chat + votos), eventos aleatorios, partidas privadas (2-4) y ranked (6-8) | 2026-08-11 |

---

## 17. NOTAS IMPORTANTES (para el equipo de desarrollo)

1. **Server es autoridad:** El servidor SIEMPRE valida dados, movimientos, combates (anti-cheat).
2. **Estado sincronizado:** WebSocket (Socket.io) mantiene estado en tiempo real para todos los jugadores.
3. **No hay "undo":** Una vez realizado un movimiento, no hay marcha atrás.
4. **Recursos en casilla rechazada:** Si inventario está lleno, el recurso queda en la casilla (otro jugador puede recogerlo).
5. **Enemigos no se regeneran:** Una vez derrotado, la casilla queda vacía.
6. **Tienda random:** Tiendas aparecen/desaparecen en ciclos (5 turnos on, 5 turnos off, alternando).
7. **Fantasmas no pueden influir económicamente:** Solo espectate, chat, votos. Sin dinero.
8. **Votaciones son democráticas:** 1 voto = 1 poder, vivos y fantasmas tienen igual peso.
9. **Partidas privadas vs ranked:** Backend debe soportar ambas modalidades con diferentes lógicas de matchmaking.

---

**Estado:** ✅✅✅ ESPECIFICACIÓN COMPLETA APROBADA

**Siguiente paso:** Fase 1 - Setup inicial (Next.js 16 + Prisma + Socket.io)
