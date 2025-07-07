import { Position } from '../types';

export interface Enemy {
  id: string;
  type: 'mushroom' | 'treant' | 'devil' | 'goblin' | 'golem';
  position: Position;
  isAlive: boolean;
  isDying: boolean;
  health: number;
  maxHealth: number;
  deathFrame: number;
  isAttacking: boolean;
  attackFrame: number;
  attackCooldown: number;
  direction: 'up' | 'down' | 'left' | 'right';
  hasSpawned: boolean;
  hasDamageBeenDealt: boolean; // Flag pour empêcher les dégâts multiples
}

export const createEnemy = (id: string, type: 'mushroom' | 'treant' | 'devil' | 'goblin' | 'golem', position: Position): Enemy => {
  const maxHealth = type === 'treant' ? 3 : type === 'devil' ? 2 : type === 'golem' ? 8 : type === 'goblin' ? 2 : 1;
  
  return {
    id,
    type,
    position,
    isAlive: true,
    isDying: false,
    health: maxHealth,
    maxHealth,
    deathFrame: 0,
    isAttacking: false,
    attackFrame: 0,
    attackCooldown: 0,
    direction: 'down',
    hasSpawned: false,
    hasDamageBeenDealt: false
  };
};

export const updateEnemyMovement = (enemy: Enemy, playerPosition: Position, deltaTime: number): Enemy => {
  // Les ennemis ne bougent pas s'ils ne sont pas vivants, meurent, attaquent, ou ne sont pas encore apparus
  if (!enemy.isAlive || enemy.isDying || enemy.isAttacking || !enemy.hasSpawned) return enemy;

  const dx = playerPosition.x - enemy.position.x;
  const dy = playerPosition.y - enemy.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Si le joueur est proche, l'ennemi essaie d'attaquer (mais seulement si pas en cooldown)
  if (distance <= 12 && enemy.attackCooldown <= 0) {
    // Déterminer la direction vers le joueur
    if (Math.abs(dx) > Math.abs(dy)) {
      enemy.direction = dx > 0 ? 'right' : 'left';
    } else {
      enemy.direction = dy > 0 ? 'down' : 'up';
    }
    
    // Commencer l'attaque
    return {
      ...enemy,
      isAttacking: true,
      attackFrame: 0,
      hasDamageBeenDealt: false // Reset du flag de dégâts pour cette nouvelle attaque
    };
  }

  // Sinon, se déplacer vers le joueur
  const speed = 50; // pixels par seconde
  const moveDistance = speed * deltaTime;

  if (distance > 0) {
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    // Déterminer la direction principale
    if (Math.abs(normalizedDx) > Math.abs(normalizedDy)) {
      enemy.direction = normalizedDx > 0 ? 'right' : 'left';
    } else {
      enemy.direction = normalizedDy > 0 ? 'down' : 'up';
    }

    return {
      ...enemy,
      position: {
        x: enemy.position.x + normalizedDx * moveDistance,
        y: enemy.position.y + normalizedDy * moveDistance
      }
    };
  }

  return enemy;
};

export const updateEnemyAttack = (enemy: Enemy, deltaTime: number): Enemy => {
  if (!enemy.isAttacking) {
    // Réduire le cooldown d'attaque
    if (enemy.attackCooldown > 0) {
      return {
        ...enemy,
        attackCooldown: Math.max(0, enemy.attackCooldown - deltaTime)
      };
    }
    return enemy;
  }

  // Mettre à jour l'animation d'attaque
  const frameTime = 0.1; // 100ms par frame
  const newAttackFrame = enemy.attackFrame + deltaTime / frameTime;

  // Déterminer le nombre total de frames selon le type d'ennemi
  let totalFrames = 0;
  switch (enemy.type) {
    case 'mushroom':
      totalFrames = 4;
      break;
    case 'treant':
      totalFrames = 7;
      break;
    case 'devil':
      totalFrames = 6;
      break;
    case 'goblin':
      totalFrames = 5;
      break;
    case 'golem':
      totalFrames = 9;
      break;
  }

  // Si l'animation est terminée
  if (newAttackFrame >= totalFrames) {
    return {
      ...enemy,
      isAttacking: false,
      attackFrame: 0,
      attackCooldown: 2, // 2 secondes de cooldown
      hasDamageBeenDealt: false // Reset pour la prochaine attaque
    };
  }

  // Continuer l'animation d'attaque
  return {
    ...enemy,
    attackFrame: newAttackFrame
  };
};

export const checkEnemyAttackHit = (enemy: Enemy, playerPosition: Position): boolean => {
  const dx = playerPosition.x - enemy.position.x;
  const dy = playerPosition.y - enemy.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Vérifier la portée de base
  const maxAttackRange = 12;
  if (distance > maxAttackRange) return false;

  // Pour les tréants, utiliser une hitbox directionnelle précise
  if (enemy.type === 'treant') {
    // Créer un vecteur de direction selon la direction du tréant
    let directionVector = { x: 0, y: 0 };
    switch (enemy.direction) {
      case 'up':
        directionVector = { x: 0, y: -1 };
        break;
      case 'down':
        directionVector = { x: 0, y: 1 };
        break;
      case 'left':
        directionVector = { x: -1, y: 0 };
        break;
      case 'right':
        directionVector = { x: 1, y: 0 };
        break;
    }

    // Vecteur vers le joueur (normalisé)
    const toPlayerVector = { x: dx / distance, y: dy / distance };

    // Produit scalaire pour vérifier l'alignement
    const alignment = directionVector.x * toPlayerVector.x + directionVector.y * toPlayerVector.y;
    
    // Le joueur doit être devant le tréant (alignment > 0.5 signifie environ 60° de cône)
    if (alignment < 0.5) return false;

    // Vérifier la largeur de l'attaque (distance perpendiculaire à la direction)
    const attackWidth = 4;
    const perpDistance = Math.abs(-directionVector.y * dx + directionVector.x * dy);
    
    return perpDistance <= attackWidth / 2;
  }

  // Pour les golems, utiliser une attaque circulaire (tout autour)
  if (enemy.type === 'golem') {
    return distance <= 8; // Portée d'attaque circulaire pour les golems
  }

  // Pour les goblins, utiliser une hitbox circulaire simple
  if (enemy.type === 'goblin') {
    return distance <= maxAttackRange;
  }

  // Pour les autres ennemis (champignons, diables), utiliser une hitbox circulaire simple
  return distance <= maxAttackRange;
};

export const markEnemyDamageDealt = (enemy: Enemy): Enemy => {
  return {
    ...enemy,
    hasDamageBeenDealt: true
  };
};

export const takeDamage = (enemy: Enemy, damage: number): Enemy => {
  const newHealth = Math.max(0, enemy.health - damage);
  
  if (newHealth <= 0) {
    return {
      ...enemy,
      health: 0,
      isAlive: false,
      isDying: true,
      deathFrame: 0,
      isAttacking: false
    };
  }

  return {
    ...enemy,
    health: newHealth
  };
};

export const updateEnemyDeath = (enemy: Enemy, deltaTime: number): Enemy => {
  if (!enemy.isDying) return enemy;

  const frameTime = 0.1;
  const newDeathFrame = enemy.deathFrame + deltaTime / frameTime;

  return {
    ...enemy,
    deathFrame: newDeathFrame
  };
};