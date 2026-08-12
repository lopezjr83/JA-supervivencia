# Supervivencia en Isla — Instrucciones para Claude Code

## Qué es

Juego multiplayer en tiempo real para 2-4 jugadores (privado) o 6-8 (ranked). Compiten en un tablero toroidal 12×12 para ser el último en pie. Sistema de combate tipo Pokémon/Magic con tipos, stats, y XP que evoluciona.

## Stack

Next.js 16 · TypeScript · Tailwind v4 · Prisma 7 · Neon (PostgreSQL) · Auth.js v5 · Socket.io · Vercel

## Estructura crítica

**Leer antes de tocar:**
- `REGLAS_DEL_JUEGO.md` — Especificación completa v2.0 (AUTORIDAD)
- `prisma/schema.prisma` — Modelo de datos (VERDAD DE BASE)
- `memory.md` — Decisiones clave del proyecto
- `status.md` — Estado actual
- `features.md` — Qué está hecho, qué falta

**Carpetas importantes:**
```
app/
  ├── auth/                    → rutas de autenticación
  ├── api/                     → API REST + Socket.io
  └── (game)/                  → rutas del juego

lib/
  ├── game-engine.ts          → LÓGICA DEL JUEGO (aquí va casi todo)
  ├── auth.ts                 → Auth.js config
  ├── socket.ts               → Socket.io setup
  └── motion.ts               → Tokens de animación

prisma/
  ├── schema.prisma           → MODELO DE DATOS (AUTORIDAD)
  └── migrations/             → Historial de cambios BD

components/
  └── (por crear en Fase 3)
```

## Reglas de oro (NO ROMPER)

1. **Server es autoridad**: Valida TODOS los dados, movimientos, combates (anti-cheat)
2. **Sin datos reales en BD**: Solo usuarios de prueba, nunca datos sensibles
3. **Tablero se genera UNA VEZ**: Al iniciar partida, es aleatorio pero fijo durante juego
4. **Fantasmas no tienen dinero**: No pueden influir económicamente, solo spectate + chat + votos
5. **Votaciones son democráticas**: 1 vivo = 1 voto, 1 fantasma = 1 voto (igual peso)
6. **Socket.io es fuente de verdad para estado en tiempo real**: No hay cache local que no se sincronice
7. **No hacer commit sin que Jose lo pida explícitamente** (§11 Playbook VP)

## Comandos

```bash
npm run dev              # Desarrollar en localhost:3000
npm run db:migrate      # Crear/actualizar migrations en Neon
npm run db:push         # Pushear schema a Neon (dev rápido)
npm run build           # Build para producción
npm run start           # Correr build en producción
npm run lint            # ESLint
```

## Setup inicial (Fase 1)

- [ ] `npm install` (dependencias)
- [ ] Crear `.env` con vars de Neon + Auth
- [ ] `npm run db:push` (crear schema en Neon)
- [ ] `npm run dev` (test en localhost:3000)
- [ ] Verificar que Socket.io funciona en consola del navegador

## No hacer

- No hardcodear reglas de juego en componentes (todo en `lib/game-engine.ts`)
- No cambiar schema sin discutir (cada cambio = migration en Neon)
- No usar hex sueltos en CSS (solo Tailwind + tokens)
- No hacer PR sin testing local primero
- No commitear sin José

## Proxies de verdad

- **¿Cómo funciona el combate?** → `REGLAS_DEL_JUEGO.md` §5
- **¿Qué campos tiene User?** → `prisma/schema.prisma` model User
- **¿Cuál es el estado actual?** → `status.md`
- **¿Qué features faltan?** → `features.md`
- **¿Por qué decidimos X?** → `memory.md`

## Siguiente paso

Fase 1: Setup inicial (Next.js + Prisma + Auth + Socket.io)
- Objetivo: `npm run dev` corre sin errores
- Neon está conectado y schema está creado
- Auth.js v5 configurado (sin Google OAuth por ahora)
- Socket.io básico en `/api/socket`

---

**Proyecto:** Supervivencia en Isla  
**Para:** Juan Andres  
**Owner:** Lopez Jr  
**Última actualización:** 2026-08-11
