import { Position } from '../types';

export interface Enemy {
  id: string;
  type: 'mushroom' | 'treant' | 'devil';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  direction: number;
  frame: number;
  animationSpeed: number;
  lastFrameTime: number;
  isAlive: boolean;
  isDying: boolean;
  deathFrame: number;
  isAttacking: boolean;
  attackFrame: number;
  lastAttackTime: number;
  attackCooldown: number;
  hasSpawned: boolean;
  spawnFrame: number;
  spawnAnimationSpeed: number;
  lastSpawnFrameTime: number;
  moveSpeed: number;
  attackDamageDealt: boolean; // Nouveau flag pour s'assurer que les dégâts ne sont infligés qu'une seule fois
}

// Configuration des attaques par type d'ennemi
const ENEMY_ATTACK_CONFIG = {
  mushroom: {
    totalFrames: 4,
    damageFrame: 3, // Avant-dernière frame (frame 3 sur 4 frames totales 0,1,2,3)
    animationSpeed: 250
  },
  treant: {
    totalFrames: 7,
    damageFrame: 6, // Avant-dernière frame (frame 6 sur 7 frames totales 0,1,2,3,4,5,6)
    animationSpeed: 180
  },
  devil: {
    totalFrames: 6,
    damageFrame: 5, // Avant-dernière frame (frame 5 sur 6 frames totales 0,1,2,3,4,5)
    animationSpeed: 200
  }
};

// Fonction pour vérifier si l'attaque d'un ennemi touche le joueur avec hitbox directionnelle pour les tréants
export const checkEnemyAttackHit = (enemy: Enemy, playerPosition: Position): boolean => {
  if (!enemy.isAttacking || !enemy.isAlive || enemy.isDying) return false;
  
  const config = ENEMY_ATTACK_CONFIG[enemy.type];
  
  // Vérifier si on est sur la frame de dégâts ET que les dégâts n'ont pas encore été infligés
  if (enemy.attackFrame !== config.damageFrame || enemy.attackDamageDealt) return false;
  
  const deltaX = playerPosition.x - enemy.x;
  const deltaY = playerPosition.y - enemy.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Configuration spéciale pour les tréants (hitbox directionnelle)
  if (enemy.type === 'treant') {
    const maxAttackRange = 12;
    const attackWidth = 4;
    const minAlignment = 0.5; // Cône d'environ 60°
    
    if (distance > maxAttackRange) return false;
    
    // Calculer la direction du tréant
    let treantDirectionVector = { x: 0, y: 0 };
    switch (enemy.direction) {
      case 0: treantDirectionVector = { x: 0, y: 1 }; break; // Bas
      case 1: treantDirectionVector = { x: 0, y: -1 }; break; // Haut
      case 2: treantDirectionVector = { x: -1, y: 0 }; break; // Gauche
      case 3: treantDirectionVector = { x: 1, y: 0 }; break; // Droite
    }
    
    // Vecteur vers le joueur (normalisé)
    const toPlayerVector = { x: deltaX / distance, y: deltaY / distance };
    
    // Produit scalaire pour vérifier l'alignement
    const alignment = treantDirectionVector.x * toPlayerVector.x + treantDirectionVector.y * toPlayerVector.y;
    
    if (alignment < minAlignment) return false;
    
    // Vérifier la largeur de l'attaque (distance perpendiculaire)
    const perpDistance = Math.abs(
      treantDirectionVector.y * deltaX - treantDirectionVector.x * deltaY
    );
    
    return perpDistance <= attackWidth;
  }
  
  // Pour les autres ennemis (champignons et diables), utiliser la portée standard
  const maxAttackRange = enemy.type === 'mushroom' ? 8 : (enemy.type === 'devil' ? 10 : 12);
  return distance <= maxAttackRange;
};

