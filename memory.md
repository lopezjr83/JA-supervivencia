# Memory — Contexto del Proyecto

**Proyecto:** Supervivencia en Isla — Juego multiplayer en tiempo real  
**Para:** Juan Andres  
**Stack:** Next.js 16 + Prisma 7 + Socket.io + Neon (Vercel)  
**Estado:** Fase 1 iniciando  

---

## Decisiones Clave (No cambiar sin discusión)

1. **Objetivo del juego:** Último en pie gana (el más fuerte sobrevive)
2. **Jugadores:** 2-4 (privadas) o 6-8 (ranked)
3. **Tablero:** 12×12, toroidal, generación aleatoria cada partida
4. **Movimiento:** Dados (número 1-6 + dirección: arriba/abajo/izq/der)
5. **Combate:** Tipo Pokémon/Magic (stats + tipos + dados)
6. **Tipos:** Fuego > Hierba > Agua > Fuego (+ Electricidad especial)
7. **Economía:** Recursos ($10/$30/$75) → dinero → tienda
8. **Roles:** Random (Guerrero/Mago/Scout/Paladín)
9. **XP:** Suma stats (más fuerte con progreso)
10. **Muerte:** Fantasma (spectate + chat + votar eventos)
11. **Eventos:** Cada 10 turnos, votación democrática (vivos + fantasmas = 1 voto c/u)
12. **Duración turno:** 30 segundos máximo
13. **Zona segura:** Se achica en late-game (tipo Battle Royale)

---

## Stack Confirmado

- **Frontend:** Next.js 16 (web) + React Native Web (mobile, Fase 4)
- **Backend:** Next.js API routes + Socket.io (WebSockets)
- **Database:** Prisma 7 + Neon PostgreSQL (Vercel)
- **Auth:** Auth.js v5 + Google OAuth
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Color principal:** Verde (hue OKLCH 145)
- **Hosting:** Vercel (web + API)

---

## Archivos Críticos

- `REGLAS_DEL_JUEGO.md` — Especificación completa v2.0 (APROBADA)
- `memory.md` — Este archivo (contexto)
- `status.md` — Estado del desarrollo en tiempo real
- `features.md` — Features implementadas vs pendientes
- `CLAUDE.md` — Instrucciones del proyecto (crear en Fase 1)

---

## Personas & Roles

- **Lopez Jr** (usuario): Product owner, decisiones finales
- **Juan Andres** (hijo): Cliente final, feedback gameplay
- **Claude Code**: Development

---

## Próximas Acciones

**Fase 1 (ahora):**
1. Crear estructura Next.js 16 + TypeScript
2. Configurar Prisma + schema
3. Setup Socket.io
4. Auth.js v5 básico
5. Crear CLAUDE.md + .env.example

**Validación:** Proyecto corre en `localhost:3000`, Neon conecta, WebSocket funciona

---

**Última actualización:** 2026-08-11  
**Sesión:** Planificación + Especificación completada
