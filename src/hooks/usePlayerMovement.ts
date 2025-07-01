import { useState, useCallback } from 'react';
import { Position, GameState } from '../types';

export const usePlayerMovement = (
  initialPosition: Position,
  speed: number,
  mapWidth: number,
  mapHeight: number,
  gameState: GameState,
  enemies: any[] = []
) => {
  const [playerPosition, setPlayerPosition] = useState<Position>(initialPosition);

  // Fonction de collision entre deux entités (comme dans l'original)
  const checkCollision = (pos1: {x: number, y: number}, pos2: {x: number, y: number}, minDistance: number = 3) => {
    const deltaX = pos1.x - pos2.x;
    const deltaY = pos1.y - pos2.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance < minDistance;
  };

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') {
      return;
    }

    setPlayerPosition(prev => {
      // Limites de mouvement en pourcentages (légèrement élargies)
      const topLimit = 30;
      const bottomLimit = 95;
      const leftLimit = 2;
      const rightLimit = 98;
      
      const newX = Math.max(leftLimit, Math.min(rightLimit, prev.x + dx * speed));
      const newY = Math.max(topLimit, Math.min(bottomLimit, prev.y + dy * speed));
      
      // Vérifier les collisions avec les ennemis (système optimisé)
      const collisionDistance = 2.5; // Distance légèrement réduite pour éviter les faux positifs
      let hasCollision = false;
      
      // Vérifier seulement les ennemis qui sont vraiment proches (optimisation)
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.isAlive && !enemy.isDying && enemy.hasSpawned) {
          const deltaX = newX - enemy.x;
          const deltaY = newY - enemy.y;
          const distanceSquared = deltaX * deltaX + deltaY * deltaY;
          
          // Utiliser distanceSquared pour éviter le calcul de racine carrée
          if (distanceSquared < collisionDistance * collisionDistance) {
            hasCollision = true;
            break; // Sortir dès qu'on trouve une collision
          }
        }
      }
      
      if (hasCollision) {
        return prev; // Ne pas bouger si collision
      }
      
      return { x: newX, y: newY };
    });
  }, [gameState, speed, enemies]);

  const resetPlayer = useCallback(() => {
    setPlayerPosition(initialPosition);
  }, [initialPosition]);

  return {
    playerPosition,
    movePlayer,
    resetPlayer
  };
}; 