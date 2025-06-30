import { useState, useEffect, useCallback } from 'react';
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

  // Fonction pour normaliser les touches
  const normalizeKey = useCallback((key: string): string => {
    return key.toLowerCase();
  }, []);

  // Fonction pour vérifier si une touche correspond à une direction
  const isKeyForDirection = useCallback((key: string, direction: 'up' | 'down' | 'left' | 'right'): boolean => {
    const normalizedKey = normalizeKey(key);
    switch (direction) {
      case 'up':
        return normalizedKey === 'arrowup' || normalizedKey === 'z';
      case 'down':
        return normalizedKey === 'arrowdown' || normalizedKey === 's';
      case 'left':
        return normalizedKey === 'arrowleft' || normalizedKey === 'q';
      case 'right':
        return normalizedKey === 'arrowright' || normalizedKey === 'd';
      default:
        return false;
    }
  }, [normalizeKey]);

  // Gestion du mouvement avec limites et collision avec les ennemis
  useEffect(() => {
    if (gameState !== 'playing' || isVictory || playerHp <= 0) return;
    
    const moveInterval = setInterval(() => {
      const isMoving = keys.up || keys.down || keys.left || keys.right;
      
      if (!isAttacking && isMoving) {
        setIsWalking(true);
        
        setPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;
          const speed = 0.5;

          // Gestion des mouvements avec priorité
          if (keys.up && !keys.down) {
            newY = Math.max(TOP_LIMIT, prev.y - speed);
            setDirection(1);
          } else if (keys.down && !keys.up) {
            newY = Math.min(BOTTOM_LIMIT, prev.y + speed);
            setDirection(0);
          }
          
          if (keys.left && !keys.right) {
            newX = Math.max(LEFT_LIMIT, prev.x - speed);
            setDirection(2);
          } else if (keys.right && !keys.left) {
            newX = Math.min(RIGHT_LIMIT, prev.x + speed);
            setDirection(3);
          }

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
      } else {
        setIsWalking(false);
      }
    }, 16);

    return () => clearInterval(moveInterval);
  }, [keys, isAttacking, gameState, isVictory, playerHp, setPosition, setIsWalking, setDirection, enemiesRef]);

  // Gestion des touches - version corrigée
  useEffect(() => {
    if (gameState !== 'playing' || isVictory || playerHp <= 0) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key;
      
      setKeys(prev => {
        const newKeys = { ...prev };
        
        if (isKeyForDirection(key, 'up')) newKeys.up = true;
        if (isKeyForDirection(key, 'down')) newKeys.down = true;
        if (isKeyForDirection(key, 'left')) newKeys.left = true;
        if (isKeyForDirection(key, 'right')) newKeys.right = true;
        if (key === ' ') newKeys.space = true;
        
        return newKeys;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key;
      
      setKeys(prev => {
        const newKeys = { ...prev };
        
        if (isKeyForDirection(key, 'up')) newKeys.up = false;
        if (isKeyForDirection(key, 'down')) newKeys.down = false;
        if (isKeyForDirection(key, 'left')) newKeys.left = false;
        if (isKeyForDirection(key, 'right')) newKeys.right = false;
        if (key === ' ') newKeys.space = false;
        
        return newKeys;
      });
    };

    // Fonction pour réinitialiser les touches si nécessaire
    const handleWindowBlur = () => {
      setKeys({ up: false, down: false, left: false, right: false, space: false });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [gameState, isVictory, playerHp, isKeyForDirection]);

  return {
    keys,
    setKeys
  };
};