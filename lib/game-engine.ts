/**
 * Game Engine — Lógica central de Supervivencia en Isla
 *
 * Responsabilidades:
 * - Generación del tablero 12×12 (toroidal, aleatorio)
 * - Validación de movimientos (dados + dirección)
 * - Sistema de combate (tipos + stats)
 * - Lógica de recursos y efectos
 */

// ─────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────

export enum CellType {
  EMPTY = "empty",
  RESOURCE_COMMON = "resource_common",
  RESOURCE_RARE = "resource_rare",
  RESOURCE_VERY_RARE = "resource_very_rare",
  ENEMY = "enemy",
  SHOP = "shop",
}

export enum ResourceType {
  WOOD = "wood",
  STONE = "stone",
  LEAF = "leaf",
  CRYSTAL = "crystal",
  MINERAL = "mineral",
  GEM = "gem",
  ARTIFACT = "artifact",
}

export enum EnemyType {
  SLIME = "slime",
  GOBLIN = "goblin",
  DRAGON = "dragon",
  SPIRIT = "spirit",
}

export enum CombatType {
  FIRE = "fire",
  WATER = "water",
  GRASS = "grass",
  ELECTRIC = "electric",
}

export enum PlayerRole {
  WARRIOR = "warrior",
  MAGE = "mage",
  SCOUT = "scout",
  PALADIN = "paladin",
}

export interface Position {
  x: number
  y: number
}

export interface Cell {
  type: CellType
  content?: {
    enemyType?: EnemyType
    resourceType?: ResourceType
  }
}

export interface Board {
  cells: Cell[][]
  seed: string
  createdAt: Date
}

export interface GameBoard {
  width: number
  height: number
  cells: Cell[][]
}

export interface Enemy {
  type: EnemyType
  combatType: CombatType
  hp: number
  atk: number
  def: number
  vel: number
}

export interface DiceRoll {
  number: number // 1-6
  direction: "up" | "down" | "left" | "right"
}

export interface MovementResult {
  oldPos: Position
  newPos: Position
  cellType: CellType
  valid: boolean
  error?: string
}

export interface CombatResult {
  playerDamage: number
  enemyDamage: number
  playerHPAfter: number
  enemyHPAfter: number
  playerWon: boolean
  typeModifier: number // 1.5, 1.0, 0.7
}

// ─────────────────────────────────────────────────────────
// GAME ENGINE CLASS
// ─────────────────────────────────────────────────────────

export class GameEngine {
  private board: GameBoard
  private enemyMap: Map<string, Enemy> = new Map()
  private resourcePrices: Map<ResourceType, number> = new Map([
    [ResourceType.WOOD, 10],
    [ResourceType.STONE, 10],
    [ResourceType.LEAF, 10],
    [ResourceType.CRYSTAL, 30],
    [ResourceType.MINERAL, 30],
    [ResourceType.GEM, 75],
    [ResourceType.ARTIFACT, 75],
  ])

  constructor(seed: string = Math.random().toString(36).substring(7)) {
    this.board = this.generateBoard(seed)
    this.initializeEnemies()
  }

  // ─────────────────────────────────────────────────────────
  // BOARD GENERATION
  // ─────────────────────────────────────────────────────────

