import { useState, useEffect, useRef, useCallback } from 'react';
import { Position, GameState, HeartPickup } from '../types';
import { TOP_LIMIT, BOTTOM_LIMIT, LEFT_LIMIT, RIGHT_LIMIT } from '../constants';
import { usePlayerMovement } from './usePlayerMovement';
import { useEnemySystem } from './useEnemySystem';
import { useBulletSystem } from './useBulletSystem';
import { useAttackSystem } from './useAttackSystem';

// Clés pour le localStorage
const STORAGE_KEYS = {
  UNLOCKED_LEVELS: 'game_unlocked_levels',
  CURRENT_LEVEL: 'game_current_level'
};

// Fonction pour charger la progression depuis le localStorage
const loadGameProgress = () => {
  try {
    const savedUnlockedLevels = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVELS);
    const savedCurrentLevel = localStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL);
    
    return {
      unlockedLevels: savedUnlockedLevels ? JSON.parse(savedUnlockedLevels) : [1],
      currentLevel: savedCurrentLevel ? parseInt(savedCurrentLevel, 10) : 1
    };
  } catch (error) {
    console.warn('Erreur lors du chargement de la progression:', error);
    return {
      unlockedLevels: [1],
      currentLevel: 1
    };
  }
};

// Fonction pour sauvegarder la progression dans le localStorage
const saveGameProgress = (unlockedLevels: number[], currentLevel: number) => {
  try {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, JSON.stringify(unlockedLevels));
    localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, currentLevel.toString());
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde de la progression:', error);
  }
};

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
  
  // Charger la progression sauvegardée au démarrage
  const initialProgress = loadGameProgress();
  
  // États du jeu
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(initialProgress.currentLevel);
  const [playerHealth, setPlayerHealth] = useState(10);
  const [gameTime, setGameTime] = useState(0);
  const [playerDirection, setPlayerDirection] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(initialProgress.unlockedLevels);
  
  // État des coeurs
  const [hearts, setHearts] = useState<HeartPickup[]>([]);
  const heartsRef = useRef<HeartPickup[]>([]);
  const lastHeartSpawnTime = useRef(0);
  const nextHeartId = useRef(1);
  
  // État d'invincibilité
  const [isInvincible, setIsInvincible] = useState(false);
  const invincibilityEndTime = useRef(0);
  const isInvincibleRef = useRef(false);
  
  // Position initiale du joueur (centre de l'écran en pourcentages)
  const initialPlayerPos: Position = { 
    x: 50, // 50% de la largeur
    y: 50  // 50% de la hauteur
  };

  // Sauvegarder automatiquement la progression quand elle change
  useEffect(() => {
    saveGameProgress(unlockedLevels, level);
  }, [unlockedLevels, level]);

  // Fonction pour générer un pickup (coeur ou bouclier) à une position aléatoire
  const spawnPickup = useCallback(() => {
    const now = Date.now();
    
    // Utiliser les limites exactes définies dans les constantes
    // Ajouter une marge de sécurité pour éviter les bords
    const marginX = 3; // Marge supplémentaire horizontale
    const marginY = 3; // Marge supplémentaire verticale
    
    const minX = LEFT_LIMIT + marginX;
    const maxX = RIGHT_LIMIT - marginX;
    const minY = TOP_LIMIT + marginY;
    const maxY = BOTTOM_LIMIT - marginY;
    
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;
    
    // 50% de chance d'être un coeur, 50% d'être un bouclier
    const pickupType: 'heart' | 'shield' = Math.random() < 0.5 ? 'heart' : 'shield';
    
    const newPickup: HeartPickup = {
      id: nextHeartId.current++,
      x,
      y,
      spawnTime: now,
      type: pickupType
    };
    
    setHearts(prev => {
      const updated = [...prev, newPickup];
      heartsRef.current = updated;
      return updated;
    });
    
    lastHeartSpawnTime.current = now;
  }, []);

  // Fonction pour collecter un pickup (coeur ou bouclier)
  const collectPickup = useCallback((pickupId: number) => {
    setHearts(prev => {
      const pickup = prev.find(p => p.id === pickupId);
      const updated = prev.filter(p => p.id !== pickupId);
      heartsRef.current = updated;
      
      // Appliquer l'effet selon le type de pickup
      if (pickup) {
        if (pickup.type === 'heart') {
          // Soigner le joueur de 2 HP
          setPlayerHealth(prev => Math.min(10, prev + 2)); // Maximum 10 HP
        } else if (pickup.type === 'shield') {
          // Activer l'invincibilité pendant 5 secondes
          console.log('Bouclier collecté - invincibilité activée pour 5 secondes');
          setIsInvincible(true);
          isInvincibleRef.current = true;
          invincibilityEndTime.current = Date.now() + 5000; // 5 secondes
        }
      }
      
      return updated;
    });
  }, []);

  // Terminer le jeu
  const endGame = useCallback(() => {
    setGameState('gameover');
  }, []);

  // Gérer les dégâts au joueur
  const takeDamage = useCallback((damage: number = 1) => {
    // Vérifier si le joueur est invincible en temps réel
    if (isInvincibleRef.current) {
      console.log('Joueur invincible - dégâts ignorés:', damage);
      return; // Ne pas prendre de dégâts si invincible
    }
    
    console.log('Joueur prend des dégâts:', damage, 'Invincible:', isInvincibleRef.current);
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
    (damage: number = 1) => takeDamage(damage), // Système de dégâts unifié
    () => isInvincible // Passer une fonction qui vérifie l'invincibilité en temps réel
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
        spawnPickup();
      }
    }, 1000); // Vérifier chaque seconde

    return () => clearInterval(interval);
  }, [gameState, spawnPickup]);

  // Vérifier les collisions entre le joueur et les coeurs
  useEffect(() => {
    if (gameState !== 'playing') return;

    const playerCollisionRadius = 3; // Rayon de collision du joueur

    heartsRef.current.forEach(pickup => {
      if (checkCollision(playerPosition, pickup, playerCollisionRadius)) {
        collectPickup(pickup.id);
      }
    });
  }, [playerPosition, gameState, collectPickup]);

  // Gérer la fin de l'invincibilité
  useEffect(() => {
    if (!isInvincible) return;

    console.log('Effet d\'invincibilité démarré, fin prévue à:', new Date(invincibilityEndTime.current));
    
    const checkInvincibility = () => {
      const now = Date.now();
      if (now >= invincibilityEndTime.current) {
        console.log('Invincibilité terminée');
        setIsInvincible(false);
        isInvincibleRef.current = false;
      }
    };

    const interval = setInterval(checkInvincibility, 100); // Vérifier toutes les 100ms
    return () => clearInterval(interval);
  }, [isInvincible]);

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
    setIsInvincible(false); // Réinitialiser l'invincibilité
    isInvincibleRef.current = false;
  }, [resetPlayer, setEnemySystemEnemies, enemySystemRef]);

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
        const newUnlockedLevels = [...prev, levelNumber];
        return newUnlockedLevels;
      }
      return prev;
    });
  }, []);

  // Continuer le jeu (reprendre au niveau suivant non terminé)
  const continueGame = useCallback(() => {
    // Trouver le niveau le plus élevé débloqué pour continuer
    const highestUnlocked = Math.max(...unlockedLevels);
    startGame(highestUnlocked);
  }, [unlockedLevels, startGame]);

  // Réinitialiser la progression
  const resetGameProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.UNLOCKED_LEVELS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_LEVEL);
      
      setUnlockedLevels([1]);
      setLevel(1);
      setGameState('menu');
    } catch (error) {
      console.warn('Erreur lors de la réinitialisation:', error);
    }
  }, []);

  // Fonctions utilitaires pour la progression
  const hasGameProgress = useCallback(() => {
    return unlockedLevels.length > 1 || unlockedLevels[0] !== 1;
  }, [unlockedLevels]);

  const getProgressPercentage = useCallback(() => {
    const maxLevel = 9; // Ajustez selon le nombre total de niveaux
    return Math.round(((unlockedLevels.length - 1) / (maxLevel - 1)) * 100);
  }, [unlockedLevels]);

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
        if (level < 9) { // Ajustez selon le nombre total de niveaux
          unlockLevel(level + 1);
        }
        
        // Envoyer l'événement de completion si c'est le dernier niveau
        if (level === 9) { // Ajustez selon le dernier niveau
          const completionEvent = {
            type: 'BLOCK_COMPLETION',
            blockId: 'dungeon-crawler-game',
            completed: true,
            score: level,
            maxScore: 9,
            timeSpent: gameTime,
            data: {
              unlockedLevels,
              finalLevel: level
            }
          };
          
          window.postMessage(completionEvent, '*');
          window.parent.postMessage(completionEvent, '*');
        }
      }
    }
  }, [enemySystemEnemies, gameState, level, unlockLevel, gameTime, unlockedLevels]);

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
    isInvincible,
    
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
    continueGame,
    endGame,
    backToMenu,
    goToLevelSelect,
    isLevelUnlocked,
    unlockLevel,
    resetGameProgress,
    hasGameProgress,
    getProgressPercentage,
    movePlayer,
    setPlayerPosition,
    handleShoot,
    addScore,
    triggerAttack,
    setPlayerDirection,
    
    // États d'attaque
    isAttacking,
    attackFrame,
    
    // États de progression
    unlockedLevels,
    
    // Utilitaires
    takeDamage,
    
    // Fonctions de mise à jour des entités
    setEnemies: setEnemySystemEnemies
  };
};