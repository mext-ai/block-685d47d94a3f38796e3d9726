import { Enemy, Position, EnemyDamageCooldowns } from '../types';
import { ENEMY_CONFIG, GAME_LIMITS } from '../constants';

export class EnemyManager {
  // Fonction pour créer les ennemis du niveau 1
  static createLevel1Enemies(): Enemy[] {
    const enemies: Enemy[] = [];
    
    const enemySpawnTimes = [
      0, 3000, 5000, 8000, 12000, 15000, 18000, 22000, 25000, 30000
    ];

    for (let i = 0; i < 10; i++) {
      const fromLeft = i % 2 === 0;
      const startX = fromLeft ? 
        5 + Math.random() * 10 : 
        85 + Math.random() * 10;
      
      const startY = 40 + Math.random() * 45;
      const initialDirection = fromLeft ? 3 : 2;
      const isTreant = i === 4 || i === 9;
      const enemyType = isTreant ? 'treant' : 'mushroom';
      const enemyHp = isTreant ? 5 : 3;
      
      const enemy: Enemy = {
        id: i + 1,
        type: enemyType,
        x: startX,
        y: startY,
        direction: initialDirection,
        currentFrame: 0,
        isAlive: true,
        hp: enemyHp,
        maxHp: enemyHp,
        isDying: false,
        deathFrame: 0,
        isAttacking: false,
        attackFrame: 0,
        lastAttackTime: 0,
        spawnTime: enemySpawnTimes[i],
        hasSpawned: enemySpawnTimes[i] === 0
      };
      
      enemies.push(enemy);
    }
    
    return enemies;
  }

  // Fonction pour créer les ennemis du niveau 2
  static createLevel2Enemies(): Enemy[] {
    const enemies: Enemy[] = [];
    
    const enemy: Enemy = {
      id: 1,
      type: 'mushroom',
      x: 75,
      y: 60,
      direction: 2,
      currentFrame: 0,
      isAlive: true,
      hp: 3,
      maxHp: 3,
      isDying: false,
      deathFrame: 0,
      isAttacking: false,
      attackFrame: 0,
      lastAttackTime: 0,
      spawnTime: 0,
      hasSpawned: true
    };
    
    enemies.push(enemy);
    return enemies;
  }

  // Fonction de collision entre deux entités
  static checkCollision(pos1: Position, pos2: Position, minDistance: number = 3): boolean {
    const deltaX = pos1.x - pos2.x;
    const deltaY = pos1.y - pos2.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance < minDistance;
  }

  // Fonction pour vérifier si l'ennemi est dans l'arc d'attaque de 180°
  static isEnemyInAttackDirection(
    playerX: number, 
    playerY: number, 
    enemyX: number, 
    enemyY: number, 
    playerDirection: number
  ): boolean {
    const deltaX = enemyX - playerX;
    const deltaY = enemyY - playerY;
    
    const angleToEnemy = Math.atan2(deltaY, deltaX);
    
    let baseAngle;
    switch (playerDirection) {
      case 0: baseAngle = Math.PI / 2; break;
      case 1: baseAngle = -Math.PI / 2; break;
      case 2: baseAngle = Math.PI; break;
      case 3: baseAngle = 0; break;
      default: return false;
    }
    
    let angleDiff = angleToEnemy - baseAngle;
    
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    const halfArcAngle = Math.PI / 2;
    return Math.abs(angleDiff) <= halfArcAngle;
  }

  // Fonction pour vérifier les dégâts de l'ennemi au joueur
  static checkEnemyAttackHit(
    enemy: Enemy, 
    playerPosition: Position, 
    isPlayerDisappeared: boolean,
    enemyDamageCooldowns: EnemyDamageCooldowns,
    setEnemyDamageCooldowns: (updater: EnemyDamageCooldowns | ((prev: EnemyDamageCooldowns) => EnemyDamageCooldowns)) => void,
    setPlayerHp: (updater: (hp: number) => number) => void,
    triggerPlayerDeath: () => void,
    playHurtSound: () => void,
    isSoundEnabled: boolean
  ): void {
    if (isPlayerDisappeared) return;
    
    const currentTime = Date.now();
    const lastDamageFromThisEnemy = enemyDamageCooldowns[enemy.id] || 0;
    
    if (currentTime - lastDamageFromThisEnemy < 1000) return;
    
    const deltaX = playerPosition.x - enemy.x;
    const deltaY = playerPosition.y - enemy.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const attackRange = enemy.type === 'treant' ? 12 : 6;
    if (distance <= attackRange) {
      const damage = enemy.type === 'treant' ? 2 : 1;
      
      if (isSoundEnabled) {
        playHurtSound();
      }
      
      setPlayerHp(currentHp => {
        const newHp = Math.max(0, currentHp - damage);
        
        if (newHp <= 0) {
          triggerPlayerDeath();
        }
        
        return newHp;
      });
      
      setEnemyDamageCooldowns((prev: EnemyDamageCooldowns) => ({
        ...prev,
        [enemy.id]: currentTime
      }));
    }
  }

  // Fonction pour vérifier si l'attaque du joueur touche un ennemi
  static checkPlayerAttackHit(
    enemies: Enemy[],
    setEnemies: (updater: (enemies: Enemy[]) => Enemy[]) => void,
    playerPosition: Position,
    playerDirection: number
  ): void {
    const attackRange = 8;
    
    setEnemies((prev: Enemy[]) => prev.map(enemy => {
      if (!enemy.isAlive || enemy.isDying || !enemy.hasSpawned) return enemy;
      
      const deltaX = playerPosition.x - enemy.x;
      const deltaY = playerPosition.y - enemy.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance <= attackRange && this.isEnemyInAttackDirection(
        playerPosition.x, playerPosition.y, enemy.x, enemy.y, playerDirection
      )) {
        const newHp = enemy.hp - 1;
        
        if (newHp <= 0) {
          return {
            ...enemy,
            hp: 0,
            isDying: true,
            deathFrame: 0
          };
        }
        
        return {
          ...enemy,
          hp: newHp
        };
      }
      
      return enemy;
    }));
  }
} 