  private generateBoard(seed: string): GameBoard {
    const WIDTH = 12
    const HEIGHT = 12
    const cells: Cell[][] = Array(HEIGHT)
      .fill(null)
      .map(() => Array(WIDTH).fill(null))

    // Simple seeded random (determinístico)
    const rng = this.seededRandom(seed)

    // Llenar tablero según distribución: 43 vacías, 36 recurso común, 22 raro, 14 muy raro, 18 enemigo, 12 tienda
    const distribution = [
      { type: CellType.EMPTY, count: 43 },
      { type: CellType.RESOURCE_COMMON, count: 36 },
      { type: CellType.RESOURCE_RARE, count: 22 },
      { type: CellType.RESOURCE_VERY_RARE, count: 14 },
      { type: CellType.ENEMY, count: 18 },
      { type: CellType.SHOP, count: 12 },
    ]

    const positions: Array<{ x: number; y: number; type: CellType; content?: any }> = []

    // Generar todas las posiciones
    for (const { type, count } of distribution) {
      for (let i = 0; i < count; i++) {
        const content = this.generateCellContent(type, rng)
        positions.push({ x: 0, y: 0, type, content })
      }
    }

    // Shufflear posiciones
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    // Colocar en el tablero
    let idx = 0
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const pos = positions[idx++]
        cells[y][x] = {
          type: pos.type,
          content: pos.content,
        }
      }
    }

    return { width: WIDTH, height: HEIGHT, cells }
  }

  private generateCellContent(
    cellType: CellType,
    rng: () => number
  ): any {
    switch (cellType) {
      case CellType.RESOURCE_COMMON:
        return { resourceType: this.pickRandomResource(["wood", "stone", "leaf"], rng) }
      case CellType.RESOURCE_RARE:
        return { resourceType: this.pickRandomResource(["crystal", "mineral"], rng) }
      case CellType.RESOURCE_VERY_RARE:
        return { resourceType: this.pickRandomResource(["gem", "artifact"], rng) }
      case CellType.ENEMY:
        return { enemyType: this.pickRandomEnemy(rng) }
      default:
        return undefined
    }
  }

  private pickRandomResource(
    options: string[],
    rng: () => number
  ): ResourceType {
    return options[Math.floor(rng() * options.length)] as ResourceType
  }

  private pickRandomEnemy(rng: () => number): EnemyType {
    const enemies = [EnemyType.SLIME, EnemyType.GOBLIN, EnemyType.DRAGON, EnemyType.SPIRIT]
    return enemies[Math.floor(rng() * enemies.length)]
  }

  private seededRandom(seed: string): () => number {
    let counter = parseInt(seed, 16) || 1
    return function () {
      const x = Math.sin(counter++) * 10000
      return x - Math.floor(x)
    }
  }

  // ─────────────────────────────────────────────────────────
  // MOVEMENT & VALIDATION
  // ─────────────────────────────────────────────────────────

  validateMovement(currentPos: Position, dice: DiceRoll): MovementResult {
    const { x, y } = currentPos
    const { number, direction } = dice

    let newX = x
    let newY = y

    // Aplicar movimiento
    switch (direction) {
      case "up":
        newY = (y - number + this.board.height * 100) % this.board.height
        break
      case "down":
        newY = (y + number) % this.board.height
        break
      case "left":
        newX = (x - number + this.board.width * 100) % this.board.width
        break
      case "right":
        newX = (x + number) % this.board.width
        break
    }

    const newPos = { x: newX, y: newY }
    const cell = this.board.cells[newY][newX]

    return {
      oldPos: currentPos,
      newPos,
      cellType: cell.type,
      valid: true,
    }
  }

  // ─────────────────────────────────────────────────────────
  // COMBAT SYSTEM
  // ─────────────────────────────────────────────────────────

  resolveCombat(
    playerAtk: number,
    playerDef: number,
    playerType: CombatType,
    playerHP: number,
    enemyType: EnemyType,
    playerDice: number
  ): CombatResult {
    const enemy = this.getEnemy(enemyType)

    // Tirada del jugador
    const playerDamageRaw = playerDice + playerAtk
    const typeModifier = this.getTypeModifier(playerType, enemy.combatType)
    const playerDamage = Math.max(0, Math.floor(playerDamageRaw * typeModifier - enemy.def))

    // Tirada del enemigo (asumimos que el enemigo también tira un d6)
    const enemyDice = Math.floor(Math.random() * 6) + 1
    const enemyDamageRaw = enemyDice + enemy.atk
    const enemyDamage = Math.max(0, enemyDamageRaw - playerDef)

    return {
      playerDamage,
      enemyDamage,
      playerHPAfter: playerHP - enemyDamage,
      enemyHPAfter: enemy.hp - playerDamage,
      playerWon: enemy.hp - playerDamage <= 0,
      typeModifier,
    }
  }

  private getEnemy(type: EnemyType): Enemy {
    const enemies: Record<EnemyType, Enemy> = {
      [EnemyType.SLIME]: {
        type: EnemyType.SLIME,
        combatType: CombatType.WATER,
        hp: 10,
        atk: 5,
        def: 2,
        vel: 3,
      },
      [EnemyType.GOBLIN]: {
        type: EnemyType.GOBLIN,
        combatType: CombatType.FIRE,
        hp: 15,
        atk: 8,
        def: 4,
        vel: 5,
      },
      [EnemyType.DRAGON]: {
        type: EnemyType.DRAGON,
        combatType: CombatType.FIRE,
        hp: 30,
        atk: 15,
        def: 8,
        vel: 4,
      },
      [EnemyType.SPIRIT]: {
        type: EnemyType.SPIRIT,
        combatType: CombatType.ELECTRIC,
        hp: 12,
        atk: 10,
        def: 6,
        vel: 8,
      },
    }
    return enemies[type]
  }

  private getTypeModifier(attackType: CombatType, defenseType: CombatType): number {
    // Ciclo: Fire > Grass > Water > Fire
    // Electric afecta a todos con +5%

    if (attackType === CombatType.ELECTRIC) return 1.05
    if (defenseType === CombatType.ELECTRIC) return 0.95

    const advantages: Record<CombatType, CombatType> = {
      [CombatType.FIRE]: CombatType.GRASS,
      [CombatType.GRASS]: CombatType.WATER,
      [CombatType.WATER]: CombatType.FIRE,
      [CombatType.ELECTRIC]: CombatType.ELECTRIC,
    }

    if (advantages[attackType] === defenseType) return 1.5 // Ventaja
    if (advantages[defenseType] === attackType) return 0.7 // Desventaja
    return 1.0 // Neutral
  }

  // ─────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────

  private initializeEnemies(): void {
    // Pre-calcular stats de enemigos para rápido acceso
    const enemyTypes = [EnemyType.SLIME, EnemyType.GOBLIN, EnemyType.DRAGON, EnemyType.SPIRIT]
    enemyTypes.forEach((type) => {
      const enemy = this.getEnemy(type)
      this.enemyMap.set(type, enemy)
    })
  }

  getResourcePrice(resource: ResourceType): number {
    return this.resourcePrices.get(resource) || 0
  }

  getBoard(): GameBoard {
    return this.board
  }

  getCell(pos: Position): Cell {
    return this.board.cells[pos.y][pos.x]
  }
}

// ─────────────────────────────────────────────────────────
// FACTORY FUNCTIONS
// ─────────────────────────────────────────────────────────

export function createGameEngine(seed?: string): GameEngine {
  return new GameEngine(seed)
}
