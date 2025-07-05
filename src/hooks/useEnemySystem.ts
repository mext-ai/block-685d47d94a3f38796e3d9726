import { useState, useEffect, useRef, useCallback } from 'react';
import { Position, Enemy, Projectile } from '../types';
import { checkCollision } from '../utils/gameUtils';
import { createEnemiesForLevel } from '../utils/enemyUtils';

export const useEnemySystem = (
  playerPosition: Position,
  gameState: string,
  mapWidth: number,
  mapHeight: number,
  level: number,
  onPlayerDamage: (damage?: number) => void
) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const gameStartTime = useRef<number>(0);
  const enemyDamageCooldowns = useRef<{[key: number]: number}>({});
  const playerPositionRef = useRef<Position>(playerPosition);

  // Fonction de collision entre deux entités
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
    if (gameState === 'playing') {
      gameStartTime.current = Date.now();
      const levelEnemies = createEnemiesForLevel(level);
      
      setEnemies(levelEnemies);
      enemiesRef.current = levelEnemies;
    }
  }, [gameState, level]);

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
        
        const maxFrames = enemy.type === 'treant' || enemy.type === 'devil' || enemy.type === 'goblin' ? 6 : 3;
        return {
          ...enemy,
          currentFrame: (enemy.currentFrame + 1) % maxFrames
        };
      }));
    }, 250);

    return () => clearInterval(enemyAnimationInterval);
  }, [gameState]);

  // Fonction pour créer un projectile
  const createProjectile = (enemy: Enemy) => {
    const currentPlayerPos = playerPositionRef.current;
    const deltaX = currentPlayerPos.x - enemy.x;
    const deltaY = currentPlayerPos.y - enemy.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > 0) {
      const directionX = deltaX / distance;
      const directionY = deltaY / distance;
      
      const newProjectile: Projectile = {
        id: Date.now() + Math.random(),
        x: enemy.x,
        y: enemy.y,
        directionX,
        directionY,
        speed: 0.4,
        damage: 1,
        spawnTime: Date.now()
      };
      
      setProjectiles(prev => [...prev, newProjectile]);
      projectilesRef.current = [...projectilesRef.current, newProjectile];
    }
  };

  // CORRECTION : Animation d'attaque avec direction fixée
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyAttackAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAttacking || !enemy.hasSpawned) return enemy;
        
        const maxAttackFrames = enemy.type === 'treant' ? 7 : enemy.type === 'devil' ? 6 : enemy.type === 'goblin' ? 6 : 4;
        
        // CORRECTION CRITIQUE : Toujours utiliser un entier pour éviter le glissement
        const nextFrame = Math.floor(enemy.attackFrame) + 1;
        
        if (nextFrame >= maxAttackFrames) {
          return {
            ...enemy,
            isAttacking: false,
            attackFrame: 0,
            lastAttackTime: Date.now()
          };
        }
        
        // Infliger des dégâts seulement à la frame d'impact spécifique
        const impactFrame = enemy.type === 'treant' ? 4 : enemy.type === 'devil' ? 3 : enemy.type === 'goblin' ? 3 : 3;
        if (nextFrame === impactFrame) {
          if (enemy.type === 'devil') {
            createProjectile(enemy);
          } else {
            checkEnemyAttackHit(enemy);
          }
        }
        
        return {
          ...enemy,
          attackFrame: nextFrame
        };
      }));
    }, 120);

    return () => clearInterval(enemyAttackAnimationInterval);
  }, [gameState]);

  // Animation de mort des ennemis
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyDeathAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isDying || !enemy.hasSpawned) return enemy;
        
        const nextFrame = enemy.deathFrame + 1;
        
        let maxDeathFrames;
        if (enemy.type === 'devil') {
          maxDeathFrames = 10;
        } else if (enemy.type === 'treant') {
          maxDeathFrames = 6;
        } else if (enemy.type === 'goblin') {
          maxDeathFrames = 6;
        } else {
          maxDeathFrames = 9;
        }
        
        if (nextFrame >= maxDeathFrames) {
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

  // CORRECTION : Mouvement des ennemis avec direction correcte lors de l'attaque
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyMovementInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAlive || enemy.isDying || enemy.isAttacking || !enemy.hasSpawned) return enemy;
        
        let newX = enemy.x;
        let newY = enemy.y;
        let newDirection = enemy.direction;
        let shouldAttack = false;
        
        let speed = 0.25;
        if (enemy.type === 'goblin') {
          speed = 0.375;
        } else if (enemy.type === 'treant') {
          speed = 0.15;
        } else if (enemy.type === 'devil') {
          speed = 0.3;
        }
        
        const currentPlayerPos = playerPositionRef.current;
        const deltaX = currentPlayerPos.x - enemy.x;
        const deltaY = currentPlayerPos.y - enemy.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // CORRECTION : Fonction pour calculer la direction correcte vers le joueur
        const calculateDirectionToPlayer = (dx: number, dy: number) => {
          if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 3 : 2; // Droite ou gauche
          } else {
            return dy > 0 ? 0 : 1; // Bas ou haut
          }
        };
        
        if (enemy.type === 'mushroom' || enemy.type === 'treant') {
          const attackDistance = enemy.type === 'treant' ? 12 : 4;
          const collisionDistance = 3;
          const currentTime = Date.now();
          const attackCooldown = enemy.type === 'treant' ? 3000 : 2000;
          
          if (distance <= attackDistance && currentTime - enemy.lastAttackTime > attackCooldown) {
            shouldAttack = true;
            newDirection = calculateDirectionToPlayer(deltaX, deltaY);
          } else if (distance > collisionDistance) {
            const moveX = (deltaX / distance) * speed;
            const moveY = (deltaY / distance) * speed;
            
            const topLimit = 35;
            const bottomLimit = 90;
            const leftLimit = 5;
            const rightLimit = 95;
            
            const potentialX = Math.max(leftLimit, Math.min(rightLimit, enemy.x + moveX));
            const potentialY = Math.max(topLimit, Math.min(bottomLimit, enemy.y + moveY));
            
            if (!checkCollision({x: potentialX, y: potentialY}, currentPlayerPos, collisionDistance)) {
              newX = potentialX;
              newY = potentialY;
              newDirection = calculateDirectionToPlayer(deltaX, deltaY);
            }
          }
        } else if (enemy.type === 'goblin') {
          const attackDistance = 5;
          const stopDistance = 5;
          const currentTime = Date.now();
          
          if (distance <= attackDistance && currentTime - enemy.lastAttackTime > 1500) {
            shouldAttack = true;
            // CORRECTION CRITIQUE : Bien s'orienter vers le joueur lors de l'attaque
            newDirection = calculateDirectionToPlayer(deltaX, deltaY);
          } else if (distance > stopDistance) {
            const moveX = (deltaX / distance) * speed;
            const moveY = (deltaY / distance) * speed;
            
            const topLimit = 35;
            const bottomLimit = 90;
            const leftLimit = 5;
            const rightLimit = 95;
            
            const potentialX = Math.max(leftLimit, Math.min(rightLimit, enemy.x + moveX));
            const potentialY = Math.max(topLimit, Math.min(bottomLimit, enemy.y + moveY));
            
            newX = potentialX;
            newY = potentialY;
            newDirection = calculateDirectionToPlayer(deltaX, deltaY);
          }
        } else if (enemy.type === 'devil') {
          const attackDistance = 30;
          const stopDistance = 30;
          const currentTime = Date.now();
          
          if (distance <= attackDistance && currentTime - enemy.lastAttackTime > 3000) {
            shouldAttack = true;
            newDirection = calculateDirectionToPlayer(deltaX, deltaY);
          } else if (distance > stopDistance) {
            const moveX = (deltaX / distance) * speed;
            const moveY = (deltaY / distance) * speed;
            
            const topLimit = 35;
            const bottomLimit = 90;
            const leftLimit = 5;
            const rightLimit = 95;
            
            const potentialX = Math.max(leftLimit, Math.min(rightLimit, enemy.x + moveX));
            const potentialY = Math.max(topLimit, Math.min(bottomLimit, enemy.y + moveY));
            
            newX = potentialX;
            newY = potentialY;
            newDirection = calculateDirectionToPlayer(deltaX, deltaY);
          }
        }
        
        // CORRECTION : Quand l'ennemi attaque, il garde sa position mais se tourne vers le joueur
        if (shouldAttack) {
          return {
            ...enemy,
            direction: newDirection, // Direction mise à jour pour l'attaque
            isAttacking: true,
            attackFrame: 0, // CORRECTION : Commencer à 0 pour éviter le glissement
            lastAttackTime: Date.now()
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
    
    const lastDamageFromThisEnemy = enemyDamageCooldowns.current[enemy.id] || 0;
    if (currentTime - lastDamageFromThisEnemy < 1000) return;
    
    const currentPlayerPos = playerPositionRef.current;
    const deltaX = currentPlayerPos.x - enemy.x;
    const deltaY = currentPlayerPos.y - enemy.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (enemy.type === 'treant') {
      const maxAttackRange = 12;
      const attackWidth = 4;
      
      if (distance > maxAttackRange) return;
      
      let attackDirectionX = 0;
      let attackDirectionY = 0;
      
      switch (enemy.direction) {
        case 0: // Vers le bas
          attackDirectionX = 0;
          attackDirectionY = 1;
          break;
        case 1: // Vers le haut
          attackDirectionX = 0;
          attackDirectionY = -1;
          break;
        case 2: // Vers la gauche
          attackDirectionX = -1;
          attackDirectionY = 0;
          break;
        case 3: // Vers la droite
          attackDirectionX = 1;
          attackDirectionY = 0;
          break;
      }
      
      const directionToPlayer = {
        x: deltaX / distance,
        y: deltaY / distance
      };
      
      const dotProduct = attackDirectionX * directionToPlayer.x + attackDirectionY * directionToPlayer.y;
      const minAlignment = 0.5;
      
      if (dotProduct > minAlignment) {
        const perpendicularDistance = Math.abs(
          -attackDirectionY * deltaX + attackDirectionX * deltaY
        );
        
        if (perpendicularDistance <= attackWidth) {
          onPlayerDamage(2);
          enemyDamageCooldowns.current[enemy.id] = currentTime;
        }
      }
    } else if (enemy.type === 'goblin') {
      const attackRange = 5;
      if (distance <= attackRange) {
        const damage = 1;
        onPlayerDamage(damage);
        enemyDamageCooldowns.current[enemy.id] = currentTime;
      }
    } else {
      const attackRange = 6;
      if (distance <= attackRange) {
        const damage = 1;
        onPlayerDamage(damage);
        enemyDamageCooldowns.current[enemy.id] = currentTime;
      }
    }
  };

  // Mouvement des projectiles et collision avec le joueur
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const projectileInterval = setInterval(() => {
      setProjectiles(prev => {
        const currentTime = Date.now();
        const updatedProjectiles = prev.map(projectile => {
          const newX = projectile.x + projectile.directionX * projectile.speed;
          const newY = projectile.y + projectile.directionY * projectile.speed;
          
          const currentPlayerPos = playerPositionRef.current;
          const deltaX = currentPlayerPos.x - newX;
          const deltaY = currentPlayerPos.y - newY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          if (distance < 3) {
            onPlayerDamage(projectile.damage);
            return null;
          }
          
          if (newX < 0 || newX > 100 || newY < 0 || newY > 100) {
            return null;
          }
          
          if (currentTime - projectile.spawnTime > 10000) {
            return null;
          }
          
          return {
            ...projectile,
            x: newX,
            y: newY
          };
        }).filter(Boolean) as Projectile[];
        
        projectilesRef.current = updatedProjectiles;
        return updatedProjectiles;
      });
    }, 8);

    return () => clearInterval(projectileInterval);
  }, [gameState, onPlayerDamage]);

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
    projectiles,
    setProjectiles,
    projectilesRef,
    updatePlayerPosition
  };
};