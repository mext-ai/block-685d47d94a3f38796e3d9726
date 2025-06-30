import { Position, Enemy } from '../types';

export const checkCollision = (pos1: Position, pos2: Position, minDistance: number = 3) => {
  const distance = Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
  );
  return distance < minDistance;
};

export const checkEnemyAttackHit = (enemy: Enemy, playerPosition: Position) => {
  if (!enemy.isAlive || enemy.isDying || !enemy.hasSpawned) return false;
  
  const distance = Math.sqrt(
    Math.pow(enemy.x - playerPosition.x, 2) + Math.pow(enemy.y - playerPosition.y, 2)
  );
  
  // Distance d'attaque différente selon le type d'ennemi
  const attackRange = enemy.type === 'treant' ? 8 : 6;
  
  return distance < attackRange;
};

export const isEnemyInAttackDirection = (
  playerX: number, 
  playerY: number, 
  enemyX: number, 
  enemyY: number, 
  playerDirection: number
) => {
  const dx = enemyX - playerX;
  const dy = enemyY - playerY;
  
  // Vérifier si l'ennemi est dans la direction d'attaque du joueur
  switch (playerDirection) {
    case 0: // Bas
      return dy > 0 && Math.abs(dx) < Math.abs(dy);
    case 1: // Gauche
      return dx < 0 && Math.abs(dy) < Math.abs(dx);
    case 2: // Haut
      return dy < 0 && Math.abs(dx) < Math.abs(dy);
    case 3: // Droite
      return dx > 0 && Math.abs(dy) < Math.abs(dx);
    default:
      return false;
  }
}; 