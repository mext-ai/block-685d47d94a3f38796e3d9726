import { useEffect, useRef } from 'react';
import { Position, Enemy } from '../types';
import { TOP_LIMIT, BOTTOM_LIMIT, LEFT_LIMIT, RIGHT_LIMIT } from '../constants';
import { checkCollision } from '../utils/gameUtils';

interface UsePlayerMovementProps {
  gameState: string;
  playerHealth: number;
  isAttacking: boolean;
  keys: { up: boolean; down: boolean; left: boolean; right: boolean };
  position: Position;
  enemies: Enemy[];
  setPosition: (position: Position | ((prev: Position) => Position)) => void;
}

export const usePlayerMovement = ({
  gameState,
  playerHealth,
  isAttacking,
  keys,
  position,
  enemies,
  setPosition
}: UsePlayerMovementProps) => {
  const enemiesRef = useRef(enemies);
  enemiesRef.current = enemies;

  // Gestion du mouvement avec limites et collision avec les ennemis
  useEffect(() => {
    if (gameState !== 'playing' || playerHealth <= 0) return;
    
    const moveInterval = setInterval(() => {
      const isMoving = keys.up || keys.down || keys.left || keys.right;
      
      if (!isAttacking && isMoving) {
        setPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;
          const speed = 0.5;
          
          // Calculer le vecteur de mouvement
          let moveX = 0;
          let moveY = 0;
          
          if (keys.up && !keys.down) moveY -= 1;
          if (keys.down && !keys.up) moveY += 1;
          if (keys.left && !keys.right) moveX -= 1;
          if (keys.right && !keys.left) moveX += 1;
          
          // Normaliser le vecteur pour maintenir une vitesse constante en diagonale
          if (moveX !== 0 && moveY !== 0) {
            // Mouvement diagonal : normaliser à √2 pour maintenir la vitesse
            const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX = (moveX / magnitude) * speed;
            moveY = (moveY / magnitude) * speed;
          } else {
            // Mouvement horizontal ou vertical uniquement
            moveX *= speed;
            moveY *= speed;
          }
          
          // Appliquer le mouvement
          newX = Math.max(LEFT_LIMIT, Math.min(RIGHT_LIMIT, prev.x + moveX));
          newY = Math.max(TOP_LIMIT, Math.min(BOTTOM_LIMIT, prev.y + moveY));

          const potentialPos = { x: newX, y: newY };
          const collisionDistance = 3;
          
          // Vérification des collisions avec les ennemis
          for (const enemy of enemiesRef.current) {
            if (enemy.isAlive && !enemy.isDying && enemy.hasSpawned && 
                checkCollision(potentialPos, { x: enemy.x, y: enemy.y }, collisionDistance)) {
              return prev; // Pas de mouvement si collision
            }
          }

          return potentialPos;
        });
      }
    }, 16);

    return () => clearInterval(moveInterval);
  }, [keys, isAttacking, gameState, playerHealth, setPosition]);
}; 