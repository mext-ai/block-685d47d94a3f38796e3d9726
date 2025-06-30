import { useState, useRef } from 'react';
import { Enemy } from '../types';

export const useEnemies = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [enemyDamageCooldowns, setEnemyDamageCooldowns] = useState<{[key: number]: number}>({});
  
  const enemiesRef = useRef<Enemy[]>([]);
  const enemiesInitialized = useRef(false);
  const enemyDamageCooldownsRef = useRef<{[key: number]: number}>({});

  const createLevel1Enemies = (): Enemy[] => {
    return [
      { id: 1, type: 'mushroom', x: 20, y: 30, direction: 0, currentFrame: 0, isAlive: true, hp: 3, maxHp: 3, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 0, hasSpawned: true },
      { id: 2, type: 'mushroom', x: 80, y: 70, direction: 0, currentFrame: 0, isAlive: true, hp: 3, maxHp: 3, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 2000, hasSpawned: false },
      { id: 3, type: 'mushroom', x: 60, y: 40, direction: 0, currentFrame: 0, isAlive: true, hp: 3, maxHp: 3, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 4000, hasSpawned: false },
      { id: 4, type: 'mushroom', x: 40, y: 80, direction: 0, currentFrame: 0, isAlive: true, hp: 3, maxHp: 3, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 6000, hasSpawned: false },
      { id: 5, type: 'mushroom', x: 90, y: 20, direction: 0, currentFrame: 0, isAlive: true, hp: 3, maxHp: 3, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 8000, hasSpawned: false }
    ];
  };

  const createLevel2Enemies = (): Enemy[] => {
    return [
      { id: 1, type: 'mushroom', x: 15, y: 25, direction: 0, currentFrame: 0, isAlive: true, hp: 4, maxHp: 4, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 0, hasSpawned: true },
      { id: 2, type: 'mushroom', x: 85, y: 75, direction: 0, currentFrame: 0, isAlive: true, hp: 4, maxHp: 4, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 1500, hasSpawned: false },
      { id: 3, type: 'treant', x: 50, y: 50, direction: 0, currentFrame: 0, isAlive: true, hp: 8, maxHp: 8, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 3000, hasSpawned: false },
      { id: 4, type: 'mushroom', x: 30, y: 85, direction: 0, currentFrame: 0, isAlive: true, hp: 4, maxHp: 4, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 4500, hasSpawned: false },
      { id: 5, type: 'mushroom', x: 70, y: 15, direction: 0, currentFrame: 0, isAlive: true, hp: 4, maxHp: 4, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 6000, hasSpawned: false },
      { id: 6, type: 'treant', x: 25, y: 60, direction: 0, currentFrame: 0, isAlive: true, hp: 8, maxHp: 8, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 7500, hasSpawned: false },
      { id: 7, type: 'mushroom', x: 75, y: 90, direction: 0, currentFrame: 0, isAlive: true, hp: 4, maxHp: 4, isDying: false, deathFrame: 0, isAttacking: false, attackFrame: 0, lastAttackTime: 0, spawnTime: 9000, hasSpawned: false }
    ];
  };

  const resetEnemies = () => {
    setEnemies([]);
    setEnemyDamageCooldowns({});
    enemiesRef.current = [];
    enemiesInitialized.current = false;
    enemyDamageCooldownsRef.current = {};
  };

  const getRemainingEnemies = () => {
    return enemies.filter((enemy: Enemy) => enemy.isAlive && enemy.hasSpawned).length;
  };

  return {
    enemies,
    enemyDamageCooldowns,
    enemiesRef,
    enemiesInitialized,
    enemyDamageCooldownsRef,
    setEnemies,
    setEnemyDamageCooldowns,
    createLevel1Enemies,
    createLevel2Enemies,
    resetEnemies,
    getRemainingEnemies
  };
}; 