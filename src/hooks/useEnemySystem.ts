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
        
        const maxFrames = enemy.type === 'treant' || enemy.type === 'devil' ? 6 : 3; // 6 frames de marche pour tréants et diables
        return {
          ...enemy,
          currentFrame: (enemy.currentFrame + 1) % maxFrames
        };
      }));
    }, 200);

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
        speed: 0.4, // Vitesse réduite comme demandé
        damage: 1,
        spawnTime: Date.now()
      };
      
      setProjectiles(prev => [...prev, newProjectile]);
      projectilesRef.current = [...projectilesRef.current, newProjectile];
    }
  };

  // Animation d'attaque des ennemis
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const enemyAttackAnimationInterval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy.isAttacking || !enemy.hasSpawned) return enemy;
        
        const maxAttackFrames = enemy.type === 'treant' ? 7 : enemy.type === 'devil' ? 6 : 4; // Différents nombres de frames selon le type
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
        const impactFrame = enemy.type === 'treant' ? 4 : enemy.type === 'devil' ? 3 : 3; // Frame d'impact pour chaque type
        if (nextFrame === impactFrame) {
          if (enemy.type === 'devil') {
            // Créer un projectile pour les diables
            createProjectile(enemy);
          } else {
            // Vérifier les dégâts pour les autres types
            checkEnemyAttackHit(enemy);
          }
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
        
        // Déterminer le nombre maximum de frames selon le type d'ennemi
        let maxDeathFrames;
        if (enemy.type === 'devil') {
          maxDeathFrames = 10; // 10 frames pour le diable
        } else if (enemy.type === 'treant') {
          maxDeathFrames = 6; // 6 frames pour le tréant
        } else {
          maxDeathFrames = 9; // 9 frames pour le champignon
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
        } else if (enemy.type === 'devil') {
          const currentPlayerPos = playerPositionRef.current;
          
          const deltaX = currentPlayerPos.x - enemy.x;
          const deltaY = currentPlayerPos.y - enemy.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // Diables ont une portée d'attaque moyenne et s'arrêtent pour tirer
          const attackDistance = 30; // Portée d'attaque
          const stopDistance = 30; // Distance à laquelle ils s'arrêtent pour tirer
          const currentTime = Date.now();
          
          if (distance <= attackDistance && currentTime - enemy.lastAttackTime > 3000) {
            shouldAttack = true;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newDirection = deltaX > 0 ? 3 : 2;
            } else {
              newDirection = deltaY > 0 ? 0 : 1;
            }
          } else if (distance > stopDistance && !shouldAttack) {
            const moveX = (deltaX / distance) * speed;
            const moveY = (deltaY / distance) * speed;
            
            // Limites de mouvement en pourcentages
            const topLimit = 35;
            const bottomLimit = 90;
            const leftLimit = 5;
            const rightLimit = 95;
            
            const potentialX = Math.max(leftLimit, Math.min(rightLimit, enemy.x + moveX));
            const potentialY = Math.max(topLimit, Math.min(bottomLimit, enemy.y + moveY));
            
            newX = potentialX;
            newY = potentialY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newDirection = deltaX > 0 ? 3 : 2;
            } else {
              newDirection = deltaY > 0 ? 0 : 1;
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
      
      // Appeler la fonction de dégâts avec le bon montant
      onPlayerDamage(damage);
      
      // Mettre à jour le cooldown pour cet ennemi spécifique
      enemyDamageCooldowns.current[enemy.id] = currentTime;
    }
  };

  // Mouvement des projectiles et collision avec le joueur
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const projectileInterval = setInterval(() => {
      setProjectiles(prev => {
        const currentTime = Date.now();
        const updatedProjectiles = prev.map(projectile => {
          // Mouvement du projectile
          const newX = projectile.x + projectile.directionX * projectile.speed;
          const newY = projectile.y + projectile.directionY * projectile.speed;
          
          // Vérifier collision avec le joueur
          const currentPlayerPos = playerPositionRef.current;
          const deltaX = currentPlayerPos.x - newX;
          const deltaY = currentPlayerPos.y - newY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          if (distance < 3) {
            // Projectile touche le joueur
            onPlayerDamage(projectile.damage); // Utiliser les dégâts du projectile
            return null; // Supprimer le projectile
          }
          
          // Vérifier si le projectile est sorti de l'écran
          if (newX < 0 || newX > 100 || newY < 0 || newY > 100) {
            return null; // Supprimer le projectile
          }
          
          // Vérifier la durée de vie du projectile (10 secondes)
          if (currentTime - projectile.spawnTime > 10000) {
            return null; // Supprimer le projectile
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
    }, 8); // Fréquence doublée pour un mouvement plus fluide

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