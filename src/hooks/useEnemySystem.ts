import { useState, useEffect, useRef, useCallback } from 'react';
import { Position } from '../types';
import { checkCollision } from '../utils/gameUtils';

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

export const useEnemySystem = (
  playerPosition: Position,
  gameState: string,
  mapWidth: number,
  mapHeight: number,
  onPlayerDamage: () => void
) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const lastSpawnTime = useRef(0);

  // Spawner des ennemis
  const spawnEnemy = useCallback(() => {
    const now = Date.now();
    if (now - lastSpawnTime.current < 3000) return; // Spawn toutes les 3 secondes

    const newEnemy: Enemy = {
      id: Date.now(),
      x: Math.random() * mapWidth,
      y: Math.random() * mapHeight,
      hp: 2,
      isAlive: true,
      isDying: false,
      lastMoveTime: now,
      direction: Math.floor(Math.random() * 4)
    };

    // S'assurer que l'ennemi ne spawn pas trop près du joueur
    const distance = Math.sqrt(
      Math.pow(newEnemy.x - playerPosition.x, 2) + 
      Math.pow(newEnemy.y - playerPosition.y, 2)
    );

    if (distance > 10) {
      setEnemies(prev => [...prev, newEnemy]);
      enemiesRef.current = [...enemiesRef.current, newEnemy];
      lastSpawnTime.current = now;
    }
  }, [playerPosition, mapWidth, mapHeight]);

  // Déplacer les ennemis vers le joueur
  const moveEnemies = useCallback(() => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    const updatedEnemies = enemiesRef.current.map(enemy => {
      if (!enemy.isAlive || enemy.isDying) return enemy;
      if (now - enemy.lastMoveTime < 500) return enemy; // Déplacement toutes les 500ms

      const dx = playerPosition.x - enemy.x;
      const dy = playerPosition.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.5) {
        const moveSpeed = 1;
        const newX = enemy.x + (dx / distance) * moveSpeed;
        const newY = enemy.y + (dy / distance) * moveSpeed;

        // Garder l'ennemi dans les limites de la carte
        const clampedX = Math.max(0, Math.min(mapWidth, newX));
        const clampedY = Math.max(0, Math.min(mapHeight, newY));

        return {
          ...enemy,
          x: clampedX,
          y: clampedY,
          lastMoveTime: now
        };
      }

      return enemy;
    });

    enemiesRef.current = updatedEnemies;
    setEnemies(updatedEnemies);
  }, [gameState, playerPosition, mapWidth, mapHeight]);

  // Vérifier les collisions avec le joueur
  const checkPlayerCollisions = useCallback(() => {
    if (gameState !== 'playing') return;

    enemiesRef.current.forEach(enemy => {
      if (enemy.isAlive && !enemy.isDying && 
          checkCollision(playerPosition, { x: enemy.x, y: enemy.y }, 2)) {
        onPlayerDamage();
      }
    });
  }, [gameState, playerPosition, onPlayerDamage]);

  // Nettoyer les ennemis morts
  const cleanupEnemies = useCallback(() => {
    const aliveEnemies = enemiesRef.current.filter(enemy => 
      enemy.isAlive || (enemy.isDying && Date.now() - enemy.lastMoveTime < 1000)
    );
    
    if (aliveEnemies.length !== enemiesRef.current.length) {
      enemiesRef.current = aliveEnemies;
      setEnemies(aliveEnemies);
    }
  }, []);

  // Game loop pour les ennemis
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      spawnEnemy();
      moveEnemies();
      checkPlayerCollisions();
      cleanupEnemies();
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, spawnEnemy, moveEnemies, checkPlayerCollisions, cleanupEnemies]);

  // Reset des ennemis quand le jeu redémarre
  useEffect(() => {
    if (gameState === 'menu' || gameState === 'gameover') {
      setEnemies([]);
      enemiesRef.current = [];
      lastSpawnTime.current = 0;
    }
  }, [gameState]);

  return {
    enemies,
    setEnemies,
    enemiesRef
  };
};