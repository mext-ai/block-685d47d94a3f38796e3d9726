import { useState, useCallback, useEffect } from 'react';
import { Position } from '../types';

export const useAttackSystem = (
  gameState: string,
  playerPosition: Position,
  playerDirection: number,
  enemies: any[],
  setEnemies: (enemies: any[] | ((prev: any[]) => any[])) => void
) => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackFrame, setAttackFrame] = useState(0);

  // Fonction pour vérifier si l'ennemi est dans l'arc d'attaque de 180°
  const isEnemyInAttackDirection = (playerX: number, playerY: number, enemyX: number, enemyY: number, playerDirection: number) => {
    const deltaX = enemyX - playerX;
    const deltaY = enemyY - playerY;
    
    const angleToEnemy = Math.atan2(deltaY, deltaX);
    
    let baseAngle;
    switch (playerDirection) {
      case 0: baseAngle = Math.PI / 2; break; // Bas
      case 1: baseAngle = -Math.PI / 2; break; // Haut
      case 2: baseAngle = Math.PI; break; // Gauche
      case 3: baseAngle = 0; break; // Droite
      default: return false;
    }
    
    let angleDiff = angleToEnemy - baseAngle;
    
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    const halfArcAngle = Math.PI / 2;
    return Math.abs(angleDiff) <= halfArcAngle;
  };

  // Fonction pour vérifier si l'attaque touche un ennemi
  const checkAttackHit = () => {
    const attackRange = 6;
    
    setEnemies((prev: any[]) => prev.map((enemy: any) => {
      if (!enemy.isAlive || enemy.isDying || !enemy.hasSpawned) return enemy;
      
      const deltaX = playerPosition.x - enemy.x;
      const deltaY = playerPosition.y - enemy.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance <= attackRange && isEnemyInAttackDirection(playerPosition.x, playerPosition.y, enemy.x, enemy.y, playerDirection)) {
        const newHp = enemy.hp - 1;
        
        if (newHp <= 0) {
          return {
            ...enemy,
            hp: 0,
            isDying: true,
            deathFrame: 0
          };
        }
        
        return {
          ...enemy,
          hp: newHp
        };
      }
      
      return enemy;
    }));
  };

  // Animation d'attaque simple (exactement comme dans l'original)
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (isAttacking) {
      setAttackFrame(2);
      
      const step1 = setTimeout(() => {
        setAttackFrame(3);
      }, 120);
      
      const step2 = setTimeout(() => {
        setIsAttacking(false);
        setAttackFrame(0);
        checkAttackHit();
      }, 240);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
      };
    }
  }, [isAttacking, gameState]);

  // Réinitialiser l'état d'attaque si le jeu change d'état
  useEffect(() => {
    if (gameState !== 'playing') {
      setIsAttacking(false);
      setAttackFrame(0);
    }
  }, [gameState]);

  // Fonction pour déclencher une attaque
  const triggerAttack = useCallback(() => {
    if (gameState === 'playing' && !isAttacking) {
      setIsAttacking(true);
    }
  }, [gameState, isAttacking]);

  return {
    isAttacking,
    attackFrame,
    triggerAttack
  };
};