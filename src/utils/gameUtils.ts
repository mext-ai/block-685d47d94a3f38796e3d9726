import { Position, Enemy } from '../types';
import { TOP_LIMIT, BOTTOM_LIMIT, LEFT_LIMIT, RIGHT_LIMIT } from '../constants';

// Fonction de collision entre deux entités
export const checkCollision = (pos1: Position, pos2: Position, minDistance: number = 5) => {
  const deltaX = pos1.x - pos2.x;
  const deltaY = pos1.y - pos2.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return distance < minDistance;
};

// Fonction pour gérer la poussée des ennemis par le joueur
export const handlePlayerPushEnemies = (
  playerPos: Position,
  desiredPos: Position,
  enemies: Enemy[],
  pushForce: number = 0.3
): { newPlayerPos: Position; updatedEnemies: Enemy[] } => {
  const collisionDistance = 6; // Distance de détection de collision
  const pushDistance = pushForce;
  const updatedEnemies = [...enemies];
  let hasCollision = false;

  // Première passe : vérifier s'il y a des collisions avec la position désirée
  for (let i = 0; i < updatedEnemies.length; i++) {
    const enemy = updatedEnemies[i];
    
    // Vérifier si l'ennemi est vivant et peut être poussé
    if (!enemy.isAlive || enemy.isDying || !enemy.hasSpawned || enemy.isAttacking) {
      continue;
    }

    const deltaX = desiredPos.x - enemy.x;
    const deltaY = desiredPos.y - enemy.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Si collision détectée
    if (distance < collisionDistance && distance > 0) {
      hasCollision = true;
      break;
    }
  }

  // Si pas de collision, permettre le mouvement complet
  if (!hasCollision) {
    return { newPlayerPos: desiredPos, updatedEnemies };
  }

  // Deuxième passe : pousser les ennemis et calculer le mouvement du joueur
  let canPushAll = true;
  let pushedEnemies = 0;
  let totalPushResistance = 0;
  
  for (let i = 0; i < updatedEnemies.length; i++) {
    const enemy = updatedEnemies[i];
    
    // Vérifier si l'ennemi est vivant et peut être poussé
    if (!enemy.isAlive || enemy.isDying || !enemy.hasSpawned || enemy.isAttacking) {
      continue;
    }

    const deltaX = desiredPos.x - enemy.x;
    const deltaY = desiredPos.y - enemy.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Si collision détectée
    if (distance < collisionDistance && distance > 0) {
      // Calculer la direction de poussée (du joueur vers l'ennemi)
      const pushDirectionX = deltaX / distance;
      const pushDirectionY = deltaY / distance;

      // Force de poussée basée sur la proximité
      const proximityFactor = Math.max(0.3, 1 - (distance / collisionDistance));
      const adjustedPushDistance = pushDistance * proximityFactor * 1.5;

      // Calculer la nouvelle position de l'ennemi
      let newEnemyX = enemy.x + pushDirectionX * adjustedPushDistance;
      let newEnemyY = enemy.y + pushDirectionY * adjustedPushDistance;

      // Appliquer les limites de mouvement pour l'ennemi
      const topLimit = 35;
      const bottomLimit = 90;
      const leftLimit = 5;
      const rightLimit = 95;

      newEnemyX = Math.max(leftLimit, Math.min(rightLimit, newEnemyX));
      newEnemyY = Math.max(topLimit, Math.min(bottomLimit, newEnemyY));

      // Vérifier que la nouvelle position de l'ennemi ne crée pas de collision avec d'autres ennemis
      let enemyCanMove = true;
      for (let j = 0; j < updatedEnemies.length; j++) {
        if (i === j) continue;
        
        const otherEnemy = updatedEnemies[j];
        if (!otherEnemy.isAlive || otherEnemy.isDying || !otherEnemy.hasSpawned) continue;

        const enemyDeltaX = newEnemyX - otherEnemy.x;
        const enemyDeltaY = newEnemyY - otherEnemy.y;
        const enemyDistance = Math.sqrt(enemyDeltaX * enemyDeltaX + enemyDeltaY * enemyDeltaY);

        if (enemyDistance < 3) { // Distance minimale entre ennemis
          enemyCanMove = false;
          break;
        }
      }

      // Si l'ennemi peut être déplacé, mettre à jour sa position
      if (enemyCanMove) {
        updatedEnemies[i] = {
          ...enemy,
          x: newEnemyX,
          y: newEnemyY
        };
        pushedEnemies++;
        totalPushResistance += proximityFactor;
      } else {
        // Si l'ennemi ne peut pas être poussé, ajouter de la résistance
        canPushAll = false;
        totalPushResistance += 1.5; // Plus de résistance si l'ennemi ne peut pas bouger
      }
    }
  }

  // Troisième passe : calculer le mouvement final du joueur
  let finalPlayerPos = desiredPos;
  
  if (pushedEnemies > 0) {
    // Si on peut pousser au moins un ennemi, permettre un mouvement partiel
    const averageResistance = totalPushResistance / Math.max(1, pushedEnemies);
    const movementFactor = Math.max(0.2, 1 - (averageResistance * 0.3)); // Entre 20% et 100%
    
    const deltaX = desiredPos.x - playerPos.x;
    const deltaY = desiredPos.y - playerPos.y;
    
    finalPlayerPos = {
      x: playerPos.x + deltaX * movementFactor,
      y: playerPos.y + deltaY * movementFactor
    };
  } else if (!canPushAll) {
    // Si on ne peut pousser aucun ennemi, mouvement minimal
    const deltaX = desiredPos.x - playerPos.x;
    const deltaY = desiredPos.y - playerPos.y;
    const minimalMovement = 0.1; // 10% de mouvement minimum
    
    finalPlayerPos = {
      x: playerPos.x + deltaX * minimalMovement,
      y: playerPos.y + deltaY * minimalMovement
    };
  }

  return { newPlayerPos: finalPlayerPos, updatedEnemies };
};

