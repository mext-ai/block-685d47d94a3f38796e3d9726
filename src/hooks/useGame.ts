import { useState, useEffect, useRef, useCallback } from 'react';
import { Position, GameState, HeartPickup } from '../types';
import { usePlayerMovement } from './usePlayerMovement';
import { useEnemySystem } from './useEnemySystem';
import { useBulletSystem } from './useBulletSystem';
import { useAttackSystem } from './useAttackSystem';

export const useGame = () => {
    // Configuration du jeu
  const [mapDimensions, setMapDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const PLAYER_SPEED = 0.5; // Vitesse optimisée pour éviter les problèmes de collision
  
  // Fonction de collision entre deux entités
  const checkCollision = (pos1: {x: number, y: number}, pos2: {x: number, y: number}, minDistance: number = 5) => {
    const deltaX = pos1.x - pos2.x;
    const deltaY = pos1.y - pos2.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance < minDistance;
  };
  
  // États du jeu
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [playerHealth, setPlayerHealth] = useState(10);
  const [gameTime, setGameTime] = useState(0);
  const [playerDirection, setPlayerDirection] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]); // Seul le niveau 1 est débloqué au démarrage
  
  // État des coeurs
  const [hearts, setHearts] = useState<HeartPickup[]>([]);
  const heartsRef = useRef<HeartPickup[]>([]);
  const lastHeartSpawnTime = useRef(0);
  const nextHeartId = useRef(1);
  
  // Position initiale du joueur (centre de l'écran en pourcentages)
  const initialPlayerPos: Position = { 
    x: 50, // 50% de la largeur
    y: 50  // 50% de la hauteur
  };

  // Fonction pour générer un coeur à une position aléatoire
  const spawnHeart = useCallback(() => {
    const now = Date.now();
    
    // Générer une position aléatoire dans le périmètre accessible au joueur
    const x = Math.random() * (98 - 2) + 2; // Entre 2% et 98% de la largeur
    const y = Math.random() * (95 - 30) + 30; // Entre 30% et 95% de la hauteur
    
    const newHeart: HeartPickup = {
      id: nextHeartId.current++,
      x,
      y,
      spawnTime: now
    };
    
    setHearts(prev => {
      const updated = [...prev, newHeart];
      heartsRef.current = updated;
      return updated;
    });
    
    lastHeartSpawnTime.current = now;
  }, []);

  // Fonction pour collecter un coeur
  const collectHeart = useCallback((heartId: number) => {
    setHearts(prev => {
      const updated = prev.filter(heart => heart.id !== heartId);
      heartsRef.current = updated;
      return updated;
    });
    
    // Soigner le joueur de 2 HP
    setPlayerHealth(prev => Math.min(10, prev + 2)); // Maximum 10 HP
  }, []);

  // Terminer le jeu
  const endGame = useCallback(() => {
    setGameState('gameover');
  }, []);

  // Gérer les dégâts au joueur
  const takeDamage = useCallback((damage: number = 1) => {
    setPlayerHealth(prev => {
      const newHealth = Math.max(0, prev - damage);
      if (newHealth <= 0) {
        // Laisser le temps à l'animation de mort de se jouer avant de passer à gameover
        setTimeout(() => {
          endGame();
        }, 1500); // 1,5 seconde (à ajuster selon la durée de l'animation)
      }
      return newHealth;
    });
  }, [endGame]);

  // Hook du système d'ennemis
  const { 
    enemies: enemySystemEnemies, 
    setEnemies: setEnemySystemEnemies, 
    enemiesRef: enemySystemRef, 
    projectiles: enemyProjectiles,
    setProjectiles: setEnemyProjectiles,
    projectilesRef: enemyProjectilesRef,
    updatePlayerPosition 
  } = useEnemySystem(
    initialPlayerPos, // Utiliser la position initiale pour l'instant
    gameState,
    mapDimensions.width,
    mapDimensions.height,
    level,
    (damage: number = 1) => takeDamage(damage) // Système de dégâts unifié
  );

  // Position du joueur
  const [playerPosition, setPlayerPosition] = useState<Position>(initialPlayerPos);

  // Fonction pour déplacer le joueur (maintenant gérée par usePlayerMovement avec système de poussée)
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return;
    
    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      const speed = PLAYER_SPEED;
      
      // Mouvement vertical
      if (dy < 0) {
        newY = Math.max(30, prev.y - speed);
      } else if (dy > 0) {
        newY = Math.min(95, prev.y + speed);
      }
      
      // Mouvement horizontal
      if (dx < 0) {
        newX = Math.max(2, prev.x - speed);
      } else if (dx > 0) {
        newX = Math.min(98, prev.x + speed);
      }

      return { x: newX, y: newY };
    });
  }, [gameState]);

  // Fonction pour réinitialiser la position du joueur
  const resetPlayer = useCallback(() => {
    setPlayerPosition(initialPlayerPos);
  }, [initialPlayerPos]);

  // Mettre à jour la position du joueur dans le système d'ennemis
  useEffect(() => {
    updatePlayerPosition(playerPosition);
  }, [playerPosition, updatePlayerPosition]);

  // Mettre à jour la direction du joueur dans le système d'attaque
  useEffect(() => {
    // La direction sera mise à jour via setPlayerDirection depuis block.tsx
  }, [playerDirection]);

  // Hook du système de balles
  const { bullets, shootBullet } = useBulletSystem(
    gameState,
    mapDimensions.width,
    mapDimensions.height,
    enemySystemEnemies,
    setEnemySystemEnemies,
    enemySystemRef
  );

  // Hook du système d'attaque
  const { isAttacking, attackFrame, triggerAttack } = useAttackSystem(
    gameState,
    playerPosition,
    playerDirection,
    enemySystemEnemies,
    setEnemySystemEnemies
  );

  // Logique de spawn des coeurs toutes les 15 secondes
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastHeartSpawnTime.current >= 15000) { // 15 secondes
        spawnHeart();
      }
    }, 1000); // Vérifier chaque seconde

    return () => clearInterval(interval);
  }, [gameState, spawnHeart]);

  // Vérifier les collisions entre le joueur et les coeurs
  useEffect(() => {
    if (gameState !== 'playing') return;

    const playerCollisionRadius = 3; // Rayon de collision du joueur

    heartsRef.current.forEach(heart => {
      if (checkCollision(playerPosition, heart, playerCollisionRadius)) {
        collectHeart(heart.id);
      }
    });
  }, [playerPosition, gameState, collectHeart]);

  // Démarrer le jeu
  const startGame = useCallback((levelNumber: number = 1) => {
    console.log(`Starting game - Level: ${levelNumber}`); // Debug log
    setGameState('playing');
    setScore(0);
    setLevel(levelNumber);
    setPlayerHealth(10);
    setGameTime(0);
    resetPlayer();
    // Nettoyer les ennemis et coeurs avant de démarrer le nouveau niveau
    setEnemySystemEnemies([]);
    enemySystemRef.current = [];
    setHearts([]);
    heartsRef.current = [];
    lastHeartSpawnTime.current = Date.now(); // Réinitialiser le timer des coeurs
    nextHeartId.current = 1;
  }, [resetPlayer, setEnemySystemEnemies, enemySystemRef]);

  // CORRECTION: Supprimer la fonction startNextLevel qui causait le problème
  // Elle n'est plus nécessaire car startGame gère déjà tout

  // Retourner au menu
  const backToMenu = useCallback(() => {
    setGameState('menu');
  }, []);

  // Aller au menu de sélection des niveaux
  const goToLevelSelect = useCallback(() => {
    setGameState('levelSelect');
  }, []);

  // Vérifier si un niveau est débloqué
  const isLevelUnlocked = useCallback((levelNumber: number) => {
    return unlockedLevels.includes(levelNumber);
  }, [unlockedLevels]);

  // Débloquer un niveau
  const unlockLevel = useCallback((levelNumber: number) => {
    console.log(`Unlocking level: ${levelNumber}`); // Debug log
    setUnlockedLevels(prev => {
      if (!prev.includes(levelNumber)) {
        return [...prev, levelNumber];
      }
      return prev;
    });
  }, []);

  // Tirer vers une position
  const handleShoot = useCallback((targetPos: Position) => {
    if (gameState === 'playing') {
      shootBullet(playerPosition, targetPos);
    }
  }, [gameState, playerPosition, shootBullet]);

  // Augmenter le score
  const addScore = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  // Vérifier la victoire (tous les ennemis morts)
  useEffect(() => {
    if (gameState === 'playing' && enemySystemEnemies.length > 0) {
      const aliveEnemies = enemySystemEnemies.filter((enemy: any) => enemy.isAlive || enemy.isDying);
      if (aliveEnemies.length === 0) {
        // Niveau terminé !
        console.log(`Level ${level} completed! Unlocking level ${level + 1}`); // Debug log
        setGameState('victory');
        // Débloquer le niveau suivant
        unlockLevel(level + 1);
      }
    }
  }, [enemySystemEnemies, gameState, level, unlockLevel]);

  // Nettoyer les ennemis morts
  useEffect(() => {
    const now = Date.now();
    const filteredEnemies = enemySystemEnemies.filter((enemy: any) => {
      if (enemy.isDying && !enemy.isAlive) {
        return now - (enemy.lastMoveTime || 0) < 2000;
      }
      return true;
    });

    if (filteredEnemies.length !== enemySystemEnemies.length) {
      setEnemySystemEnemies(filteredEnemies);
      enemySystemRef.current = filteredEnemies;
    }
  }, [enemySystemEnemies, setEnemySystemEnemies, enemySystemRef]);

  // Timer du jeu
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Mettre à jour les dimensions de la carte quand la fenêtre change de taille
  useEffect(() => {
    const handleResize = () => {
      setMapDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  return {
    // États du jeu
    gameState,
    score,
    level,
    playerHealth,
    gameTime,
    
    // Entités du jeu
    playerPosition,
    enemies: enemySystemEnemies,
    projectiles: enemyProjectiles,
    bullets,
    hearts, // Nouveau: coeurs à collecter
    
    // Configuration
    mapWidth: mapDimensions.width,
    mapHeight: mapDimensions.height,
    
    // Actions du jeu
    startGame,
    endGame,
    backToMenu,
    goToLevelSelect,
    isLevelUnlocked,
    unlockLevel,
    movePlayer,
    setPlayerPosition,
    handleShoot,
    addScore,
    triggerAttack,
    setPlayerDirection,
    
    // États d'attaque
    isAttacking,
    attackFrame,
    
    // Utilitaires
    takeDamage,
    
    // Fonctions de mise à jour des entités
    setEnemies: setEnemySystemEnemies
  };
};