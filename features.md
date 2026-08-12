# Features — Inventario de Features

**Última actualización:** 2026-08-11  
**Estado:** MVP features definidas, implementación por iniciar  

---

## 🎮 CORE GAMEPLAY

### Movimiento & Tablero

- [ ] Tablero 12×12 generado aleatoriamente
- [ ] Toroidal (wraparound en bordes)
- [ ] Zona segura que se achica en late-game
- [ ] Movimiento por dados (número + dirección)
- [ ] Validación servidor-side

### Combate

- [ ] Sistema de tipos (Fuego, Agua, Hierba, Electricidad)
- [ ] Stats por jugador (ATK, DEF, HP, VEL)
- [ ] Combate vs enemigos (1 tirada)
- [ ] Combate vs jugadores (múltiples rondas)
- [ ] Sistema de huida
- [ ] Daño con modificadores de tipo

### Recursos & Economía

- [ ] Casillas de recursos (común $10, raro $30, muy raro $75)
- [ ] Inventario con capacidad expandible
- [ ] Mochila (comprar expansiones en tienda)
- [ ] Venta de recursos en tienda

### Tienda

- [ ] Armas (8 tipos, aumentan ATK)
- [ ] Armaduras (varios niveles, aumentan DEF)
- [ ] Pociones (curación variable)
- [ ] Amplificadores especiales (velocidad, invulnerabilidad, etc.)
- [ ] Recursos exclusivos (Cristal Primordial, Gema Etérea)
- [ ] Tiendas random (aparecen/desaparecen en ciclos)

### Enemigos

- [ ] Generación aleatoria de enemigos en casillas
- [ ] Stats variables (Slime, Goblin, Dragón, Espíritu, etc.)
- [ ] Recompensa XP + recursos por derrota
- [ ] No reaparecen después de derrota

### Roles & Evolución

- [ ] 4 roles (Guerrero, Mago, Scout, Paladín)
- [ ] Asignación random al inicio de partida
- [ ] XP que aumenta stats (Guerrero +ATK preferentemente, etc.)
- [ ] Leaderboard con mejor desempeño

### Alianzas

- [ ] Propuesta de alianza entre jugadores
- [ ] Combate cooperativo vs enemigos (2v1)
- [ ] Division de XP entre aliados
- [ ] Opción de traicionar después

---

## 💀 SISTEMA DE MUERTE & FANTASMAS

- [ ] Muerte = eliminación del tablero
- [ ] Modo fantasma activado
- [ ] Spectate en tiempo real
- [ ] Chat para fantasmas
- [ ] Votación de eventos

---

## 🎲 EVENTOS ALEATORIOS

- [ ] Votación cada 10 turnos
- [ ] Lluvia de Meteoritos (todos -10 HP, +gemas)
- [ ] Maremoto (teletransporte random)
- [ ] Eclipse (enemigos +5 ATK, tienda -50%)
- [ ] Zona segura se reduce antes
- [ ] Terremoto (todos -15 HP)
- [ ] Lluvia de Oro (tienda -50%)
- [ ] Votación democrática (1 voto = vivo o fantasma)

---

## 👥 MODOS DE JUEGO

### Privado (2-4 jugadores)

- [ ] Crear sala con código
- [ ] Invitar amigos
- [ ] Sin ranking
- [ ] Estadísticas locales

### Ranked (6-8 jugadores)

- [ ] Matchmaking automático
- [ ] Sistema de ranking (ELO)
- [ ] Leaderboard público
- [ ] Puntos por victoria

---

## 🔐 AUTENTICACIÓN

- [ ] Login con Google OAuth
- [ ] Login con email/contraseña
- [ ] Magic link (opcional)
- [ ] Profiles de usuarios
- [ ] Estadísticas personales

---

## 📊 ESTADÍSTICAS & LEADERBOARD

- [ ] Partidas ganadas
- [ ] Partidas jugadas
- [ ] Win rate
- [ ] Daño promedio hecho
- [ ] Daño promedio recibido
- [ ] Recursos encontrados (total)
- [ ] Dinero máximo en tienda
- [ ] Enemigos derrotados
- [ ] Ranking ELO (ranked)

---

## 🎨 UI/UX

### Web

- [ ] Tablero 12×12 visual
- [ ] Panel de inventario
- [ ] Panel de stats (HP, dinero, XP)
- [ ] Interfaz de tienda (modal)
- [ ] UI de dados (lanzar dados)
- [ ] Chat de fantasmas
- [ ] Votación de eventos (modal)
- [ ] Leaderboard global
- [ ] Perfil de usuario

### Mobile (Fase 4)

- [ ] React Native Web o Expo
- [ ] Touch optimizado (botones grandes)
- [ ] Layout vertical
- [ ] Mismo backend

---

## ⚙️ TÉCNICO

### Backend

- [ ] API REST (CRUD juegos, usuarios)
- [ ] WebSocket (Socket.io) para sincronización
- [ ] Game engine (lógica de tablero)
- [ ] Validación servidor-side (anti-cheat)
- [ ] Prisma queries optimizadas

### Database (Neon)

- [ ] Table: User
- [ ] Table: Game
- [ ] Table: GameState
- [ ] Table: GameEvent (log)
- [ ] Table: Leaderboard
- [ ] Índices de performance

### DevOps

- [ ] Deploy a Vercel
- [ ] Env vars configurados
- [ ] CI/CD básico (git push = deploy)
- [ ] Logs y monitoreo

---

## 🎬 ANIMACIONES & FEEDBACK

- [ ] Movimiento suave del jugador
- [ ] Números flotantes de daño
- [ ] Efectos de recursos encontrados
- [ ] Cambios de HP animados
- [ ] Transiciones de estado

---

## 📈 Prioridad de Features

### MVP (Fase 1-3)

**Must have:**
- ✅ Tablero + movimiento
- ✅ Combate básico
- ✅ Enemigos + recursos
- ✅ Tienda
- ✅ Muerte + fantasmas
- ✅ Chat
- ✅ Evento aleatorio (mínimo 3)
- ✅ Partidas privadas 2-4
- ✅ Auth básica

### Post-MVP (Fase 4-5)

**Nice to have:**
- 🔲 Partidas ranked 6-8
- 🔲 Sistema de ranking ELO
- 🔲 Leaderboard competitivo
- 🔲 Mobile (React Native)
- 🔲 Eventos más complejos
- 🔲 Sonido & efectos visuales
- 🔲 Replay de partidas

---

**Total features MVP:** ~45  
**Implementadas:** 0  
**Completadas:** 0%  

---

**Última sesión:** Especificación  
**Próxima sesión:** Fase 1 (inicio backend)
