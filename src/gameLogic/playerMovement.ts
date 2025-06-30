import { Position, Keys } from '../types';

export const updatePlayerPosition = (
  currentPosition: Position,
  keys: Keys,
  speed: number = 0.5
): Position => {
  let newX = currentPosition.x;
  let newY = currentPosition.y;

  if (keys.up) newY = Math.max(5, newY - speed);
  if (keys.down) newY = Math.min(95, newY + speed);
  if (keys.left) newX = Math.max(5, newX - speed);
  if (keys.right) newX = Math.min(95, newX + speed);

  return { x: newX, y: newY };
};

export const getPlayerDirection = (keys: Keys): number => {
  if (keys.down) return 0; // Bas
  if (keys.left) return 1; // Gauche
  if (keys.up) return 2; // Haut
  if (keys.right) return 3; // Droite
  return 0; // Direction par défaut
};

export const isPlayerWalking = (keys: Keys): boolean => {
  return keys.up || keys.down || keys.left || keys.right;
};

export const getDirectionName = (dir: number): string => {
  switch (dir) {
    case 0: return 'down';
    case 1: return 'left';
    case 2: return 'up';
    case 3: return 'right';
    default: return 'down';
  }
}; 