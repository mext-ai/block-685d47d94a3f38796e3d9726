export interface BlockProps {}

export interface Enemy {
  id: number;
  type: 'mushroom' | 'treant' | 'devil';
  x: number;
  y: number;
  direction: number;
  currentFrame: number;
  isAlive: boolean;
  hp: number;
  maxHp: number;
  isDying: boolean;
  deathFrame: number;
  isAttacking: boolean;
  attackFrame: number;
  lastAttackTime: number;
  spawnTime: number;
  hasSpawned: boolean;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  speed: number;
  damage: number;
  spawnTime: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Keys {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
}

export interface WindowSize {
  width: number;
  height: number;
}

export type GameState = 'menu' | 'levelSelect' | 'playing' | 'gameover' | 'victory';

export interface EnemyDamageCooldowns {
  [key: number]: number;
} 