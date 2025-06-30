import { useState, useEffect, useRef, useCallback } from 'react';
import { Position } from '../types';
import { checkCollision } from '../utils/gameUtils';

interface Bullet {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  createdAt: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  isAlive: boolean;
  isDying: boolean;
  lastMoveTime: number;
  direction: number;
}

export const useBulletSystem = (
  gameState: string,
  mapWidth: number,
  mapHeight: number,
  enemies: Enemy[],
  setEnemies: (enemies: Enemy[]) => void,
  enemiesRef: React.MutableRefObject<Enemy[]>
) => {
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);

  // Tirer une balle
  const shootBullet = useCallback((startPos: Position, targetPos: Position) => {
    if (gameState !== 'playing') return;

    const dx = targetPos.x - startPos.x;
    const dy = targetPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const speed = 15;
    const velocityX = (dx / distance) * speed;
    const velocityY = (dy / distance) * speed;

    const newBullet: Bullet = {
      id: Date.now() + Math.random(),
      x: startPos.x,
      y: startPos.y,
      velocityX,
      velocityY,
      createdAt: Date.now()
    };

    setBullets(prev => [...prev, newBullet]);
    bulletsRef.current = [...bulletsRef.current, newBullet];
  }, [gameState]);

  // Déplacer les balles
  const moveBullets = useCallback(() => {
    if (gameState !== 'playing') return;

    const updatedBullets = bulletsRef.current.map(bullet => ({
      ...bullet,
      x: bullet.x + bullet.velocityX * 0.1,
      y: bullet.y + bullet.velocityY * 0.1
    })).filter(bullet => {
      // Garder les balles dans les limites et pas trop anciennes
      const isInBounds = bullet.x >= 0 && bullet.x <= mapWidth && 
                        bullet.y >= 0 && bullet.y <= mapHeight;
      const isNotTooOld = Date.now() - bullet.createdAt < 3000;
      
      return isInBounds && isNotTooOld;
    });

    bulletsRef.current = updatedBullets;
    setBullets(updatedBullets);
  }, [gameState, mapWidth, mapHeight]);

  // Vérifier les collisions balles-ennemis
  const checkBulletCollisions = useCallback(() => {
    if (gameState !== 'playing') return;

    let bulletsToRemove: number[] = [];
    let enemiesToUpdate: Enemy[] = [...enemiesRef.current];

    bulletsRef.current.forEach(bullet => {
      enemiesToUpdate.forEach((enemy, enemyIndex) => {
        if (enemy.isAlive && !enemy.isDying && 
            checkCollision({ x: bullet.x, y: bullet.y }, { x: enemy.x, y: enemy.y }, 1.5)) {
          
          // La balle touche l'ennemi
          bulletsToRemove.push(bullet.id);
          
          // Réduire les HP de l'ennemi
          enemiesToUpdate[enemyIndex] = {
            ...enemy,
            hp: enemy.hp - 1
          };

          // Si l'ennemi meurt
          if (enemiesToUpdate[enemyIndex].hp <= 0) {
            enemiesToUpdate[enemyIndex] = {
              ...enemiesToUpdate[enemyIndex],
              isAlive: false,
              isDying: true,
              lastMoveTime: Date.now()
            };
          }
        }
      });
    });

    // Supprimer les balles qui ont touché
    if (bulletsToRemove.length > 0) {
      const remainingBullets = bulletsRef.current.filter(
        bullet => !bulletsToRemove.includes(bullet.id)
      );
      bulletsRef.current = remainingBullets;
      setBullets(remainingBullets);
    }

    // Mettre à jour les ennemis
    if (enemiesToUpdate.some((enemy, index) => 
        enemy.hp !== enemiesRef.current[index]?.hp || 
        enemy.isAlive !== enemiesRef.current[index]?.isAlive)) {
      enemiesRef.current = enemiesToUpdate;
      setEnemies(enemiesToUpdate);
    }
  }, [gameState, enemiesRef, setEnemies]);

  // Game loop pour les balles
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      moveBullets();
      checkBulletCollisions();
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [gameState, moveBullets, checkBulletCollisions]);

  // Reset des balles quand le jeu redémarre
  useEffect(() => {
    if (gameState === 'menu' || gameState === 'gameover') {
      setBullets([]);
      bulletsRef.current = [];
    }
  }, [gameState]);

  return {
    bullets,
    shootBullet
  };
};