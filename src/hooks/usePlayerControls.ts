import { useState, useEffect } from 'react';
import { Keys, Position } from '../types';
import { TOP_LIMIT, BOTTOM_LIMIT, LEFT_LIMIT, RIGHT_LIMIT } from '../constants';
import { checkCollision } from '../utils/gameUtils';

export const usePlayerControls = (
  gameState: string,
  isVictory: boolean,
  playerHp: number,
  isAttacking: boolean,
  position: Position,
  enemies: any[],
  setPosition: (position: Position | ((prev: Position) => Position)) => void,
  setIsWalking: (walking: boolean) => void,
  setDirection: (direction: number) => void,
  enemiesRef: React.MutableRefObject<any[]>
) => {
  const [keys, setKeys] = useState<Keys>({ 
    up: false, 
    down: false, 
    left: false, 
    right: false, 
    space: false 
  });

  // Gestion du mouvement avec limites et collision avec les ennemis
  useEffect(() => {
    if (gameState !== 'playing' || isVictory || playerHp <= 0) return;
    
    const moveInterval = setInterval(() => {
      if (!isAttacking && (keys.up || keys.down || keys.left || keys.right)) {
        setIsWalking(true);
        setPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;
          const speed = 0.5;

          if (keys.up) {
            newY = Math.max(TOP_LIMIT, prev.y - speed);
            setDirection(1);
          }
          if (keys.down) {
            newY = Math.min(BOTTOM_LIMIT, prev.y + speed);
            setDirection(0);
          }
          if (keys.left) {
            newX = Math.max(LEFT_LIMIT, prev.x - speed);
            setDirection(2);
          }
          if (keys.right) {
            newX = Math.min(RIGHT_LIMIT, prev.x + speed);
            setDirection(3);
          }

          const potentialPos = { x: newX, y: newY };
          const collisionDistance = 3;
          let hasCollision = false;
          
          enemiesRef.current.forEach((enemy: any) => {
            if (enemy.isAlive && !enemy.isDying && enemy.hasSpawned && 
                checkCollision(potentialPos, { x: enemy.x, y: enemy.y }, collisionDistance)) {
              hasCollision = true;
            }
          });
          
          if (hasCollision) {
            return prev;
          }

          return { x: newX, y: newY };
        });
      } else {
        setIsWalking(false);
      }
    }, 16);

    return () => clearInterval(moveInterval);
  }, [keys, isAttacking, gameState, isVictory, playerHp, setPosition, setIsWalking, setDirection, enemiesRef]);

  // Gestion des touches
  useEffect(() => {
    if (gameState !== 'playing' || isVictory || playerHp <= 0) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      
      setKeys(prev => ({
        ...prev,
        up: prev.up || key === 'arrowup' || key === 'z',
        down: prev.down || key === 'arrowdown' || key === 's',
        left: prev.left || key === 'arrowleft' || key === 'q',
        right: prev.right || key === 'arrowright' || key === 'd',
        space: prev.space || key === ' '
      }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key.toLowerCase();
      
      setKeys(prev => ({
        ...prev,
        up: key === 'arrowup' || key === 'z' ? false : prev.up,
        down: key === 'arrowdown' || key === 's' ? false : prev.down,
        left: key === 'arrowleft' || key === 'q' ? false : prev.left,
        right: key === 'arrowright' || key === 'd' ? false : prev.right,
        space: key === ' ' ? false : prev.space
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, isVictory, playerHp]);

  return {
    keys,
    setKeys
  };
};