import { useState, useEffect, useRef, useCallback } from 'react';
import { Position, Enemy } from '../types';
import { checkCollision } from '../utils/gameUtils';
import { createEnemiesForLevel } from '../utils/enemyUtils';

export const useEnemySystem = (
  playerPosition: Position,
  gameState: string,
  mapWidth: number,
  mapHeight: number,
  level: number,
  onPlayerDamage: () => void
) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const gameStartTime = useRef<number>(0);
  const enemyDamageCooldowns = useRef<{[key: number]: number}>({}); // Cooldown par ennemi
  const playerPositionRef = useRef<Position>(playerPosition); // Référence à la position du joueur

  // Fonction de collision entre deux entités (comme dans l'original)
  const checkCollision = (pos1: {x: number, y: number}, pos2: {x: number, y: number}, minDistance: number = 3) => {
    const deltaX = pos1.x - pos2.x;
    const deltaY = pos1.y - pos2.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance < minDistance;
  };

  // Mettre à jour la référence de la position du joueur
  useEffect(() => {
    playerPositionRef.current = playerPosition;
  }, [playerPosition]);

  // Initialiser les ennemis au début du jeu
  useEffect(() => {
    if (gameState === 'playing' && enemies.length === 0) {
      gameStartTime.current = Date.now();
      const levelEnemies = createEnemiesForLevel(level);
      

      
      setEnemies(levelEnemies);
      enemiesRef.current = levelEnemies;
    }
  }, [gameState, level, enemies.length]);

  // Système d'apparition progressive des ennemis
  useEffect(() => {
    if (gameState !== 'playing' || gameStartTime.current === 0) return;
    
    const spawnCheckInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - gameStartTime.current;
      
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.hasSpawned && elapsedTime >= enemy.spawnTime) {
          return { ...enemy, hasSpawned: true };
        }
        return enemy;
      }));
    }, 100);

    return () => clearInterval(spawnCheckInterval);
  }, [gameState]);

  // Animation des ennemis (marche normale)
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (enemy.isDying || !enemy.isAlive || enemy.isAttacking || !enemy.hasSpawned) return enemy;
        
        const maxFrames = enemy.type === 'treant' ? 6 : 3; // 6 frames de marche pour tréants
        return {
          ...enemy,
          currentFrame: (enemy.currentFrame + 1) % maxFrames
        };
      }));
    }, 200);

    return () => clearInterval(enemyAnimationInterval);
  }, [gameState]);

  // Animation d'attaque des ennemis
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyAttackAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAttacking || !enemy.hasSpawned) return enemy;
        
        const maxAttackFrames = enemy.type === 'treant' ? 7 : 4; // Différents nombres de frames selon le type
        const nextFrame = enemy.attackFrame + 1;
        
        if (nextFrame >= maxAttackFrames) {
          return {
            ...enemy,
            isAttacking: false,
            attackFrame: 0,
            lastAttackTime: Date.now()
          };
        }
        
        // Infliger des dégâts seulement à la frame d'impact spécifique
        const impactFrame = enemy.type === 'treant' ? 4 : 3; // Frame d'impact pour chaque type
        if (nextFrame === impactFrame) {
          checkEnemyAttackHit(enemy);
        }
        
        return {
          ...enemy,
          attackFrame: nextFrame
        };
      }));
    }, 100);

    return () => clearInterval(enemyAttackAnimationInterval);
  }, [gameState]);

  // Animation de mort des ennemis
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyDeathAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isDying || !enemy.hasSpawned) return enemy;
        
        const nextFrame = enemy.deathFrame + 1;
        
        if (nextFrame >= 4) {
          return { ...enemy, isAlive: false, isDying: false };
        }
        
        return {
          ...enemy,
          deathFrame: nextFrame
        };
      }));
    }, 150);

    return () => clearInterval(enemyDeathAnimationInterval);
  }, [gameState]);

  // Mouvement des ennemis avec collision et IA d'attaque
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyMovementInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        // Ne pas bouger les ennemis qui ne sont pas encore apparus
        if (!enemy.isAlive || enemy.isDying || enemy.isAttacking || !enemy.hasSpawned) return enemy;
        
        let newX = enemy.x;
        let newY = enemy.y;
        let newDirection = enemy.direction;
        let shouldAttack = false;
        const speed = 0.25; // Même vitesse pour tous les ennemis (comme dans l'original)
        
        if (enemy.type === 'mushroom' || enemy.type === 'treant') {
          const currentPlayerPos = playerPositionRef.current;
          
          const deltaX = currentPlayerPos.x - enemy.x;
          const deltaY = currentPlayerPos.y - enemy.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // Tréants ont une plus longue portée d'attaque
          const attackDistance = enemy.type === 'treant' ? 12 : 4;
          const collisionDistance = 3;
          const currentTime = Date.now();
          
          if (distance <= attackDistance && currentTime - enemy.lastAttackTime > 2000) {
            shouldAttack = true;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newDirection = deltaX > 0 ? 3 : 2;
            } else {
              newDirection = deltaY > 0 ? 0 : 1;
            }
          } else if (distance > collisionDistance && !shouldAttack) {
            const moveX = (deltaX / distance) * speed;
            const moveY = (deltaY / distance) * speed;
            
            // Limites de mouvement en pourcentages (comme dans l'original)
            const topLimit = 35;
            const bottomLimit = 90;
            const leftLimit = 5;
            const rightLimit = 95;
            
            const potentialX = Math.max(leftLimit, Math.min(rightLimit, enemy.x + moveX));
            const potentialY = Math.max(topLimit, Math.min(bottomLimit, enemy.y + moveY));
            
            if (!checkCollision({x: potentialX, y: potentialY}, currentPlayerPos, collisionDistance)) {
              newX = potentialX;
              newY = potentialY;
              
              if (Math.abs(deltaX) > Math.abs(deltaY)) {
                newDirection = deltaX > 0 ? 3 : 2;
              } else {
                newDirection = deltaY > 0 ? 0 : 1;
              }
            }
          }
        }
        
        if (shouldAttack) {
          return {
            ...enemy,
            x: newX,
            y: newY,
            direction: newDirection,
            isAttacking: true,
            attackFrame: 0
          };
        }
        
        return {
          ...enemy,
          x: newX,
          y: newY,
          direction: newDirection
        };
      }));
    }, 16);

    return () => clearInterval(enemyMovementInterval);
  }, [gameState]);

  // Fonction pour vérifier les dégâts de l'ennemi au joueur
  const checkEnemyAttackHit = (enemy: Enemy) => {
    const currentTime = Date.now();
    
    // Vérifier le cooldown spécifique à cet ennemi
    const lastDamageFromThisEnemy = enemyDamageCooldowns.current[enemy.id] || 0;
    if (currentTime - lastDamageFromThisEnemy < 1000) return; // 1 seconde de cooldown par ennemi
    
    const currentPlayerPos = playerPositionRef.current;
    const deltaX = currentPlayerPos.x - enemy.x;
    const deltaY = currentPlayerPos.y - enemy.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Différentes portées selon le type d'ennemi
    const attackRange = enemy.type === 'treant' ? 12 : 6;
    if (distance <= attackRange) {
      // Différents dégâts selon le type d'ennemi
      const damage = enemy.type === 'treant' ? 2 : 1;
      
      // Appeler la fonction de dégâts
      for (let i = 0; i < damage; i++) {
        onPlayerDamage();
      }
      
      // Mettre à jour le cooldown pour cet ennemi spécifique
      enemyDamageCooldowns.current[enemy.id] = currentTime;
    }
  };

  // Nettoyer les ennemis morts
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const cleanupInterval = setInterval(() => {
      setEnemies(prev => prev.filter(enemy => enemy.isAlive));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, [gameState]);

  // Reset des ennemis quand le jeu redémarre
  useEffect(() => {
    if (gameState === 'menu' || gameState === 'gameover') {
      setEnemies([]);
      enemiesRef.current = [];
      gameStartTime.current = 0;
    }
  }, [gameState]);

  // Fonction pour mettre à jour la position du joueur
  const updatePlayerPosition = (newPosition: Position) => {
    playerPositionRef.current = newPosition;
  };

  return {
    enemies,
    setEnemies,
    enemiesRef,
    updatePlayerPosition
  };
};