// Fonction pour vérifier si l'ennemi est dans l'arc d'attaque de 180°
export const isEnemyInAttackDirection = (
  playerX: number, 
  playerY: number, 
  enemyX: number, 
  enemyY: number, 
  playerDirection: number
) => {
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
};

// Fonction pour calculer l'état d'un cœur
export const getHeartState = (heartIndex: number, currentHp: number) => {
  const hpForThisHeart = currentHp - (heartIndex * 2);
  if (hpForThisHeart >= 2) return 0;
  if (hpForThisHeart === 1) return 1;
  return 2;
};

// Fonction pour obtenir le nom de la direction
export const getDirectionName = (dir: number) => {
  switch (dir) {
    case 0: return 'Bas ↓';
    case 1: return 'Haut ↑';
    case 2: return 'Gauche ←';
    case 3: return 'Droite →';
    default: return 'Inconnu';
  }
};

// Fonction pour calculer l'échelle responsive
export const calculateResponsiveScale = (windowSize: { width: number; height: number }) => {
  const baseWidth = 1920;
  const baseHeight = 1080;
  const minScale = 2.25;
  const maxScale = 9;
  
  const widthRatio = windowSize.width / baseWidth;
  const heightRatio = windowSize.height / baseHeight;
  const scaleRatio = Math.min(widthRatio, heightRatio);
  
  const newPlayerScale = Math.max(minScale, Math.min(maxScale, 5.25 * scaleRatio));
  const newEnemyScale = Math.max(minScale * 0.8, Math.min(maxScale * 0.8, 4.5 * scaleRatio));
  const newTreantScale = Math.max(minScale * 1.5, Math.min(maxScale * 1.5, 12 * scaleRatio));
  
  return {
    playerScale: newPlayerScale,
    enemyScale: newEnemyScale,
    treantScale: newTreantScale
  };
};

// Fonction pour limiter une position dans les limites du jeu
export const limitPosition = (position: Position): Position => {
  return {
    x: Math.max(LEFT_LIMIT, Math.min(RIGHT_LIMIT, position.x)),
    y: Math.max(TOP_LIMIT, Math.min(BOTTOM_LIMIT, position.y))
  };
}; 