import { Position, Enemy } from '../types';
import { TOP_LIMIT, BOTTOM_LIMIT, LEFT_LIMIT, RIGHT_LIMIT } from '../constants';

// Fonction de collision entre deux entités
export const checkCollision = (pos1: Position, pos2: Position, minDistance: number = 5) => {
  const deltaX = pos1.x - pos2.x;
  const deltaY = pos1.y - pos2.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return distance < minDistance;
};

// Fonction pour gérer la collision et la poussée des ennemis par le joueur
export const handlePlayerPushEnemies = (
  playerPos: Position,
  desiredPos: Position,
  enemies: Enemy[],
  pushForce: number = 0.3
): { newPlayerPos: Position; updatedEnemies: Enemy[] } => {
  const collisionDistance = 4; // Distance de détection de collision
  const pushDistance = pushForce;
  const updatedEnemies = [...enemies];
  let hasCollisionWithSolidEnemy = false;
  let hasPushableCollision = false;

  // Types d'ennemis solides (comme des murs)
  const solidEnemyTypes: Array<Enemy['type']> = ['golem', 'treant'];
  
  // Types d'ennemis qui ne sont pas poussés mais peuvent attaquer en corps à corps
  const nonPushableButAttackingTypes: Array<Enemy['type']> = ['mushroom'];

  // Première passe : identifier tous les ennemis en collision
  const collidingEnemies: { index: number; enemy: Enemy; distance: number; isSolid: boolean; isNonPushableAttacker: boolean }[] = [];
  
  for (let i = 0; i < updatedEnemies.length; i++) {
    const enemy = updatedEnemies[i];
    
    // Vérifier si l'ennemi est vivant et a spawné
    if (!enemy.isAlive || enemy.isDying || !enemy.hasSpawned) {
      continue;
    }

    const deltaX = desiredPos.x - enemy.x;
    const deltaY = desiredPos.y - enemy.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Si collision détectée
    if (distance < collisionDistance && distance > 0) {
      const isSolid = solidEnemyTypes.includes(enemy.type);
      const isNonPushableAttacker = nonPushableButAttackingTypes.includes(enemy.type);
      
      if (isSolid) {
        hasCollisionWithSolidEnemy = true;
      } else if (isNonPushableAttacker) {
        // Les champignons ne sont pas poussés mais peuvent attaquer
        // On ne bloque pas le mouvement mais on ne les pousse pas non plus
      } else if (!enemy.isAttacking) {
        // Les autres ennemis peuvent être poussés seulement s'ils n'attaquent pas
        hasPushableCollision = true;
      }
      
      collidingEnemies.push({ index: i, enemy, distance, isSolid, isNonPushableAttacker });
    }
  }

  // Si collision avec un ennemi solide, bloquer complètement le mouvement
  if (hasCollisionWithSolidEnemy) {
    return { newPlayerPos: playerPos, updatedEnemies };
  }

  // Si pas de collision avec des ennemis poussables, permettre le mouvement complet
  if (!hasPushableCollision) {
    return { newPlayerPos: desiredPos, updatedEnemies };
  }

  // Deuxième passe : traiter les ennemis poussables en collision
  let pushedEnemies = 0;
  
  // Calculer la direction du mouvement du joueur
  const playerMoveX = desiredPos.x - playerPos.x;
  const playerMoveY = desiredPos.y - playerPos.y;
  const playerMoveLength = Math.sqrt(playerMoveX * playerMoveX + playerMoveY * playerMoveY);
  
  if (playerMoveLength > 0) {
    // Normaliser le mouvement du joueur
    const normalizedMoveX = playerMoveX / playerMoveLength;
    const normalizedMoveY = playerMoveY / playerMoveLength;
    
    // Traiter chaque ennemi poussable en collision avec une direction unique
    const pushableEnemies = collidingEnemies.filter(ce => !ce.isSolid && !ce.isNonPushableAttacker);
    
    for (let i = 0; i < pushableEnemies.length; i++) {
      const { index, enemy } = pushableEnemies[i];
      
      // Calculer une direction de poussée unique pour chaque ennemi
      let pushDirectionX: number;
      let pushDirectionY: number;
      
      if (pushableEnemies.length === 1) {
        // Un seul ennemi : poussée perpendiculaire classique
        pushDirectionX = -normalizedMoveY;
        pushDirectionY = normalizedMoveX;
        
        // Déterminer de quel côté dévier l'ennemi (le plus proche du centre)
        const centerX = 50;
        const centerY = 50;
        const enemyToCenterX = centerX - enemy.x;
        const enemyToCenterY = centerY - enemy.y;
        
        const dotProduct = pushDirectionX * enemyToCenterX + pushDirectionY * enemyToCenterY;
        const deviationDirection = dotProduct > 0 ? 1 : -1;
        
        pushDirectionX *= deviationDirection;
        pushDirectionY *= deviationDirection;
      } else {
        // Plusieurs ennemis : utiliser des directions radiales variées
        const angleStep = (2 * Math.PI) / pushableEnemies.length;
        const baseAngle = Math.atan2(normalizedMoveY, normalizedMoveX);
        const pushAngle = baseAngle + (i * angleStep) + (Math.PI / 2); // Commencer perpendiculairement
        
        pushDirectionX = Math.cos(pushAngle);
        pushDirectionY = Math.sin(pushAngle);
      }
      
      // Calculer la nouvelle position de l'ennemi
      let newEnemyX = enemy.x + pushDirectionX * pushDistance;
      let newEnemyY = enemy.y + pushDirectionY * pushDistance;

      // Appliquer les limites de mouvement pour l'ennemi
      const topLimit = 35;
      const bottomLimit = 90;
      const leftLimit = 5;
      const rightLimit = 95;

      newEnemyX = Math.max(leftLimit, Math.min(rightLimit, newEnemyX));
      newEnemyY = Math.max(topLimit, Math.min(bottomLimit, newEnemyY));

      // Appliquer directement la poussée sans vérifier les collisions entre ennemis
      // puisque les ennemis n'ont pas de collision entre eux
      updatedEnemies[index] = {
        ...enemy,
        x: newEnemyX,
        y: newEnemyY
      };
      pushedEnemies++;
    }
  }

  // Troisième passe : calculer le mouvement final du joueur
  let finalPlayerPos = desiredPos;
  
  if (pushedEnemies > 0) {
    // Si on peut dévier des ennemis, permettre un mouvement plus fluide
    const movementFactor = Math.max(0.85, 1 - (pushedEnemies * 0.05)); // Entre 85% et 100%
    
    const deltaX = desiredPos.x - playerPos.x;
    const deltaY = desiredPos.y - playerPos.y;
    
    finalPlayerPos = {
      x: playerPos.x + deltaX * movementFactor,
      y: playerPos.y + deltaY * movementFactor
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