// Fonction pour gérer le mouvement et le comportement des ennemis
export const moveEnemyTowardsPlayer = (enemy: Enemy, playerPosition: Position, currentTime: number): Enemy => {
  // Ne pas bouger si l'ennemi n'est pas vivant, en train de mourir, en train d'attaquer, ou n'a pas encore spawn
  if (!enemy.isAlive || enemy.isDying || enemy.isAttacking || !enemy.hasSpawned) return enemy;

  const deltaX = playerPosition.x - enemy.x;
  const deltaY = playerPosition.y - enemy.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Distance d'attaque basée sur le type d'ennemi
  const attackRange = enemy.type === 'mushroom' ? 8 : (enemy.type === 'treant' ? 12 : 10);
  
  // Si le joueur est à portée d'attaque et que le cooldown est écoulé
  if (distance <= attackRange && (currentTime - enemy.lastAttackTime) >= enemy.attackCooldown) {
    return {
      ...enemy,
      isAttacking: true,
      attackFrame: 0,
      attackDamageDealt: false, // Reset du flag de dégâts
      lastAttackTime: currentTime
    };
  }

  // Mouvement vers le joueur
  if (distance > 1) {
    const normalizedX = deltaX / distance;
    const normalizedY = deltaY / distance;
    
    const newX = enemy.x + normalizedX * enemy.moveSpeed;
    const newY = enemy.y + normalizedY * enemy.moveSpeed;
    
    // Déterminer la direction de mouvement
    let newDirection = enemy.direction;
    if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
      newDirection = normalizedX > 0 ? 3 : 2; // Droite ou Gauche
    } else {
      newDirection = normalizedY > 0 ? 0 : 1; // Bas ou Haut
    }

    return {
      ...enemy,
      x: newX,
      y: newY,
      direction: newDirection
    };
  }

  return enemy;
};

// Fonction pour animer l'attaque des ennemis
export const animateEnemyAttack = (enemy: Enemy, currentTime: number): Enemy => {
  if (!enemy.isAttacking) return enemy;
  
  const config = ENEMY_ATTACK_CONFIG[enemy.type];
  
  // Animation de l'attaque
  if (currentTime - enemy.lastFrameTime >= config.animationSpeed) {
    const nextFrame = enemy.attackFrame + 1;
    
    if (nextFrame >= config.totalFrames) {
      // Animation terminée - TOUJOURS finir l'animation complètement
      return {
        ...enemy,
        isAttacking: false,
        attackFrame: 0,
        attackDamageDealt: false, // Reset pour la prochaine attaque
        lastFrameTime: currentTime
      };
    } else {
      // Continuer l'animation
      return {
        ...enemy,
        attackFrame: nextFrame,
        lastFrameTime: currentTime
      };
    }
  }
  
  return enemy;
};

// Fonction pour marquer qu'un ennemi a infligé des dégâts (appelée après vérification de hit)
export const markEnemyDamageDealt = (enemy: Enemy): Enemy => {
  return {
    ...enemy,
    attackDamageDealt: true
  };
};

// Fonction pour animer le mouvement des ennemis
export const animateEnemyMovement = (enemy: Enemy, currentTime: number): Enemy => {
  if (enemy.isAttacking || enemy.isDying || !enemy.isAlive) return enemy;

  if (currentTime - enemy.lastFrameTime >= enemy.animationSpeed) {
    return {
      ...enemy,
      frame: (enemy.frame + 1) % 4,
      lastFrameTime: currentTime
    };
  }
  
  return enemy;
};

// Fonction pour animer la mort des ennemis
export const animateEnemyDeath = (enemy: Enemy, currentTime: number): Enemy => {
  if (!enemy.isDying) return enemy;

  const deathAnimationSpeed = 200;
  const maxDeathFrames = 4;

  if (currentTime - enemy.lastFrameTime >= deathAnimationSpeed) {
    const nextDeathFrame = enemy.deathFrame + 1;
    
    if (nextDeathFrame >= maxDeathFrames) {
      return {
        ...enemy,
        isAlive: false,
        lastFrameTime: currentTime
      };
    } else {
      return {
        ...enemy,
        deathFrame: nextDeathFrame,
        lastFrameTime: currentTime
      };
    }
  }
  
  return enemy;
};

// Fonction pour animer le spawn des ennemis
export const animateEnemySpawn = (enemy: Enemy, currentTime: number): Enemy => {
  if (enemy.hasSpawned) return enemy;

  if (currentTime - enemy.lastSpawnFrameTime >= enemy.spawnAnimationSpeed) {
    const nextSpawnFrame = enemy.spawnFrame + 1;
    const maxSpawnFrames = 4;
    
    if (nextSpawnFrame >= maxSpawnFrames) {
      return {
        ...enemy,
        hasSpawned: true,
        spawnFrame: 0,
        lastSpawnFrameTime: currentTime
      };
    } else {
      return {
        ...enemy,
        spawnFrame: nextSpawnFrame,
        lastSpawnFrameTime: currentTime
      };
    }
  }
  
  return enemy;
};