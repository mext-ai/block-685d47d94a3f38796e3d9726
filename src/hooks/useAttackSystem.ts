import { useState, useEffect, useCallback } from 'react';
import { Position } from '../types';
import { checkCollision } from '../utils/gameUtils';

export const useAttackSystem = (
  keys: { space: boolean },
  position: Position,
  direction: number,
  enemiesRef: React.MutableRefObject<any[]>,
  setEnemies: (enemies: any[]) => void,
  playerHp: number,
  gameState: string
) => {
  const [isAttacking, setIsAttacking] = useState(false);

  const performAttack = useCallback(() => {
    if (isAttacking || gameState !== 'playing' || playerHp <= 0) return;

    setIsAttacking(true);
    
    // Calculer la zone d'attaque basée sur la direction
    const attackRange = 4;
    let attackPos = { ...position };
    
    switch (direction) {
      case 0: // Bas
        attackPos.y += attackRange;
        break;
      case 1: // Haut
        attackPos.y -= attackRange;
        break;
      case 2: // Gauche
        attackPos.x -= attackRange;
        break;
      case 3: // Droite
        attackPos.x += attackRange;
        break;
    }

    // Vérifier les collisions avec les ennemis
    const updatedEnemies = enemiesRef.current.map(enemy => {
      if (enemy.isAlive && !enemy.isDying && 
          checkCollision(attackPos, { x: enemy.x, y: enemy.y }, 3)) {
        return {
          ...enemy,
          hp: enemy.hp - 1,
          isAlive: enemy.hp - 1 > 0,
          isDying: enemy.hp - 1 <= 0
        };
      }
      return enemy;
    });

    enemiesRef.current = updatedEnemies;
    setEnemies(updatedEnemies);

    // Fin de l'attaque après 300ms
    setTimeout(() => {
      setIsAttacking(false);
    }, 300);
  }, [isAttacking, gameState, playerHp, position, direction, enemiesRef, setEnemies]);

  // Gestion de l'attaque avec la barre d'espace
  useEffect(() => {
    if (keys.space) {
      performAttack();
    }
  }, [keys.space, performAttack]);

  return {
    isAttacking,
    performAttack
  };
};