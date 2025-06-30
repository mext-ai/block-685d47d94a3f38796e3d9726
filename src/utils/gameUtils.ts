import { Position, Enemy } from '../types';
import { TOP_LIMIT, BOTTOM_LIMIT, LEFT_LIMIT, RIGHT_LIMIT } from '../constants';

// Fonction de collision entre deux entités
export const checkCollision = (pos1: Position, pos2: Position, minDistance: number = 3) => {
  const deltaX = pos1.x - pos2.x;
  const deltaY = pos1.y - pos2.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return distance < minDistance;
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